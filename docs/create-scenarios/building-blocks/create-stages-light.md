---
sidebar_position: 1
slug: /use-magma-gen/tutorials/building-blocks/create-stages-light
title: Create a Stage
---

# Create a Stage

The [first package tutorial](../first-scenario/create-scenarios.md#2-write-a-stage) defines a complete `PressNamedButton` stage. Reuse that pattern for a first action checkpoint.

## Declare the objective

Supply `goals`, `stage_goal_description`, and `StageInput`. A goal checks an observation; it does not choose or execute an action. The stage may also verify logs when the method or order matters.

Set `target_tool_calls` and `max_tool_calls` **before** calling the base constructor. Both names must be defined, even when one value is `None`. They cannot both be `None`. For procedural tasks consumed by the current GEN generator, provide an exact target. For a known one-call action, a target of one and maximum of three permits retries without redefining success.

## Write your own physical goal

Create `goals.py` beside your button stage. This goal uses the provided environment's batched button observation: the last value is joint displacement, and a sufficiently depressed joint counts as pressed.

```python title="src/my_magma_scenarios/scenarios/buttons/goals.py"
import torch
from magma_core.simulation.goals import BaseGoal
from magma_scenarios.scenarios.press_button.helper import BTN_STROKE


class ButtonIsPressed(BaseGoal):
    def __init__(self, button: str) -> None:
        super().__init__()
        self.button = button

    def verify(self, obs: dict) -> torch.Tensor:
        displacement = obs["extra"][self.button][:, -1]
        return (displacement < -BTN_STROKE / 2).to(torch.int32)
```

In `stages.py`, replace the `Pressed` import with `from .goals import ButtonIsPressed`, then use `goals=[ButtonIsPressed(button)]`. Run the original preset with `test-tools`.

`verify` returns one value per supplied environment, with shape `(num_envs,)`: `1` means satisfied, `0` means pending, and `-1` means failure. This goal returns only `0` or `1`; add an explicit failure condition when the domain requires one. Keep verification free of world mutations and use the observation batch supplied by the executor. The default goal serializer can recover `button` because the constructor argument and instance attribute have the same name.

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
