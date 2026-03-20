---
sidebar_position: 6
title: Allow dynamic attribute updates
description: Learn how to let tools add or remove task attributes during a scenario.
---

# Allow dynamic attribute updates

Use this pattern when the user can change the task vocabulary during the interaction:
- "Add a new `area4` to your system."
- "Remove `area2` from your known areas."

The agent must be capable of modyfing its internal state according to this. Attributes modification must pass by tools and templates are provided for **Add and Remove operations**.

## What to define

There is two steps to follow to allows agents to modify attributes in a stage.

### 1. A tool must emit an attribute log

You have designated tool for attributes modification. Exemple: `add_new_location(...)` and `remove_location(...)`.
The verifier of these tools must return a `Log` with an `action`. The rest of the tool code is mostly veryfing that the passed arguments are valid.

```python
def add_new_location(self, obs : Observation, env_id : int, params: Dict) -> ToolExecution:
        poses = []
        location_name = params["location_name"]
        r = ""

        def verifier(new_obs: Dict) -> ToolResult:
            return ToolResult(True, reason=f"{location_name} was added to known areas" ,logs=Log(content=("target_areas",location_name),action="ADD"))
        
        if location_name in obs.task_attributes['target_areas']:
            r = f"{location_name} already exist! If you want to create a new area, please choose a non-existing name."
        else:
            poses = ["OK"] # To avoid counting this tool as en error
            
        return ToolExecution(poses=poses, verifier=verifier, reason=r)
```
:::danger
As soon as you provide an action to the log, the content must be structured as a tuple `(attribute_key_name, value)`. This not anymore a free form content. Thanks to this, the modification is automatically handled by the systems.
:::
### 2. The stage must allow attribute changes

Do not use a normal stage for this. Use `ModifAttributesBaseStage`:

```python
class ModifAttributesBaseStage(BaseTaskStage):

    target_steps = 1
    acceptance_steps = 0

    additive_stage = True # VERY IMPORTANT

    def __init__(
            self,
            mode : Literal["ADD","REMOVE"],
            instruction : Instruction,
            val_name : str,
            att_name : str,
            memory: List[str],
            preserved_memory_indices : List[int],
            attributes : Dict,
            flag_answer_to_user : bool,
        ) -> None:
        goal = f"The goal is that the robot call the correct function to add {val_name} to its {att_name}."
        super().__init__([],True, goal)
        self.situation = Situation(
            memory,preserved_memory_indices,attributes, instruction, flag_answer_to_user=flag_answer_to_user
        )
        self.val_name = val_name
        self.att_name = att_name
        self.mode = mode

    def verif_log_completion(self, stage_log : List[Log], full_log : List[Log]) -> int:
        if len(stage_log) == 0: return 0
        if stage_log[-1].action == self.mode:
            if stage_log[-1].content == (self.att_name, self.val_name): return 1
        return -1
```

These stages are marked as `additive_stage = True` and implement common verification that you do not need to reimplement. You can also define custom wrapper around to avoid passing each arguments depending on your case:

```python title="Exemple from warehouse_sorting"
class AddLocationStage(ModifAttributesBaseStage):

    def __init__(self, instruction: Instruction, val_name: str, memory: List[str], flag_answer_to_user: bool = True) -> None:
        super().__init__("ADD", instruction, val_name, "target_areas", memory, [], TASK_ATTRIBUTES, flag_answer_to_user)
```

:::warning
If a stage is not additive and one of its logs contains `action="ADD"` or `action="REMOVE"`, MAGMA treats that as a failure. This is done to directly detects bad call from the agent (e.g modying attributes whereas you asked for something else).
:::

### Important considerations

#### Static environment constraint
Objects and attributes cannot be created or removed dynamically at runtime.  Maning that all actor must already exist in the environment. They can simply be hidden from the agent by not exposing them in the task attributes.

#### Environment vs task attributes
- `obs.maniskill_obs`: contains poses from all objects present in the environment (including hidden ones), exposed via _get_obs_extra().
- `obs.task_attributes`: contains only the subset of elements name that are exposed to the agent.

The agent must **only rely on `obs.task_attributes`** when interacting with the environment.

