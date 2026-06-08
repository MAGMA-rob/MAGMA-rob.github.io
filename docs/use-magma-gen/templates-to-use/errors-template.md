---
sidebar_position: 5
title: Error Templates
description: Quick overview of built-in error-injection templates
---

# Error Templates

Error templates describe runtime failures that MAGMA can inject while a stage is being solved.

They are activated in two places:

- the stage declares possible active errors with `possible_errors`
- each compatible tool opts in with `@register_tool(..., errors=[...])`

## `magma_core.base.errors`

| Template | What it offers | Use when |
| --- | --- | --- |
| `BaseError` | Base interface for runtime error injection, with `initialize`, optional pre/post hooks, validation keys, and recovery-step metadata. | You need to define a custom recoverable failure mode. |

## `magma_scenarios.templates.errors`

| Template | What it offers | Use when |
| --- | --- | --- |
| `GraspFailureError` | Base class for making selected targets fail before execution by calling `ToolExecution.fail(...)`. | You want a take/grasp/manipulation tool to fail for one or more selected objects. |
| `MaskedObjectError` | Base class for perception errors that hide selected objects from tool results or reject manipulation of masked targets. | You want detection tools to return incomplete perception, or forbid acting on objects that should be hidden. |

Both scenario templates are abstract bases. Inherit from them inside a scenario to implement `initialize(...)`, and for perception errors usually `apply_post_verif(...)`, with scenario-specific object names and observations.

## Tool support helper

`ToolErrorSupport` lives in `magma_core.base.data_structures`.

Use it inside `@register_tool` when a tool supports an error only before execution, only after verification, or both:

```python
from magma_core.base.data_structures import ToolErrorSupport
from magma_core.base.tools import register_tool

from my_scenario.errors import MyGraspError


@register_tool(
    description="Take an object.",
    params_spec={"obj": {"description": "Object to take.", "type": str}},
    errors=[ToolErrorSupport(MyGraspError, pre=True, post=False)],
)
def take(self, obs, env_id, params):
    ...
```

If you pass an error class directly, MAGMA treats it as supporting both pre-exec and post-verification hooks.
