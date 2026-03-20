---
sidebar_position: 9
title: Create a Task Definition
description: Detailed guide to defining MAGMA task definitions, task states, requests, constraints, and generation-time task synthesis.
---

# Create a Task Definition

This page explains how to build MAGMA task definitions.

For the conceptual explanation, see [Tasks and Stages](../../core-concepts/tasks.md).

:::danger
Task definitions are the most advanced task-authoring layer currently exposed in the codebase.
- We recommend you to have read all precedent **Deep Dives**.
- Particularly [Create a Task Preset (Detailed)](./create-tasks.md).
- And all Tutorials.
:::

---

## Task definition in one sentence

A task definition is a generator recipe for producing a normal `BaseTask`.

Unlike a preset:

- it does not hand-author `self.stages` directly
- it starts from a `TaskState`
- it exposes a list of `BaseRequest`
- a task generator samples requests, turns them into stages, mutates the latent state, and finally returns a runnable task

:::note
So, if a preset is a fixed stage list, a task definition is a stateful stage factory. Allowing MAGMA-GEN to **generate an unbound set of task** from your tool API, stages and environments.
:::

## Task definition vs task preset

| Aspect | Task preset | Task definition |
| --- | --- | --- |
| Main base class | `BaseTask` | `TaskDefinition` |
| Stage list | Written explicitly in `__init__` | Generated from requests |
| Main abstraction | ordered `stages` | `starting_state` + `active_requests` |
| Runtime object | already a runnable task | first generates a runnable task |
| Best for | fixed curated scenarios | broad families of related scenarios |
| State model | mostly inside stage arguments | explicit latent `TaskState` |

In practice:

- use a preset when you want deterministic authored flows
- use a definition when you want combinatorial task generation from the same scenario logic

---

## The base class

Task definitions inherit from:

```python
from magma_core.base.tasks import TaskDefinition
```

The required fields are:

| Attribute | Role |
| --- | --- |
| `starting_state` | Initial latent task state |
| `env_id` | Environment ID used by the generated task |
| `Tools_cls` | Tools API exposed by the generated task |
| `active_requests` | Catalog of request generators |

The constructor also accepts optional task metadata:

| Argument | Role |
| --- | --- |
| `name` | Optional name of the generated task |
| `all_task_attributes` | Full attribute universe, if larger than `starting_state.attributes` |
| `randomized_config_path` | Optional randomization YAML path |
| `approximal_difficulty` | Difficulty metadata |
| `styles` | TaskStyle metadata |
| `env_options` | Options forwarded to the environment |

## Minimal example

Here is a clean exemple extracted from `warehouse_sorting`:

```python
class SimpleSortingDefinition(TaskDefinition):

    active_requests = [
        AddAreas(AREAS),
        RemoveAreas(),
        MoveOneObjectRequest(),
        GiveObjectAssignmentRequest(max_simultaneous_change=2),
        CycleRequest(),
        CycleWithPermanentRulesRequest()
    ]
    Tools_cls = WithoutManufacturingOrder
    env_id = "SortingCubesWarehouse-v1"

    def __init__(self) -> None:
        self.starting_state = TaskState()
        self.starting_state.attributes = {
            "objects": OBJECTS,
            "target_areas": AREAS
        }

        super().__init__(
            randomized_config_path=str(Path(__file__).parent.joinpath("config.yaml"))
        )
```

This definition does three things:

1. declares the initial state
2. declares which requests may be sampled
3. declares which tools and environment the final generated task will use

## Components

