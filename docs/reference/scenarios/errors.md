---
sidebar_position: 7
title: Error Injection Contract
---

# Error Injection Contract

`BaseError` is exported by `magma_core.simulation.errors`. Declare compatible classes in `@register_tool(errors=...)`, optionally wrapped in `ToolErrorSupport(error_type, pre=True, post=True)`.

Supported classes must derive from `BaseError` and have no required constructor arguments. Stage instances may still override optional constructor arguments. A support must enable at least one hook.

## Error methods

| Method | Contract |
| --- | --- |
| `initialize(obs, env_id)` | Per-trajectory argument dictionary or `None` for deferred binding |
| `apply_pre_exec(tool_execution, arguments)` | Apply effect before execution; report whether it took effect |
| `apply_post_verif(tool_result, arguments)` | Modify result after verification |
| `get_description(arguments)` | Explain the active error |
| `get_name()` | Defaults to concrete class name |
| `validate_arguments(arguments)` | Validate required/optional runtime keys |

`required_key` and `optional_key` define externally provided argument schemas. Runtime error state is keyed by error name; names must be unique within a stage.

## Stage sampling

`StageErrorParameters(possible_errors=[], min_active_errors=1, max_active_errors=1)` uses fresh defaults. Bounds must be nonnegative integers with minimum no greater than maximum. Counts are clamped to the available error count. Zero available errors means no active errors.

A selected error with state `None` remains selected but awaits runtime binding. An empty error-state mapping means no active errors. Consumers may supply already-materialized arguments for replay.

## Outcome categories

`ToolErrorFlag` includes `NONE`, `BAD_CALL`, `PLANNER_ERROR`, and `INJECTION_ERROR`. The runtime records whether injection was actually applied. Do not infer that every selected error fired or that every failed tool is an injected failure.

**Guide:** [temporary failure](../../create-scenarios/execution/errors.md).
