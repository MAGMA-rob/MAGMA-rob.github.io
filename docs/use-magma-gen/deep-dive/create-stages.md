---
sidebar_position: 6
title: Create Stages
description: Detailed tutorial on how to define MAGMA stages, situations, goals, predicates, and text-only verification.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Stages (Detailed)

This tutorial explain how to define action stages and text-only stages, specify success criteria, and compose stages into larger task flows.

For the conceptual explanation, see [Tasks and Stages](../../core-concepts/tasks.md).

If you want the shortest path first, start with [Create a Stage (Lightweight)](./create-stages-light.md).
This page keeps the full stage model, verification paths, and advanced patterns.

After defining your tools API, the next step is to define your stages. This is a very important distinction in MAGMA:

- tools represent actions
- stages represent objectives

A tool tells the system what the robot can do. A stage tells the system what must be achieved before moving to the next part of the task.

## Stage in one sentence

A stage is one objective inside a task.

It defines:

- the initial conversational context (`Situation`)
- how many steps the model should use
- how success or failure is verified
- whether the environment is reset when the stage ends

## The base class

All stages inherit from `BaseTaskStage`.

The required stage attributes are:

- `target_steps`
- `goals`
- `acceptance_steps`
- `situation`
- `stage_goal_description`

The base class also supports:

- `reset_at_end`
- `additive_stage`
- `verification_prompt`

### Stage timing and budget

Every stage declares:

- `target_steps`
- `acceptance_steps`

These values define the expected action budget for the stage.

#### `target_steps`

This is the ideal number of model steps for solving the stage.

#### `acceptance_steps`

This is the tolerated overflow beyond `target_steps`.

So:

- below or equal to `target_steps` means optimal
- between `target_steps` and `target_steps + acceptance_steps` means still acceptable
- above that means exceeded

