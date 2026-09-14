---
sidebar_position: 1
title: Build Tasks with Requests
slug: /create-scenarios/requests
---

# Build Tasks with Requests

Once a preset works, use a `TaskDefinition` to construct varied interactions. This example extends [your package](../first-scenario/create-scenarios.md) and reuses `PressNamedButton`.

## 1. Sample one immutable parameter value

```python title="src/my_magma_scenarios/scenarios/buttons/requests.py"
from dataclasses import dataclass
import random

from magma_core.simulation.requests import BaseRequest
from magma_core.simulation.stage import BaseTaskStage
from magma_core.simulation.state import TaskState

from .stages import PressNamedButton


@dataclass(frozen=True)
class PressParameters:
    button: str


class PressRequest(BaseRequest[PressParameters]):
    def sampling_weight(self, state: TaskState) -> float:
        return 1.0 if state.attributes["objects"] else 0.0

    def sample_parameters(self, state: TaskState) -> PressParameters:
        return PressParameters(button=random.choice(state.attributes["objects"]))

    def create_stages(
        self, state: TaskState, parameters: PressParameters
    ) -> list[BaseTaskStage]:
        return [PressNamedButton(parameters.button)]

    def apply_request(self, state: TaskState, parameters: PressParameters) -> TaskState:
        state.attributes["objects"].remove(parameters.button)
        return state
```

This definition samples each initially available button at most once. Removing it here restricts **future request sampling**; it does not ask the agent to remove a visible attribute or remove the physical button. See [attribute edits](../interactions/modify-attributes.md) for those distinct behaviors.

Keep `sampling_weight` free of mutations and finite/non-negative. A zero weight makes a request ineligible. Sample random choices once in `sample_parameters`; do not resample in `create_stages` or `apply_request`.

## 2. Declare a definition

```python title="src/my_magma_scenarios/scenarios/buttons/definition.py"
from magma_core.simulation.data_structures import SituationInit
from magma_core.simulation.tasks import TaskDefinition
from magma_scenarios.scenarios.press_button.tool import Tool

from .requests import PressRequest


class ButtonDefinition(TaskDefinition):
    maniskill_env_id = "PressButtonBasic-v1"
    Tools_cls = Tool

    def __init__(self) -> None:
        super().__init__(
            situation_init=SituationInit(attributes={"objects": ["sw0", "sw1", "sw2"]}),
            active_requests=[PressRequest()],
        )
```

When `starting_state` is omitted, the base definition copies attributes and memory from `SituationInit` into a new `TaskState`. Supply an explicit starting state when you need initial relations or properties.

The task's initial visible vocabulary remains the three buttons. The generator's working state changes while constructing the sequence. This example needs no rule system.

Each stage used by the current GEN `TaskGenerator` must have an exact, non-`None` `target_tool_calls`. It uses those targets to budget task construction. The core permits some stages with only a maximum, but request construction testing alone does not check this generator requirement.

## 3. Register and inspect

Add this mapping to `ScenarioManifest`:

```python
 definitions={
     "Definition": "my_magma_scenarios.scenarios.buttons.definition:ButtonDefinition",
 },
```

Start a new CLI process and run:

```bash
magma-scenarios show my_buttons
magma-scenarios test-requests my_buttons.Definition trace --count 2 --seed 0
magma-scenarios test-requests my_buttons.Definition mass --count 100 --seed 0
```

Each constructed task should contain three `PressNamedButton` stages, in a sampled order, followed by no eligible request. This verifies construction, not physical execution. Use the preset tool test for physical behavior.

## Generate from the definition

After checking request construction, start the services described in [Generate Data from Your Scenario](../first-scenario/generate.md). From your MAGMA workspace with its Python environment active:

```bash
magma-gen run my_button_variations --definition my_buttons.Definition \
  --config-path ./config.yaml --nb-env 1 --nb-branch 1 \
  --no-coaching --no-judge --no-randomized
```

Use a new run name for each collection. `--definition` asks GEN to construct the task from your requests; `--preset` would load an already assembled task. Inspect `my_button_variations` in the viewer, then export it with the agent that produced the run.

This button definition uses physical goals and Python sampling. Definitions that generate text or check semantic answers may also need a [language-model backend](../../use-magma-gen/quickstart/configuration.md#add-a-language-model-backend-later).

## Extend the interaction

Add [constraints](../interactions/constraint-cycle.md), [questions](../interactions/asking-request.md), or [interruptions](../interactions/interruption.md). When a sequence contains repeated actions on already-completed physical state, explicitly define the needed reset or transition; symbolic construction does not reset the simulator.


**Reference:** [definition and request contracts](../../reference/scenarios/create-tasks-definition.md).
