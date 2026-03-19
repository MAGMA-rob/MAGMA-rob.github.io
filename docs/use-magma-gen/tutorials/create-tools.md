---
sidebar_position: 3
title: Create a Tool
description: Complete tutorial on how to declare, register, and implement MAGMA tools.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create a tool

This tutorial explains how to create MAGMA tools. The goal is to understand:

- how to write a tools class
- how to declare a tool with `@register_tool`
- what `Observation`, `ToolExecution`, and `ToolResult` are used for
- how to use `verifier`, `redo`, and `Log`
- how the registry is built automatically

## Overview

A MAGMA tool almost always follows this cycle:

1. the model requests a tool call by name and arguments
2. MAGMA looks up that name in the tools class registry
3. arguments are validated automatically against `params_spec`
4. your Python method returns a `ToolExecution`
5. the executor runs the trajectory stored in `poses`
6. at the end, the `verifier` callback is called on the new environment state
7. `verifier` returns a `ToolResult`
8. if `ToolResult.ok == False` and a `redo` exists, MAGMA can recompute a new trajectory and try again

:::tip
A tool does not directly return "success" or "failure". It first returns a `ToolExecution`, meaning an execution plan plus the logic used to verify the result once the action is finished.
:::

The action executes asynchronously and is evaluated later through the verifier.

## The main classes to know

### `Observation`

The tool method receives an `Observation` object:

```python
@dataclass
class Observation:
    selected_robot_name: str
    task_attributes: Dict
    maniskill_obs: Dict
    add_constants: Dict = field(default_factory=lambda: ({}))
```

#### What each field is used for

| Field | Type | Role |
| --- | --- | --- |
| `selected_robot_name` | `str` | Logical name of the robot executing the tool |
| `task_attributes` | `Dict` | Attributes known by the task at the current stage |
| `maniskill_obs` | `Dict` | Raw observation from the environment |
| `add_constants` | `Dict` | Optional constants injected by the task |

#### How to use it in practice

- Use `obs.selected_robot_name` if the behavior depends on the called robot.
- Use `obs.task_attributes` to read object lists, zones, allowed names, and so on.
- Use `obs.maniskill_obs` to access positions, tensors, and raw ManiSkill information.
- Use `obs.add_constants` to retrieve constant values injected by the task.

:::note
Most of the time, a tool's logic mainly relies on `obs.maniskill_obs["extra"]` and `obs.task_attributes`.
:::

#### Be careful about the difference between `obs` and `new_obs`

Inside the tool method, you receive `obs: Observation`.

However, the `verifier(new_obs)` and `redo(new_obs)` callbacks receive a raw `Dict` corresponding to the current environment state, that is, the `maniskill_obs` from the `Observation` object.

<Tabs>
  <TabItem value="tool-body" label="Inside the tool">

```python
def take_obj(self, obs: Observation, env_id: int, params: Dict) -> ToolExecution:
    object_pose = obs.maniskill_obs["extra"]["cube_0"][env_id]
```

  </TabItem>
  <TabItem value="verifier" label="Inside verifier">

```python
def verifier(new_obs: Dict) -> ToolResult:
    object_pose = new_obs["extra"]["cube_0"][env_id]
```

  </TabItem>
</Tabs>

:::warning
`verifier` and `redo` do not directly have access to `task_attributes` or `selected_robot_name`, unless you capture them in the Python closure from the main function.
:::

### `ToolResult`

`ToolResult` represents the final result of the tool once the trajectory has been executed.

```python
@dataclass
class ToolResult:
    ok: bool
    reason: str = ""
    logs: Optional[Log] = None
```

#### Fields

| Field | Type | Role |
| --- | --- | --- |
| `ok` | `bool` | Indicates whether the tool execution was successful |
| `reason` | `str` | Message sent back to the system or the model |
| `logs` | `Optional[Log]` | Persistent information or attribute modifications |

#### When to build it

You build `ToolResult` inside `verifier`.

Classic example:

```python
def verifier(new_obs: Dict) -> ToolResult:
    if not success_condition:
        return ToolResult(False, reason="Failed to grasp the object. You can retry.")
    return ToolResult(True, reason="Object successfully grasped.")
```

#### What `reason` is used for

`reason` is used to explain what happened:

- success: `"Successfully depose cube_0 in area1"`
- business failure: `"The object is still in the gripper"`
- recoverable failure: `"Failed to grasp the cube. You can retry."`

Try to write messages that are useful for a planning agent.

### `Log`

`Log` is optional but very useful for keeping track of information or updating task attributes.

```python
Log(content=("target_areas", location_name), action="ADD")
```

`Log` is used for example to:

- add a new known zone
- remove a known zone
- store a manufacturing order

#### Useful fields

