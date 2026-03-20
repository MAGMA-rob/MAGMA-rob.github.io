---
sidebar_position: 3
title: Create a Tool (Lightweight)
description: Minimal path to your first MAGMA tool.
---

# Create a Tool (Lightweight)

Use this page if you want your first tool working quickly.
If you need the full execution model, registry behavior, `redo`, multi-API inheritance, or advanced logging patterns, continue with [Create a Tool (Detailed)](./create-tools.md).

For the conceptual explanation, see [Tools](../../core-concepts/tools.md).

## The minimum you need to know

A MAGMA tool is:

- a method inside a subclass of `BaseToolsAPI`
- exposed with `@register_tool(...)`
- called with `obs`, `env_id`, and `params`
- expected to return a `ToolExecution`

At the end of the execution, MAGMA calls your `verifier(...)`, which must return a `ToolResult`.

## Minimal checklist

To create a first tool:

1. inherit from `BaseToolsAPI`
2. expose one method with `@register_tool`
3. read the current context from `obs`
4. validate your business logic
5. return a `ToolExecution`
6. let `verifier(...)` return the final `ToolResult`

## Minimal complete example

This is the smallest robust pattern from the detailed tutorial:

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

This example is deliberately simple:

- it shows the expected class shape
- it shows how to validate parameters against task attributes
- it shows how to return a successful logical tool with `["OK"]`
- it avoids planner-specific code so the mechanics stay clear

## What to remember

### `obs` vs `new_obs`

Inside the tool body, you read from `obs` from `Observation` class.

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

#### Difference
Inside `verifier(new_obs)`, you read from `new_obs`, which is the raw dict of observation (=`maniskill_obs` from `Observation`)

### `["OK"]` vs `[]`

If your tool is valid but has no physical motion, return:

```python
poses=["OK"]
```

Do not return `[]`.
An empty `poses` list means the tool preparation failed.

### Use clean failure messages

If the tool cannot be prepared, return a failed `ToolExecution` with a useful reason. That reason should help the agent recover. The same idea apply to the `ToolResult`, the `reason` is the message passed to the agent after the execution.

## When you are ready for a physical tool

For a first planner-backed movement tool, the next code example you should show is:

- where the target pose is read from `obs.maniskill_obs["extra"]`
- which helper builds the trajectory in `poses`
- which final-state condition the verifier checks in `new_obs`

That example depends on your preferred planner helper, so it belongs better in the detailed page or in a scenario-specific example.

## Next step

Once one tool works, continue with:

- [Create a Stage (Lightweight)](./create-stages-light.md) for the shortest path
- [Create a Tool (Detailed)](./create-tools.md) if you need `redo`, logs, or multiple tool variants
