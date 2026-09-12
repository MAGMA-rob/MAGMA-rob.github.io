---
sidebar_position: 1
slug: /use-magma-gen/tutorials/multi-stages
title: Build a Multi-stage Interaction
---

# Build a Multi-stage Interaction

One user instruction can require several independently verified actions. Keep the first instruction explicit and subsequent continuation inputs empty.

## Add a complete two-button preset

Create this module in [your provider package](../first-scenario/create-scenarios.md). It reuses the first preset's environment and tools. The first checkpoint verifies both the button state and the tool log so that the requested first action is checked explicitly.

```python title="src/my_magma_scenarios/scenarios/buttons/sequence.py"
from magma_core.simulation.data_structures import EmptyInstruction, Log, StageInput, UserInstruction
from magma_core.simulation.stage import BaseTaskStage, StageGlobalParameters
from magma_scenarios.scenarios.press_button.button_stages import Pressed

from .preset import FirstTask


class ButtonCheckpoint(BaseTaskStage):
    target_tool_calls = 1
    max_tool_calls = 3

    def __init__(self, button: str, instruction: str | None, answer_after: bool) -> None:
        self.button = button
        self.instruction = instruction
        self.answer_after = answer_after
        super().__init__(
            goals=[Pressed(button)],
            stage_goal_description=f"Press {button} next.",
            stage_input=StageInput(
                UserInstruction(instruction) if instruction is not None else EmptyInstruction(),
                flag_answer_to_user=answer_after,
            ),
            global_parameters=StageGlobalParameters(reset_at_end=False),
        )

    def verif_log_completion(self, stage_log: list[Log], full_log: list[Log]) -> int:
        presses = [log for log in stage_log if log.function == "press_button"]
        if any(log.content != self.button for log in presses):
            return -1
        return 1 if presses else 0

    def _to_spec_arguments(self) -> dict:
        return {
            "button": self.button,
            "instruction": self.instruction,
            "answer_after": self.answer_after,
        }


class ButtonSequence(FirstTask):
    def __init__(self) -> None:
        super().__init__()
        self.stages = [
            ButtonCheckpoint("sw0", "Press sw0, then sw1.", False),
            ButtonCheckpoint("sw1", None, True),
        ]
```

Add `"ButtonSequence": "my_magma_scenarios.scenarios.buttons.sequence:ButtonSequence"` to the manifest's `presets`, then run:

```bash
magma-scenarios test-tools my_buttons.ButtonSequence --nb-env 1
```

Enter `press_button(id="sw0")`, then `press_button(id="sw1")`. The world is preserved between checkpoints. The provided tool logs successful presses, so a successful press of `sw1` at the first checkpoint fails its log check. Failed calls without such a log do not establish that a button was pressed.

The manual tester checks the action path; it does not validate the final user-facing answer. Check that answer in the consuming agent runtime.

## Completion answer {#flag_answer_to_user}

The final answer flag marks the end of the requested action sequence. Current GEN preparation turns it into an explicit `CompletionAnswerStage`, clears the original flag, and moves any final reset to that answer stage. Detection tools can be permitted before the completion message. This materialization is GEN preparation behavior; a different consumer must explicitly support the boundary or accept an assembled completion stage.

Alternatively, when explicitly assembling stages for a consumer that accepts them, append `CompletionAnswerStage()` yourself with the preceding flag false. Do not add both mechanisms to the same boundary. `CompletionAnswerStage` uses `SAY_ONLY`; use `AskingBaseStage` for a semantically checked answer.

## Linking and new inputs

`EmptyInstruction` always implies `linked_to_prev=True`. A direct user instruction defaults to a new interaction, but can set `linked_to_prev=True` for a question or interruption belonging to the current one.

A stage with an answer flag followed directly by an `EmptyInstruction` is rejected by `BaseTask.validate()` before materialization. An unfinished action sequence followed by a direct instruction has different semantics: [interruption](interruption.md).

**Reference:** [stage input and completion](../../reference/scenarios/create-stages.md#how-flag_answer_to_user-works).