#### Validation in tools
When implementing tools, always verify that the inputs provided by the agent correspond to exposed attributes (i.e. present in `obs.task_attributes`). This prevents the agent from using hidden or masked elements.

#### Example: `warehouse_sorting`
The environment contains 5 areas, all initialized at reset and present in `obs.maniskill_obs`.  
However, only 3 areas are exposed in `obs.task_attributes`.

If the agent tries to use an area:
- You must check that the area exists in `obs.task_attributes`
- If not, reject the action

#### Custom reset logic
You can implement a custom reset strategy to place unused objects outside the robot workspace. This allows simulating dynamic availability while respecting the static environment constraint.


## Use with Task Definition
In task-definition flows, we provide a base [requests](../deep-dive/create-tasks-definition.md#requests-the-generation-time-building-blocks) class : `BaseAttributesModifRequest`. You also have more dedicated template in `magma_scnearios.template.requests`, allowing you to just define a simple request without coding the common logic. The logic is to fill `att_state` with the updated attributes in your custom Request.

```python
class BaseAttributesModifRequest(BaseRequest):

    att_state : Dict

    def __init__(self, modifiable_task_attributes : Dict[str,Any]) -> None:
        """
        Pass the dict of attributes {name:list of values} that you want to modify
        """
        super().__init__()
        self.attributes = modifiable_task_attributes
        self.att_state = {}

    def sampling_weight(self, state: TaskState) -> float:
        for entity_name, entity_val in self.attributes.items():
            if type(entity_val) == type(state.attributes[entity_name]):
                return 1
            else:
                raise ValueError(f"Incompatible type between task_attributes {entity_val} and entities {state.attributes[entity_name]} from state")
        return 0
    
    def apply_request(self, state: TaskState) -> TaskState:
        c = AttributesModifConstraint(copy.deepcopy(self.att_state))
        c.apply(state)
        return super().apply_request(state)
    
    def force_state_recompute(self) -> bool:
        return True
```

Similarly to [Constraints Requests](./constraint-cycle.md#use-with-task-definition), the idea is to create a `BaseConstraint` and to apply it to attributes. We also provide a base implementation for attributes modification. Like this, the attributes modification is correctly applied to the Task State and maintained even after state recompute.

:::danger
**NEVER MODIFY** the state directly inside requests. Only **Constraints** components must modify task state.
:::

```python title="Exemple with RemoveAreas from warehouse_sorting"
class RemoveAreas(RemoveValueToListRequest):

    def __init__(self, max_update : int = 2) -> None:
        super().__init__(["target_areas"], max_update = max_update)
    
    def create_stages(self, state: TaskState) -> List[BaseTaskStage]:
        
        n = random.randint(1,self.max_update)

        all_modif = []
        self.att_state = deepcopy(state.attributes)

        for _ in range(n):
            out = self._get_random_key_value(["target_areas"], self.att_state)
            if out is None:
                break
            self.att_state[out[0]].remove(out[1])
            all_modif.append(out[1])

        stages = []
        if all_modif:
            instruction = f"Please remove {' and '.join(all_modif)} from your knowledge base."
            ins = UserInstruction(instruction)

            for i, area in enumerate(all_modif):
                stages.append(
                    ModifAttributesBaseStage(
                        mode = "REMOVE",
                        instruction=ins,
                        val_name=area,
                        att_name="target_areas",
                        memory=state.memory,
                        preserved_memory_indices=state.preserved_memory_indices,
                        attributes=state.attributes,
                        flag_answer_to_user= i == len(all_modif)-1
                    )
                )
                ins = EmptyInstruction()
        
        return stages
```

As you see here, **we do not modify directly state attributes**, instead we make our modification in `att_state`.

:::tip
Do not forget to test your requests with the [Request Tester](../deep-dive/create-tasks-definition.md#testing)
:::

## More details

- [Log](../deep-dive/create-tools.md#log)
- [Stage logs: verifying what happened](../deep-dive/create-stages.md#stage-logs-verifying-what-happened)
- [The link with additive stages](../deep-dive/create-stages.md#the-link-with-additive-stages)
