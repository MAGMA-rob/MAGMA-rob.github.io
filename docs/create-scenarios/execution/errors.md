---
sidebar_position: 3
title: Inject a Temporary Tool Failure
slug: /create-scenarios/errors
---

# Inject a Temporary Tool Failure

Begin with one temporary execution error before adding perception or accessibility changes.

## Declare support on the tool

In the tool module, import:

```python
from magma_core.simulation.data_structures import ToolErrorSupport
from magma_scenarios.templates.errors import OneShotToolFailureError
```

Add this argument to the physical tool's existing `@register_tool` decorator:

```python
errors=[ToolErrorSupport(OneShotToolFailureError, pre=True, post=False)],
```

This declares compatibility. It does not activate an error by itself. Concrete tools classes must redeclare support when they redeclare the decorated method.

## Configure the stage

Replace the initial tutorial's `PressNamedButton` class in `stages.py` with this configurable version. Existing calls keep working with errors disabled:

```python title="src/my_magma_scenarios/scenarios/buttons/stages.py"
from magma_core.simulation.data_structures import StageInput, UserInstruction
from magma_core.simulation.stage import BaseTaskStage, StageErrorParameters
from magma_scenarios.scenarios.press_button.button_stages import Pressed
from magma_scenarios.templates.errors import OneShotToolFailureError


class PressNamedButton(BaseTaskStage):
    target_tool_calls = 1
    max_tool_calls = 3

    def __init__(self, button: str = "sw0", failure_count: int = 0) -> None:
        if failure_count < 0:
            raise ValueError("failure_count must be nonnegative")
        self.button = button
        self.failure_count = failure_count
        errors = []
        if failure_count:
            errors.append(OneShotToolFailureError(
                failure_probability=1.0, failure_count=failure_count,
            ))
        super().__init__(
            goals=[Pressed(button)],
            stage_goal_description=f"Press {button}.",
            stage_input=StageInput(
                UserInstruction(f"Please press {button}."),
                flag_answer_to_user=False,
            ),
            error_parameters=StageErrorParameters(possible_errors=errors),
        )

    def _to_spec_arguments(self) -> dict:
        return {"button": self.button, "failure_count": self.failure_count}
```

In `FirstTask.__init__`, set `self.stages = [PressNamedButton(button, failure_count=1)]`. Keep the provided button tool, which already declares error support, or the custom `ButtonTools` with the decorator support added above. Run `magma-scenarios test-tools my_buttons.FirstTask --nb-env 1` and call the requested button twice.

For this deterministic debugging setup, the first compatible call fails before execution, and its error state consumes one failure. A later compatible call can succeed. Reduce the probability for stochastic cases.

## Selection is not triggering

`possible_errors` holds configured instances. The runtime samples active errors per stage/trajectory within the configured count bounds. Each error then decides whether it applies to a call, possibly using `ToolExecution.context`.

Errors needing a target may defer binding by returning `None` from `initialize`. The selected error remains active; it is not equivalent to omitting the error.

## Test recovery

Exercise the physical tool manually, then [run the preset with GEN](../first-scenario/generate.md) to verify that a failed status leads to an appropriate retry or alternative action. Inspect actual injected-error flags and effective tool-call accounting rather than treating all failures as agent mistakes.

Full hooks, naming requirements, and validation: [error reference](../../reference/scenarios/errors.md).
