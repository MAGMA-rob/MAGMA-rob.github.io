---
sidebar_position: 1
title: Add an Optional Perfect Trace
slug: /create-scenarios/perfect-traces
---

# Add an Optional Perfect Trace

Add a perfect trace only when a consuming workflow needs a declared reference interaction. Ordinary request construction can leave `build_perfect_trace` unimplemented, returning `None` through `BaseRequest`.

## Use the sampled parameters

For the `PressRequest` from [the request tutorial](../procedural-tasks/requests.md), this method illustrates the event sequence. Add the imports and method to that request module/class:

```python
from magma_core.domain import Call
from magma_core.simulation.requests import (
    PerfectTrace, ToolCallEvent, ToolResultEvent, TraceToolResult, UserEvent,
)

# Method inside PressRequest:
def build_perfect_trace(self, state, parameters: PressParameters) -> PerfectTrace:
    button = parameters.button
    return PerfectTrace(events=[
        UserEvent(content=f"Please press {button}."),
        ToolCallEvent(calls=[Call(
            name="press_button", arguments={"id": button}, target_robot_name="panda"
        )]),
        ToolResultEvent(results=TraceToolResult(
            robot="panda", tool="press_button", message=f"You have the {button} button pressed."
        )),
    ])
```

This is a minimal interaction trace for the tutorial's physical-only stage, not a complete canonical TSR checkpoint example. Trace consumers can require additional goal/rule events, explicit completion, or reactive-state annotations. Follow that consumer's contract before enabling its checkpoint/export path.

Use task-consistent robot names. Reuse `parameters.button`; do not sample again. Expected tool messages and any `attribute_updates` must match the declared behavior.

## Validate what the consumer requires

`test-requests ... trace` does not call this method. Separately inspect the returned events and validate them with the intended trace consumer. GEN's canonical checkpoint mode requires a non-`None` trace; off-policy consumers can add their own invariants.

A trace describing success does not prove physical feasibility. Keep the preset/action verification alongside trace checks.

**Reference:** [event fields and decision count](../../reference/scenarios/perfect-traces.md).