| Field | Role |
| --- | --- |
| `content` | Free-form log content |
| `action` | `ADD` or `REMOVE` to modify list attributes |

:::info
If `action` is `ADD` or `REMOVE`, the expected content is typically a tuple like `(attribute_name, value)`.
:::

### `ToolExecution`

`ToolExecution` is the central class. It is what your method returns.

```python
class ToolExecution:
    def __init__(
        self,
        poses: Trajectory,
        verifier: Optional[Callable[[Dict], ToolResult]],
        redo: Optional[Callable[[Dict], Trajectory]] = None,
        reason: Optional[str] = "",
        robot_idx: int = 0,
    ):
```

#### Fields

| Field | Type | Role |
| --- | --- | --- |
| `poses` | `Trajectory` | List of actions and poses to execute |
| `verifier` | `Callable[[Dict], ToolResult]` | Function called after execution |
| `redo` | `Callable[[Dict], Trajectory] \| None` | Optional replanning |
| `reason` | `str` | Error message if the tool could not be prepared (e.g. invalid argument combination) |
| `robot_idx` | `int` | Index of the executing robot. In single robot, it stays at 0. In multi-robot, you can compute the index from `selected_robot_name`. |

#### What `poses` can contain

The `Trajectory` type is defined as:

```python
list[Union[sapien.Pose, Literal["OPEN", "CLOSE", "OK"]]]
```

In practice:

- `sapien.Pose(...)` describes a waypoint to reach
- `"OPEN"` opens the gripper
- `"CLOSE"` closes the gripper
- `"OK"` declares a purely logical tool, without physical movement (e.g. attribute addition)

#### How MAGMA detects a preparation error

A `ToolExecution` is considered to be in error if `len(poses) == 0`.

In other words:

- `poses=[]` => the tool could not be prepared
- `poses=["OK"]` => the tool is valid, even without movement

:::warning
For a logical tool that succeeds, do not use `[]`. Use `["OK"]` instead.
:::

### When to use `redo`

`redo` is useful for long or iterative tools. It can allow moving several objects one after another. For example:

- checks which objects are still incorrectly sorted
- generates a new sub-trajectory
- stops after a maximum number of attempts

If `verifier` returns `False` and `redo` returns a non-empty trajectory, MAGMA reruns that trajectory before considering the tool finished.

### `BaseToolsAPI`

All your tools live inside a subclass of `BaseToolsAPI`.

The most useful methods are:

| Method | Role |
| --- | --- |
| `get_agent(name="")` | Returns the ManiSkill agent to control |
| `execute_tools(...)` | Internal dispatch to the correct tool in the registry |
| `_return_failed_tool(reason)` | Helper that returns a failed `ToolExecution` |
| `get_api_description()` | Exports the tools API as dictionaries |

### The internal `Tool` class

The registry does not store your raw Python methods directly. It stores `Tool` objects that encapsulate:

- the tool name
- its description
- its argument schema
- its optional parameters
- the Python function to call

One important thing the `Tool` wrapper does before calling your code is validating `params` with `verify_parameters_dict(...)`.

In other words, the real flow is:

1. the executor calls `BaseToolsAPI.execute_tools(...)`
2. `execute_tools(...)` finds a `Tool` object in `self.registry`
3. the `Tool` object validates `params`
4. if everything is correct, it calls your Python method
5. your method returns a `ToolExecution`

## Declaring a tool with `@register_tool`

The base decorator is:

```python
register_tool(description: str = "", params_spec: Dict = {}, optional: List = [])
```

### Decorator parameters

| Parameter | Role |
| --- | --- |
| `description` | Description visible to the agent |
| `params_spec` | Schema of the expected arguments |
| `optional` | List of optional argument names |

Each entry in `params_spec` must contain:

- `description`
- `type`

Example:

```python
@register_tool(
    description="Take an object from the environment.",
    params_spec={
        "obj": {
            "description": "The name of the object to take in the gripper.",
            "type": str,
        }
    }
)
```

### Required signature

The signature must be exactly:

```python
def my_tool(self, obs, env_id, params) -> ToolExecution:
```

The decorator explicitly checks the presence and order of:

- `self`
- `obs`
- `env_id`
- `params`

If the signature does not match, a `TypeError` is raised at load time.

### Required and optional parameters

<Tabs>
  <TabItem value="required" label="Required parameters">

```python
@register_tool(
    description="Put the held object in an area",
    params_spec={
        "target": {
            "description": "Move the robot gripper upper the area and drop the current object.",
            "type": str,
        }
    }
)
```

  </TabItem>
  <TabItem value="optional" label="With optional parameters">

