---
sidebar_position: 5
slug: /use-magma-gen/deep-dive/create-tools
title: Tool Execution and Result Contract
---

# Tool Execution and Result Contract

Import `BaseToolsAPI` and `register_tool` from `magma_core.simulation.tools`. Execution data structures are exported from `magma_core.simulation.data_structures`.

## Registration

```python
register_tool(
    description="", params_spec=None, optional=None, errors=None,
    execution_group=None, is_detection=False,
)
```

Decorated methods start with `self, obs, env_id, params`. Parameter specs require `description` and a Python `type`; `optional` names must exist in the spec. Runtime validation checks required and optional argument types. Validate domain values inside the tool.

Each concrete subclass has a fresh registry populated from its own decorated methods. Inherited registrations are not automatically exposed.

## Observation

`Observation` contains `selected_robot_name`, `task_attributes`, `maniskill_obs`, `add_constants`, and `tool_batch_context`. The verifier receives raw post-execution observations, not this wrapper. Capture call-specific values in its closure when needed.

## ToolExecution

| Constructor field | Purpose |
| --- | --- |
| `poses` | Trajectory: poses and `OPEN`, `CLOSE`, or `OK` tokens |
| `verifier` | Callback receiving raw observations and returning `ToolResult`, or `None` for failed preparation |
| `reason` | Preparation status/error message |
| `robot_idx` | Runtime robot index, assigned by task execution |
| `context` | Per-call internal data, e.g. error target |
| `compatible_error_supports` | Normally assigned by registration |
| `execution_group` | Per-call scheduling group; overrides decorator default when non-`None` |
| `reason_is_public` | Marks preparation reason as already using public vocabulary |
| `allowed_moving_actors` | Optional actor allowlist for executor restoration |

`poses=[]` initializes a `BAD_CALL`. `poses=['OK']` represents an execution without a physical trajectory. `fail(reason, failure_flag=BAD_CALL, must_fail_stage=False)` clears poses/verifier and records failure. A missing verifier is valid for a preparation failure, not for a successful no-motion tool.

There is no `redo` callback. Use a [skill](skills.md) for repeated calls or adaptive iteration.

## ToolResult

`ToolResult(ok, reason='', logs=None, context={}, state_updates=[])` uses fresh containers for defaults.

- `ok` must be a boolean or a scalar tensor, normalized to bool.
- `reason` describes the observed outcome.
- `logs` is one optional `Log`, despite the plural field name.
- `context` supplies post-verification internal data, including error-hook data.
- `state_updates` contains explicit `EnvStateUpdate` values.

`Log(content, action=None)` can carry `ADD` / `REMOVE` attribute updates. Function and stage IDs are attached by runtime execution. Attribute logs require an additive stage.

## Explicit state updates

`EnvStateUpdate(path: tuple[str, ...], value)` targets a tensor leaf in saved environment state. The executor assigns it to the selected environment slot, converting tensor values to the target dtype/device. Unknown paths or non-tensor leaves are errors. This is not a path into the observation dictionary.

## Actor protection and detection

`allowed_moving_actors=None` disables explicit protection; `[]` preserves no actor changes; a list permits those actor names. GEN combines batch lists and restores disallowed actor states after tool updates. Any `None` disables batch protection. Incompatible layouts/names skip protection with a warning.

`is_detection=True` forces `allowed_moving_actors=[]`, even if the tool returns another value. Protection concerns the `actors` mapping, not general articulation safety. The manual tool tester currently does not apply this restoration pass.

## Execution groups and reservations

Tools sharing `execution_group` run with accumulated trajectory delays within a batch, in call order. There is no global cross-environment lock or automatic sequential replanning.

`ToolBatchContext.try_reserve(namespace, resource, owner)` reserves a hashable resource for the current request, returning false for a different owner. `get_reservations(namespace)` returns a copy. Persist occupancy in environment state rather than in these ephemeral reservations.

## Error hooks

Registration supplies supported error types; stages supply active configured instances. Hooks use `ToolExecution.context` before execution and `ToolResult.context` after verification. See [error contract](errors.md).

**Guide:** [create a tool](../../create-scenarios/building-blocks/create-tools-light.md).
