---
sidebar_position: 8
title: Perfect Trace Contract
---

# Perfect Trace Contract

Core trace events live in `magma_core.domain.perfect_trace` and are also re-exported from `magma_core.simulation.requests`.

| Type | Fields/purpose |
| --- | --- |
| `PerfectTrace` | `events`, optional `nb_decision` |
| `UserEvent` | `content` |
| `ToolCallEvent` | `calls`, optional `completed_todos` |
| `TraceToolResult` | `robot`, `tool`, `message`, optional `attribute_updates` |
| `ToolResultEvent` | One or several normalized `TraceToolResult` values |
| `MessageEvent` | `content`, `mode` (`inform` or `execution_report`), optional `completed_todos` |
| `RuleRef`, `GoalRef`, `TodoRef` | Nonempty reference identities for annotated traces |

`TraceToolResult` requires nonempty robot, tool, and message strings. `ToolResultEvent` requires at least one result. `PerfectTrace` defaults its decision count to the number of `ToolCallEvent` events, counting a multi-call event once. It is not the number of physical tool calls.

`BaseRequest.build_perfect_trace(state, parameters)` returns an optional trace for the sampled request. Use the pre-request symbolic state and the same parameters as stage creation. Rich TSR consumers can require additional events/annotations from their reactive-state contract; base event construction alone does not certify compatibility.

Trace presence is optional at the base request level and mandatory when a consumer explicitly requires it. The request tester does not exercise this method.

**Guide:** [add a trace](../../create-scenarios/traces-and-replay/perfect-traces.md).