```python
@register_tool(
    description="Launch a delivery cycle.",
    params_spec={
        "manufacturing_order": {"type": str, "description": "Manufacturing order."},
        "delivery_number": {"type": int, "description": "Number of deliveries."},
        "recipe": {"type": list, "description": "Products to deliver."},
    },
    optional=["delivery_number"],
)
```

  </TabItem>
</Tabs>

:::note
Names declared in `optional` must also exist in `params_spec`. The decorator checks this.
:::

### Automatic argument validation

When a tool is called through the registry, MAGMA automatically checks:

- that there are no unknown arguments
- that all required arguments are present
- that Python types match

Validation relies on `verify_parameters_dict(...)`.

Examples of automatic rejections:

- missing argument
- unknown argument
- invalid type, for example `target=3` while `str` is expected

This means your tool method can focus on business validation:

- does the object exist?
- does the area exist?
- can the robot reach that area?
- is the object already sorted?

### The registry: how a tool becomes visible

The registry is managed automatically by `BaseToolsAPI`.

#### What happens

1. you create a subclass of `BaseToolsAPI`
2. MAGMA scans the methods of that subclass
3. any method registered with `@register_tool`
4. that `Tool` instance is added to `cls.registry`

Then:

- `execute_tools(...)` looks up the tool name in `self.registry`
- `get_api_description()` produces the description exposed to the model

#### Very important point about inheritance

Each subclass has its own registry, and the code scans `cls.__dict__`.

That means a decorated method in a parent class is not automatically re-registered in the subclass.

:::warning
If you put all your `@register_tool` decorators only in a parent class, a concrete subclass may end up with an empty registry.
:::

### Recommended pattern

If you plan to expose several ToolsAPI, we recommend:

#### 1. Write shared logic in a base class

```python
class WarehouseSortingTool(BaseToolsAPI):
    def take_obj(self, obs: Observation, env_id: int, params: Dict) -> ToolExecution:
        ...
```

#### 2. Expose only the useful tools in concrete classes

```python
class WithoutManufacturingOrder(WarehouseSortingTool):
    @register_tool(
        description="Take an object from the environment.",
        params_spec={
            "obj": {"description": "The name of the object to take in the gripper.", "type": str},
        }
    )
    def take_obj(self, obs: Observation, env_id: int, params: Dict) -> ToolExecution:
        return super().take_obj(obs, env_id, params)
```

This pattern has several advantages:

- shared logic is written only once
- each scenario variant chooses exactly which tools it exposes
- generated API documentation stays clean

## Three useful tool styles

<Tabs>
  <TabItem value="movement" label="Simple movement tool">

Typical case: grasping or placing an object.

```python
def depose(self, obs: Observation, env_id: int, params: Dict) -> ToolExecution:
    area_name = params["target"]

    if area_name not in obs.maniskill_obs["extra"]:
        return BaseToolsAPI._return_failed_tool(
            f"Unknown area {area_name}. Please use only known area."
        )

    poses = compute_drop_trajectory(
        self.get_agent(),
        drop_pose=obs.maniskill_obs["extra"][area_name][env_id].cpu().numpy(),
        drop_seuil=0.3,
        approach_seuil=0.2,
    )

    def verifier(new_obs: Dict) -> ToolResult:
        if failure_condition:
            return ToolResult(False, "The object is still in the gripper")
        return ToolResult(True, f"Successfully depose object in {area_name}")

    return ToolExecution(poses=poses, verifier=verifier)
```

  </TabItem>
  <TabItem value="logical" label="Logical tool">

Typical case: modifying a list of known zones without physical movement.

```python
def add_new_location(self, obs: Observation, env_id: int, params: Dict) -> ToolExecution:
    location_name = params["location_name"]

    if location_name in obs.task_attributes["target_areas"]:
        return BaseToolsAPI._return_failed_tool(
            f"{location_name} already exist! Choose a non-existing name."
        )

    def verifier(new_obs: Dict) -> ToolResult:
        return ToolResult(
            True,
            reason=f"{location_name} was added to known areas",
            logs=Log(content=("target_areas", location_name), action="ADD"),
        )

    return ToolExecution(poses=["OK"], verifier=verifier)
```

  </TabItem>
  <TabItem value="redo" label="Iterative tool with redo">

Typical case: launching a cycle that may need to replan several pick-and-place actions.

```python
def launch_cycle(self, obs: Observation, env_id: int, params: Dict) -> ToolExecution:
    obj_to_sort = [...]
    assignment = params["assignment"]
    cpt = 0
    cpt_max = len(obj_to_sort) + 2

    def verifier(new_obs: Dict) -> ToolResult:
        for obj_name in obj_to_sort:
            if object_not_sorted(obj_name, new_obs):
                return ToolResult(False, f"A {obj_name} cube is still unsorted.")
        return ToolResult(True, "All objects have been sorted.")

    def redo(new_obs: Dict):
        nonlocal cpt
        cpt += 1
        if cpt > cpt_max:
            return []

        next_obj = choose_next_unsorted_object(new_obs)
        if next_obj is None:
            return []

        return build_pick_and_drop_trajectory(next_obj, new_obs)

    return ToolExecution(
        poses=redo(obs.maniskill_obs),
        verifier=verifier,
        redo=redo,
    )
```

  </TabItem>