This stage budget is used by `BaseTask.get_stage_state(...)`. When a stage is completed inside the acceptable zone, it is sent to [**coaching mechanism**](../running-generation/key-systems.md#3-intelligent-coaching).

:::note
These values do not define success by themselves. They define how efficient the solution is expected to be. Real success still comes from stage verification.
:::

### `reset_at_end` and stage transitions

Each stage also defines:

```python
reset_at_end = True or False
```

When a stage finishes:

- if `reset_at_end=True`, MAGMA restores the environment to the task's default initial state before preparing the next stage
- then the next stage's `build_init_state(...)` is applied

This is handled by `BaseTask.call_stage_change_effects(...)`.

Use `reset_at_end=True` when stages are independent episodes of the same environment. Notably when the stage objective implies to have sorted all objects in a certain cofiguration, but you want to be able to continue the interaction after.

Use `reset_at_end=False` when the next stage should continue from the current physical state.

### The minimum contract

At a high level, a valid stage must define:

1. a `Situation`
2. either a list of `goals`, or a custom `verif_log_completion(...)`, or a `verification_prompt`
3. `target_steps` and `acceptance_steps`
4. a `stage_goal_description`

The validation logic in `BaseTaskStage.validate(...)` enforces an important rule:

- if a stage defines `verification_prompt`, it is considered text-only
- a text-only stage must not define goals
- a text-only stage must not override `verif_log_completion(...)`

So in practice, MAGMA currently supports two main stage families:
- goal/log-based stages
- text-only stages

## Stage types

<Tabs>
<TabItem value="goal" label="Goal stage">

A goal stage is verified from:

- environment predicates in `goals`
- optional stage logs in `verif_log_completion(...)`

This is the standard stage type for physical tasks.

</TabItem>
<TabItem value="text" label="Text-only stage">

A text-only stage is verified from:
- a `verification_prompt`
- the model's textual answer

It is used for things like:
- asking for missing information
- checking that the model understood a user constraint
- forcing a refusal or a specific explanation

</TabItem>
</Tabs>

## `Situation`: the initial context of a stage

Each stage has a `Situation`.

This is the initial conversational and semantic state for that stage.

```python
class Situation:
    memory: List[str]
    preserved_memory_indices: List[int]
    attributes: Dict[str, Any]
    instruction: Instruction
    history: Optional[List]
    user_scenario: str
    flag_answer_to_user: bool
```

### What each field means

| Field | Role |
| --- | --- |
| `memory` | What the model should remember at the beginning of the stage |
| `preserved_memory_indices` | Which memory entries are fixed/preserved |
| `attributes` | Structured task data available to the model and tools |
| `instruction` | The current user instruction |
| `history` | Optional previous conversation history |
| `user_scenario` | Optional scenario used by user simulation |
| `flag_answer_to_user` | Whether the model is expected to produce a final answer to the user at this stage |

### Why `Situation` matters

The stage does not only define physical success.
It also defines what the model knows and what the user just asked.

That is why stages sit exactly between:

- tools, which act on the environment
- tasks, which sequence objectives

<!-- ## `Situation.copy_with(...)`, `mix_with(...)`, and continuation

The `Situation` class also supports utilities to derive new situations cleanly:

- `copy_with(...)`
- `mix_with(...)`

These are useful when:

- a later stage keeps most of the previous memory
- attributes have changed
- the instruction must be replaced

By default, `mix_with(...)` lets you override:

- memory
- history
- instruction
- attributes

### `InterruptSituation`

`InterruptSituation` is a specialized `Situation` used when you explicitly want to keep the current query instead of overriding it in the normal way.

You probably do not need it for most custom scenarios, but it exists for interruption-like flows. -->

### Instructions inside a `Situation`

MAGMA supports several instruction types:

- `UserInstruction`
- `EmptyInstruction`
- `TemplateInstruction`
- `StatusReturn`

In most custom stages, you will mainly use:

- `UserInstruction("...")`
- `EmptyInstruction()`

#### `UserInstruction`

Use it when the stage starts with a fresh user request.

```python
instruction = UserInstruction("Please sort the valve into area3.")
```

#### `EmptyInstruction`

Use it when the new stage should continue from the previous interaction, without injecting a new user message.

This is common in multi-step action chains. Exemple: The instruction ask to do X then Y, so stage 0 correspond to verifying X and stage 1 verifying Y and stage 1 do not require an instruction at it will be automatically derived from the real return status from stage 0 execution.

:::warning
An `EmptyInstruction` is only safe when the previous stage does not require a final answer to the user. `BaseTask.validate()` explicitly checks this.
:::

## How `flag_answer_to_user` works

`flag_answer_to_user` tells MAGMA whether the model is supposed to end the stage by answering the user.

In practice:

- `True` means the stage should lead to a proper user-facing answer
- `False` means the stage is more internal or transitional

#### Typical use

If you split one user request into several internal stages:
- intermediate stages usually have `flag_answer_to_user=False`
- the last stage often has `flag_answer_to_user=True`

This is exactly what happens when several stages are chained:
- first stage: consume the user instruction
- next stages: use `EmptyInstruction()`
- only the last stage asks for a final answer to the user

:::tip
Think of `flag_answer_to_user` as a boundary between "internal stage progression" and "the model must now close the loop with the user".
:::

## Stage initialization

Besides conversational setup, a stage may also customize the physical state of the environment at the beginning of that stage.

For that, `BaseTaskStage` provides:

```python
def build_init_state(self, env_state: Dict, env_ids: torch.Tensor) -> Dict:
    return env_state
```

The default implementation does nothing.

Override it when a stage requires a custom scene setup, for example:

- place a specific object in a specific area
- reset only part of the environment
- prepare a benchmark-specific configuration

The important rule is:
- keep the same structure as the original env state
- only modify values, not the overall schema

For many scenarios, you will **not need to override this hook**.

## How stage verification works in practice

There are two different verification paths.

<Tabs>
<TabItem value="goal-stage" label="Goal/log stage">

For a normal action stage:

1. tools execute
2. tool verifiers may emit logs
3. `BaseTask.verif_stage_env_completion(...)` checks environment predicates
4. `BaseTask.verif_stage_log_completion(...)` checks logs
5. `combine_stage_verif_scores(...)` merges both scores

Default combination logic is:
- `-1` if env or log score is `-1`
- `1` only if both are `1`
- `0` otherwise

</TabItem>
<TabItem value="text-stage" label="Text-only stage">

For a text-only stage:

1. the model should not call any tool
2. the system checks that the tool call is empty
3. the executor builds a `JudgePayload`
4. an external model judges the answer against `verification_prompt`
5. if verdict is true, the stage finishes and the next stage starts

In this branch, there is no environment predicate verification.

</TabItem>
</Tabs>

## Goal predicates: objective verification for action stages

Action stage are using `BaseGoal` to verify the physical state of the env. You can combine it with some `Logs` Verification.

### `BaseGoal`

Every predicate inherits from `BaseGoal` and implements:

```python
def verify(self, obs: Dict) -> torch.Tensor:
```

The return convention is:

- `1` -> goal satisfied
- `0` -> not yet satisfied
- `-1` -> failure / violation

This is why they are called predicates here: they are boolean-like checks with an additional failure state.

### Example: Goal Templates

The warehouse sorting stages already use:

- `At(obj, location)`
- `NotAt(obj, forbidden_locations, strict=True)`

#### `At`

`At(obj, location)` checks that an object is inside a target area.

#### `NotAt`

`NotAt(obj, locations, strict=True)` checks that the object is not in forbidden areas.

If the object enters a forbidden area:

- it returns `-1` when `strict=True`
- it can return `0` when `strict=False`

That makes `NotAt` a failure predicate.

### How stage goals are combined

Inside `BaseTaskStage._verif_env_completion(...)`, MAGMA:

1. starts with a tensor full of `1`
2. calls `goal.verify(obs)` for every goal
3. combines them with `torch.minimum(...)`

So the final stage env score is:

- `1` only if every goal is satisfied
- `-1` if at least one goal returns `-1`
- `0` otherwise

This is a clean pattern:

- positive predicates define success conditions
- failure predicates define forbidden states

### Example: warehouse sorting stage

The `ObjectToZone` stage in `warehouse_sorting/stages.py` is a good example.

It builds goals like:

- `At(obj, target_area)`
- `NotAt(obj, all_other_areas, True)`

This means:

- the object must end in the correct area
- the object must not end in the wrong ones

That is a very good stage design pattern for sorting tasks.

## Stage logs: verifying what happened

Predicates verify the environment state.
Logs verify what happened during the stage.

This is useful when:
- a specific tool must be used
- a specific tool must not be used
- an attribute must be added or removed
- a manufacturing order must be recorded

### Where logs come from

The flow is:

1. a tool executes
2. its `verifier(...)` returns a `ToolResult`
3. `ToolResult` may contain a `Log`
4. the executor stores this log
5. the stage receives:
   - `full_log`: all logs so far
   - `stage_log`: only logs produced during the current stage

Each `Log` can carry:
- `function`
- `content`
- `action`

The function name is automatically filled by MAGMA when the tool verifier is called. That means stages can verify things like:
- was `launch_cycle` called?
- was an attribute added?
- was the right manufacturing order logged?

### `verif_log_completion(...)`

Stages can override:

```python
def verif_log_completion(self, stage_log: List[Log], full_log: List[Log]) -> int:
```

It uses the same score system:

- `1` -> log verification passed
- `0` -> not enough evidence yet
- `-1` -> catastrophic failure

### Examples : Logs

#### 1: forbid one tool

In `ObjectToZone`, the stage rejects the use of `launch_cycle`:

```python
def verif_log_completion(self, stage_log, full_log) -> int:
    for l in stage_log:
        if l.function == "launch_cycle":
            return -1
    return 1
```

This is very useful when the stage objective is not only "end in the right state", but also "solve it with the right type of action".

#### 2: verify an attribute modification

`ModifAttributesBaseStage` verifies the last stage log:

- correct `action` (`ADD` or `REMOVE`)
- correct `content`, like `("target_areas", "area7")`

So this stage is really checking that the correct tool call produced the correct semantic side effect.

### How the executor verifies action goals

For a normal stage, the verification path is mechanical:

1. slice the batched observation to the relevant envs
2. call `stage._verif_env_completion(obs)`
3. that calls every `goal.verify(obs)`
4. collect the stage logs
5. call `stage.verif_log_completion(stage_log, full_log)`
6. merge both with `combine_stage_completion(...)`

So:

- predicates answer "is the objective satisfied in the environment?"
- logs answer "was the stage solved the right way?"

That is the core design philosophy of stages.

## The link with additive stages

By default, stages are not allowed to modify task attributes.

This is enforced in `BaseTask.verif_stage_log_completion(...)`:

- if the stage is not `additive_stage`
- and a stage log contains `action != None`
- then the stage fails with `-1`

This is a very important safeguard.

It prevents the model from modifying attributes during a stage that was not supposed to be about memory or knowledge-base updates.

:::warning
If your stage is meant to add or remove attributes through tool logs, set `additive_stage = True` or inherit from `ModifAttributesBaseStage`.
:::

## Text-only stages in more detail

A text-only stage is recognized by the presence of:

```python
self.verification_prompt = "..."
```

This prompt is not a user message.
It is a verification rule used to judge whether the model's answer is acceptable.

### Common text-only use cases

- asking for missing information
- checking that the model understood a restriction
- checking that the model refused an impossible request
- checking that the model answered a simple factual question from the current context

### Example templates

The codebase already provides stage templates for this:

- `AskingBaseStage`
- `ConstraintBaseStage`

Both create a `Situation`, set `flag_answer_to_user=False`, and define a `verification_prompt`.

### How the executor verifies text-only stages

The important point is:

- text-only stages are not verified through environment state
- they are verified through a judge model

In `magma-gen`, the generation executor does the following:

1. detect that the current stage is text-only
2. ensure the tool call is fully empty
3. fetch the rule with `task_ref.get_stage_rule(stage_id)`
4. build a `JudgePayload(rule=..., model_answer=...)`
5. send it to the worker
6. parse the returned JSON verdict

If the verdict is true:

- the stage is marked finished
- MAGMA advances to the next stage

If the model tries to call a non-empty tool on a text-only stage:

- the stage is treated as a catastrophic failure

:::info
In evaluation mode, text-only stages are skipped by `ToolsTestingExecutor` because they cannot be verified from raw environment state alone.
:::

## Recommended stage design pattern

When defining your own stage, a very good workflow is:

1. define the objective in plain English
2. decide whether it is:
   - a physical/action stage
   - a text-only stage
3. define the `Situation`
4. for action stages:
   - add positive predicates for success
   - add failure predicates for forbidden states
   - optionally add log checks
5. for text-only stages:
   - define a precise `verification_prompt`
   - make sure the model should not call tools

### Simple custom goal stage

Here is a compact example:

```python
from magma_core.base.stage import BaseTaskStage
from magma_core.base.data_structures import Situation, UserInstruction
from magma_core.base.goals import At, NotAt


class PutValveInArea3(BaseTaskStage):
    target_steps = 2
    acceptance_steps = 1

    def __init__(self):
        goals = [
            At("valve", "area3"),
            NotAt("valve", ["area1", "area2", "area4", "area5"], True),
        ]
        super().__init__(
            goals=goals,
            reset_at_end=True,
            stage_goal_description="Put the valve into area3.",
        )

        self.situation = Situation(
            memory=["You are in charge of sorting objects in a factory."],
            preserved_memory_indices=[0],
            attributes={
                "objects": ["valve"],
                "target_areas": ["area1", "area2", "area3", "area4", "area5"],
            },
            instruction=UserInstruction("Please put the valve in area3."),
            flag_answer_to_user=True,
        )
```

### Simple custom text-only stage

```python
from magma_core.base.stage import BaseTaskStage
from magma_core.base.data_structures import Situation, UserInstruction


class AskForClipboardArea(BaseTaskStage):
    target_steps = 1
    acceptance_steps = 0

    def __init__(self):
        super().__init__(
            goals=[],
            reset_at_end=True,
            stage_goal_description="The model must ask the user where the clipboard should go.",
        )

        self.situation = Situation(
            memory=["You are in charge of sorting objects in a factory."],
            preserved_memory_indices=[0],
            attributes={"objects": ["clipboard"], "target_areas": ["area1", "area2", "area3"]},
            instruction=UserInstruction("Please sort the clipboard."),
            flag_answer_to_user=False,
        )

        self.verification_prompt = (
            "The model must explain that it needs the target area for the clipboard before acting."
        )
```

### When to override `combine_stage_completion(...)`

The default logic is usually enough:

- fail if env or log verification fails
- succeed only if both succeed

Override it only if your stage has unusual semantics, for example:

- a log-only stage
- a stage where env completion is irrelevant
- a stage with more permissive merge logic

For most scenarios, you should not need to override it.

## Best practices

- Keep stages objective-oriented, not action-oriented.
- Use tools to express capabilities and stages to express success.
- Prefer several small predicates over one opaque custom check.
- Use `NotAt(..., strict=True)` for forbidden states when failure should be immediate.
- Use `verif_log_completion(...)` when "how it was solved" matters.
- Keep `_get_obs_extra(...)` keys in the env aligned with the names used in goals.
- Use `EmptyInstruction()` only for true continuation stages.
- Use `flag_answer_to_user=True` only when the stage should end with a proper user-facing answer.

## Common pitfalls

### 1. Mixing actions and objectives

A stage should not say "call tool X".
It should say "make condition Y true".

If you need to force or forbid a tool, do it through log verification.

### 2. Defining goals on a text-only stage

If you set `verification_prompt`, do not also define `goals`.

### 3. Forgetting log validation when method matters

If the final state can be reached in several ways, and only some are allowed, add `verif_log_completion(...)`.

### 4. Using attribute-modifying tools in a non-additive stage

MAGMA will treat that as a failure.

### 5. Ending a stage with `flag_answer_to_user=True` and starting the next one with `EmptyInstruction()`

That is invalid and caught by task validation.

## Summary

To create a MAGMA stage:

1. decide the objective
2. build a `Situation`
3. choose between:
   - goal/log verification
   - text-only verification
4. define `target_steps`, `acceptance_steps`, and `stage_goal_description`
5. add predicates and log checks if it is an action stage
6. add `verification_prompt` if it is a text-only stage

The key mental model is:

- tools are actions
- stages are objectives

Once you keep that separation clear, stage design becomes much easier and much more robust.
