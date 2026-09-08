---
sidebar_position: 1
slug: /use-magma-gen/tutorials/building-blocks/create-stages-light
title: Create a Stage
---

# Create a Stage

The [first package tutorial](../first-scenario/create-scenarios.md#2-write-a-stage) defines a complete `PressNamedButton` stage. Reuse that pattern for a first action checkpoint.

## Declare the objective

Supply `goals`, `stage_goal_description`, and `StageInput`. A goal checks an observation; it does not choose or execute an action. The stage may also verify logs when the method or order matters.

Set `target_tool_calls` and `max_tool_calls` **before** calling the base constructor. Both names must be defined, even when one value is `None`. For a known one-call action, a target of one and maximum of three permits retries without redefining success.

## Choose stage behavior

Pass `StageGlobalParameters` for optional behavior:

```python
from magma_core.simulation.stage import StageGlobalParameters

parameters = StageGlobalParameters(reset_at_end=False, additive_stage=False)
```

Use `reset_at_end=False` when subsequent stages need the resulting physical state. Use an [entry transition](../execution/env-transitions.md) for an automatic external change before a stage starts.

## Textual objectives

For an answer to a question, start with the built-in template:

```python
from magma_core.simulation.stage import AskingBaseStage

stage = AskingBaseStage(
    question="Which button did I ask you to press?",
    answer="sw0",
)
```

Text-only stages use a verification prompt, have no environment goals, and cannot override the log verifier. The interactive tool tester skips them; validate them with an agent-capable runtime.

## Continue an interaction

Use `EmptyInstruction()` to continue the previous instruction through the last tool status. Use a new `UserInstruction` to introduce another input. See [multi-stage instructions](../interactions/multi-stages.md) before adding answer flags or interruptions.

**Reference:** [stage parameters and verification](../../reference/scenarios/create-stages.md).