</Tabs>

## How to write a good `verifier`

A good `verifier` should:

- read only the useful final state
- return a clear message
- be deterministic
- be stricter than simply checking whether the trajectory ran
- log attribute modifications

:::tip
The `verifier` only checks whether the final state matches what is expected from the parameters. It is not a task-related verification. This check is meant to detect planning errors, possible grasp failures, and so on. Task and Stage verification happens at their own level.
:::

### Technical failure vs business failure

It is useful to distinguish between two kinds of failure.

#### Technical or preparation failure

The tool cannot even be launched:

- invalid arguments
- missing object
- unknown area
- robot out of reach

In that case, return a failed `ToolExecution`, for example:

```python
return BaseToolsAPI._return_failed_tool("Unknown area area9.")
```

or:

```python
return ToolExecution(poses=[], verifier=None, reason="Unknown area area9.")
```

#### Business failure after execution

The trajectory was executed, but the result is not correct:

- the object was not grasped
- the object did not fall into the correct box
- the cycle did not finish sorting everything

In that case, `verifier` returns:

```python
return ToolResult(False, reason="Failed to grasp the object. You can retry.")
```

## Exposing the API to the model

`BaseToolsAPI.get_api_description()` transforms the registry into a list of dictionaries like:

```python
[
    {
        "name": "take_obj",
        "description": "Take an object from the environment.",
        "parameters": {
            "obj": {
                "description": "The name of the object to take in the gripper.",
                "type": "str"
            }
        }
    }
]
```

This structure is then used to present the available tools to the agent.

## Tool creation checklist

Before validating a new tool, check this list:

- the class really inherits from `BaseToolsAPI`
- the method is exposed with `@register_tool(...)`
- the signature is exactly `self, obs, env_id, params`
- each parameter in `params_spec` has `description` and `type`
- each name in `optional` also exists in `params_spec`
- business validations return a clean failure when needed
- `poses` is non-empty when preparation succeeds
- `verifier` always returns a `ToolResult`
- a logical tool uses `["OK"]`, not `[]`
- if you use `Log(action=...)`, the content is compatible with task attributes

## Common pitfalls

#### 1. Mixing up `Observation` and the `Dict` passed to `verifier`

The tool body works with `obs.maniskill_obs`, but `verifier` and `redo` work directly with `new_obs`.

#### 2. Relying on registry inheritance

The registry is rebuilt per subclass. Re-expose tools in the concrete class.

#### 3. Returning `[]` for a tool without movement

`[]` means error. Use `["OK"]`.

#### 4. Only doing type validation

Automatic validation does not replace business validation. Always check that object names, zones, and physical constraints make sense.

#### 5. Using `typing.Dict` or `typing.List` in `params_spec`

Validation uses `isinstance`. So you must provide concrete Python types such as `dict`, `list`, `str`, and `int`.

## Minimal complete example

Here is a minimal and robust skeleton:

```python
from typing import Dict

from magma_core.base.tools import BaseToolsAPI, register_tool
from magma_core.base.data_structures import Observation, ToolExecution, ToolResult


class SimpleTools(BaseToolsAPI):
    @register_tool(
        description="Check whether an area exists.",
        params_spec={
            "target": {
                "description": "Name of the target area to check.",
                "type": str,
            }
        }
    )
    def check_area(self, obs: Observation, env_id: int, params: Dict) -> ToolExecution:
        area_name = params["target"]

        if area_name not in obs.task_attributes["target_areas"]:
            return BaseToolsAPI._return_failed_tool(
                f"Unknown area {area_name}. Please use only known area."
            )

        def verifier(new_obs: Dict) -> ToolResult:
            return ToolResult(True, reason=f"{area_name} is a known area.")

        return ToolExecution(poses=["OK"], verifier=verifier)
```

This skeleton already covers the essentials:

- a tools class
- a tool declared with the decorator
- business validation
- a `ToolExecution`
- a `ToolResult`

## Summary

To create a MAGMA tool:

1. inherit from `BaseToolsAPI`
2. expose your methods with `@register_tool`
3. use `Observation` to read the initial context
4. return a `ToolExecution`
5. let `verifier` produce the `ToolResult`
6. use `redo` for iterative actions
7. use `Log` if the tool modifies attributes

By following these recommendations, you get tools that are:

- easy to expose to an agent
- easy to test
- robust against planning errors
- adaptable to several scenario variants