A task definition rely on three concepts: [state](../../core-concepts/tasks.md#task-state), [requests](../../core-concepts/tasks.md#requests) and [constraints](../../core-concepts/tasks.md#constraints)

### The latent state: `TaskState`

Task definitions revolve around `TaskState`.

`TaskState` is the hidden semantic state used to generate new requests and stages.
It is not the ManiSkill environment state.

The current structure is:

```python
class TaskState:
    memory: List
    preserved_memory_indices: List
    attributes: Dict

    relations: Dict
    properties: Dict
    constraints_history: List
```

:::tip
The default implementation is generic enough to work with most scenarios. But you are free to define your own Task State class that inherits from `TaskState`. This class will be passed towards your requests.
:::

#### Field roles

| Field | Role |
| --- | --- |
| `memory` | Latent memory lines that requests may reuse |
| `preserved_memory_indices` | Which memory entries are fixed |
| `attributes` | Current public task vocabulary, such as objects and target areas |
| `relations` | Derived semantic relations, such as object-to-area or type-to-area |
| `properties` | Extra boolean/list facts, such as forbidden objects or forbidden areas |
| `constraints_history` | Replayable persistent constraints that were applied to the state |

#### Current default `relations`

The base implementation initializes:

```python
self.relations = {
    "object_type": {},
    "type_area": {},
    "object_area": {},
}
```

So in the warehouse-sorting family:

- `object_area` stores default assignments like `ref_obj_1 -> area2`
- `object_type` stores category membership like `ref_obj_1 -> Fragile`
- `type_area` stores category rules like `Fragile -> area3`

#### Current default `properties`

The base implementation initializes:

```python
self.properties = {
    "forbidden_objects": [],
    "forbidden_areas": []
}
```

These are used by requests like `CycleRequest` to decide whether to insert refusal or clarification stages before the final cycle stage.

#### `TaskState.clone()` 

`clone()` creates an independent copy of:

- `attributes`
- `memory`
- `preserved_memory_indices`
- `relations`
- `properties`
- `constraints_history`

This is used to keep:

- `base_state`: the clean reference snapshot
- `state`: the evolving current generation state

#### `TaskState.recompute_from_base(...)`

`recompute_from_base(base_state)` is the core repair mechanism after attribute changes.

It works like this:

1. start from a clean clone of `base_state`
2. keep the current root values:
   - `attributes`
   - `memory`
   - `preserved_memory_indices`
3. replay only the constraints that were added after the base snapshot
4. skip any constraint whose `outdated(...)` returns `True`

This matters when a request removes or changes attributes.

Example:
- an older constraint says `ref_obj_1 -> area2`
- later, a request removes `area2` from `state.attributes["target_areas"]`
- after recompute, `ObjectAssignmentConstraint.outdated(...)` returns `True`
- the relation is not replayed anymore

### Requests: the generation-time building blocks

All task-definition requests inherit from `BaseRequest`.

The contract is:

```python
class BaseRequest:
    def sampling_weight(self, state: TaskState) -> float: ...
    def create_stages(self, state: TaskState) -> List[BaseTaskStage]: ...
    def apply_request(self, state: TaskState) -> TaskState: ...
    def force_state_recompute(self) -> bool: ...
```

#### Method roles

| Method | Role |
| --- | --- |
| `sampling_weight(...)` | Decide whether the request is available, and how likely it is |
| `create_stages(...)` | Build one or more stages from the current latent state |
| `apply_request(...)` | Persist latent-state changes for future requests |
| `force_state_recompute(...)` | Ask the generator to rebuild derived state after the update |


:::important
Do not think of a request as just "one stage". A request may:
- generate zero, one, or many stages
- mutate nothing
- mutate relations
- mutate attributes
- trigger a full state recompute

So the correct mental model is: **requests are generation-time transitions that trigger stages creation.**
:::

The core exposes two important request helper families:
- `BaseConstraintRequest`
- `BaseAttributesModifRequest`

Depending on what you want to do, you can inherits from these base implementation to benefits from the common implementation and behavior.

#### `BaseConstraintRequest`

`BaseConstraintRequest` is the helper for persistent user rules.

Its workflow is:

1. `initialize_constraints(state)` prepares:
   - `self.constraints`
   - `self.constraint_msg`
2. `create_stages(...)` returns one `ConstraintBaseStage`
3. `apply_request(...)` applies every constraint to the latent state

The stage part is therefore automatic and text-only.

Use this base class when:
- the user teaches a rule
- that rule should persist in the latent state
- the generated stage is simply "make sure the model understood the rule"

> You just have to define `initialize_constraints()` in which you are setting `constraint_msg` for the constraint stage and create the list of **constraints**.

#### `BaseAttributesModifRequest`

`BaseAttributesModifRequest` is the helper for attribute changes request.

Its workflow is:

1. the subclass computes the next attribute snapshot in `self.att_state`
2. the subclass creates one or more additive stages
3. `apply_request(...)` replaces `state.attributes` with `att_state`
4. `force_state_recompute()` returns `True`

This base class is used for requests like:

- add a new area
- remove an area

:::note
You have also custom templates in `magma_scenarios.templates.request` that define `AddValueToListRequest` and `RemoveValueFromListRequest` which inherits from `BaseAttributesModifRequest`, that you can reuse directly inside your task definition.
:::

### Constraints : Dynamic state influence

Persistent replayable knowledge is represented by `BaseConstraint`.

The base contract is:

```python
class BaseConstraint:
    def apply(self, state: TaskState): ...
    def outdated(self, state: TaskState) -> bool: ...
```

A constraint is added to a request and must be applied to the task state. Base class like `BaseConstraintRequest` already implement the call to each constraints apply method. And the **task generator** will call the outdated.

#### `apply(...)`

The parent implementation already appends the constraint to:

```python
state.constraints_history
```

If you override `apply(...)`, keep the parent call if you want replay support.

> Here you can define custom logic that create/delete/modify relations/properties or any custom field that you have in your state.

#### `outdated(...)`

`outdated(...)` decides whether a constraint should be ignored during recomputation.

This is what lets MAGMA drop stale assignments after attribute changes.

#### Example: `ObjectAssignmentConstraint`

```python title="Template provided"
class ObjectAssignmentConstraint(BaseConstraint):

    def __init__(self, object : str, zone : str) -> None:
        super().__init__()
        self.obj = object
        self.zone = zone

    def apply(self, state: TaskState):
        super().apply(state) # important for register the constraint in the state list.
        all_obj = state.attributes.get("objects", [])
        all_zone = state.attributes.get("target_areas", [])
        if not self.obj in all_obj or not self.zone in all_zone:
            raise RuntimeError(f"The {self.__class__.__name__} failed to be applied")
        state.relations["object_area"][self.obj] = self.zone

    def outdated(self, state: TaskState) -> bool:
        if (not self.obj in state.attributes.get("objects",[]) 
            or not self.zone in state.attributes.get("target_areas",[])):
            return True
        return False
```

It:
- checks that the object still exists in `state.attributes["objects"]`
- checks that the zone still exists in `state.attributes["target_areas"]`
- writes the assignment into `state.relations["object_area"]`
- becomes outdated if either the object or the area disappears

This is the right pattern when a rule should survive future generation steps and participate in recomputation.

## How does the task generation work

The generation path is currently:

1. the scenario registers the definition name under `TASK_DEFINITIONS`
2. `GenerationTaskRunner` loads the definition class
3. the definition is instantiated
4. `TaskGenerator.generate(...)` builds a normal `BaseTask` by sampling request iteratively
5. the generated task is initialized by the executor exactly like a preset task

Several important rules fall directly out of this loop:

### 1. Sampling is state-dependent

Each request is asked:

```python
sampling_weight(state)
```

Requests with weight `0` are unavailable for the current state.
Positive weights control relative sampling probability.

### 2. `create_stages(...)` happens before `apply_request(...)`

This is a very important design point.

A request must build its stages from the current state before its persistent effect is applied.

So:
- `create_stages(...)` defines what the user interaction looks like now
- `apply_request(...)` defines what future requests should see afterwards

If a request needs its own effect to already be visible inside its own stages, it must inject that logic explicitly during `create_stages(...)`. Like this it can sample random stage initialization and modify the state accordingly to this sampling.

:::Danger
You should **NEVER** modify the state outside of a **Constraint.apply()**. Otherwise, in case of task state recomputation, the modification won't persist.
:::

### 3. Attribute-changing requests may trigger state replay

Some request offer the posibility to override `force_state_recompute()` to returns `True`, the generator rebuilds the derived state from the clean base snapshot and replays constraints. 

:::tip
This must be done on request that implies **forgetting constraint** or **modifying attributes**
:::

This is how MAGMA avoids keeping invalid object-to-area relations after attributes were removed.

### 4. The generated output is just a standard task

Once generation is finished:

- `task.stages` is a normal ordered stage list
- `task.validate()` still runs later through `BaseTask.initialize_task(...)`
- executors no longer care whether the task came from a preset or a definition


## Special case: Combine role

To target instruction like *"Do X and remember Y for the rest"*, you can create request that create constraint without create ConstraintStage.

Take a look at this exemple:

```python
class CycleWithPermanentRulesRequest(CycleRequest):

    constraints : list[ObjectAssignmentConstraint]

    def __init__(self, max_object_per_cycle_request: int = 3, max_permanent_rule : int = 2) -> None:
        super().__init__(max_object_per_cycle_request)
        self.max_rules = max_permanent_rule

    def create_stages(self, state: TaskState) -> List[BaseTaskStage]:
        all_objects = state.attributes.get("objects", []).copy()
        all_areas = state.attributes.get("target_areas", [])
        self.constraints = []

        if len(all_objects) <= 0 or len(all_areas) <=0:
            raise RuntimeError(f"Failed to build the stage from {self.__class__.__name__} due to empty objects or areas")
        
        nb_obj = random.randint(1,min(self.max_object, len(all_objects)))
        random.shuffle(all_objects)

        nb_rules = random.randint(1,min(nb_obj,self.max_rules))

        assignement = {}
        for i in range(nb_rules):
            a = random.choice(all_areas)
            assignement[all_objects[i]] = a
            self.constraints.append(ObjectAssignmentConstraint(all_objects[i], a))
        
        
        return self._create_stages(all_objects[:nb_obj], all_areas, state, base_assignement=assignement)
    
    def apply_request(self, state: TaskState) -> TaskState:
        for c in self.constraints:
            c.apply(state)
        return state
```

This request is especially instructive because it demonstrates the `create_stages(...)` / `apply_request(...)` split.

It:

1. samples some new permanent assignments
2. creates `ObjectAssignmentConstraint` objects and stores them on `self.constraints`
3. passes those assignments directly into `_create_stages(...)` which is an helper function to create action stages.
4. only afterwards, in `apply_request(...)`, applies the constraints to the latent state

Why is this necessary?

Because `create_stages(...)` is called before `apply_request(...)`.

So if the generated stages must already talk about the new default assignments, the request must inject them explicitly while creating stages.

## How the generated task becomes a normal runnable task

After generation:

1. `GenerationTaskRunner` receives the generated `BaseTask`
2. the tools executor initializes the environment and tools
3. `BaseTask.initialize_task(...)` stores agents, instantiates `Tools_cls`, builds the first stage state, and calls `validate()`

From that point on, runtime execution is identical to a preset task.

So task definitions affect:

- task synthesis

but not:

- tool execution semantics
- stage verification semantics
- environment execution semantics

### Registration and loading

Like presets, task definitions must be registered in the scenario manifest:

```python
TASK_DEFINITIONS = {
    "SimpleSortingDefinition": "definitions:SimpleSortingDefinition",
    "SortingCategoryDefinition": "definitions:SortingCategoryDefinition",
}
```

The public registry names then become:

- `warehouse_sorting.SimpleSortingDefinition`
- `warehouse_sorting.SortingCategoryDefinition`

`load_definition(...)` resolves these names through `magma_scenarios.registry_loader`.

## Testing

The codebase already ships a very useful helper:

```bash
python -m magma_scenarios.request_tester warehouse_sorting.SimpleSortingDefinition
```

It can:

- list available requests and their current sampling weights
- inspect generated stages for one request
- apply setup requests before the target request
- override the starting state from JSON

This is extremely useful when building task definitions, because most authoring bugs happen in:

- request availability
- latent-state mutations
- recomputation after attribute changes

## Best practices

#### Keep `starting_state` minimal but coherent

Put only the information that should already be true before generation begins. 

#### Use `attributes` for visible vocabulary

Typical examples:

- manipulable objects
- known areas
- known robots

#### Use `relations` for semantic structure

Typical examples:

- object-to-area defaults
- object-to-category mappings
- category-to-area rules

#### Use constraints for state modification

Always modify the state within `BaseConstraint`.

#### Return `force_state_recompute() == True` when attributes may invalidate old constraints

This is especially important for:

- attribute removals
- attribute renamings
- any request that deletes vocabulary used by older constraints

#### Be careful with request-local temporary fields

The generator reuses the request objects stored in `active_requests`.

So if a request stores temporary data on `self`, make sure each call resets or overwrites it correctly.


#### If your task can add hidden values later, think about `all_task_attributes`

`TaskDefinition.build_default_task()` defaults `task.all_task_attributes` to `starting_state.attributes`.

If the full universe is larger than the initial visible state, pass an explicit `all_task_attributes` when constructing the definition.

## Common pitfalls

### 1. Using direct relation mutation when you really need replayable constraints

Always modify the state inside **Constraints**

### 2. Forgetting `force_state_recompute()` after attribute changes

That can leave stale relations in the latent state.

### 3. Forgetting registration in `TASK_DEFINITIONS`

If the scenario manifest is missing the definition, `load_definition(...)` cannot resolve it.

### 4. Letting all requests return weight `0`

If no request is sampleable for the current state, the generator has nothing to choose from.

When adding new request families, always sanity-check that at least one request has a positive `sampling_weight(...)` for the states you expect to reach.

## Summary

Task definitions are MAGMA's advanced generation layer.

They let you author:

- an initial latent state
- a request catalog
- persistence rules
- state recomputation logic

Then the task generator turns that into a normal runnable `BaseTask`.

The most important mental model is:

- presets directly author stages
- definitions author state transitions that synthesize stages

If you keep that separation clear, task definitions become much easier to reason about and much easier to extend.
