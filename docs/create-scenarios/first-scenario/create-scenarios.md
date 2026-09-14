---
sidebar_position: 1
slug: /use-magma-gen/tutorials/create-scenarios
title: Create Your Own Scenario Package
---

# Create Your Own Scenario Package

This tutorial creates `my_buttons.FirstTask` in your own package. It reuses an installed environment and tools, and supplies a custom task and stage. At the end, the scenario is discoverable and its button tool can be exercised interactively.

## Prerequisites

Use a Python environment with MAGMA 2.0 simulation dependencies and `magma_scenarios` installed. The interactive tool test needs a working display and the planner service used by the provided button tool. These are runtime prerequisites, not files to copy into your provider.

## 1. Create the package

```text
my-magma-scenarios/
├── pyproject.toml
└── src/
    └── my_magma_scenarios/
        ├── __init__.py
        ├── manifest.py
        └── scenarios/
            ├── __init__.py
            └── buttons/
                ├── __init__.py
                ├── stages.py
                └── preset.py
```

Create the three `__init__.py` files as empty files. Keep your code in this package throughout the tutorials.

```toml title="pyproject.toml"
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "my-magma-scenarios"
version = "0.1.0"
requires-python = ">=3.12,<3.13"
dependencies = ["magma_scenarios>=2.0.0,<3.0.0"]

[project.entry-points."magma.scenarios"]
my_buttons = "my_magma_scenarios.manifest:SCENARIO"

[tool.setuptools.packages.find]
where = ["src"]
```

This declares a dependency requirement, not a specific package-distribution channel. Use the MAGMA distribution configured for your environment.

## 2. Write a stage

A **stage** is a checkpoint: it introduces what is requested and checks whether that part of the task is complete. Here we reuse `Pressed(button)`, a **goal** that reads the button's physical state. The tool moves the robot; the goal only checks the outcome.

### Choose what counts as success

| What needs checking? | Mechanism | Example |
| --- | --- | --- |
| The world reached the desired state | Physical goals | A button is depressed; objects are in their target zones |
| Actions followed a required method or order | Log verification | The tool recorded the expected button name, the sorted object order |
| The agent gave an appropriate answer | A text-only stage with a verification prompt | Answer a question or acknowledge a rule |

An **action stage** can combine physical goals and logs. Tools must emit the evidence the log verifier needs, including parameter values when those matter. A **text-only stage** validates an answer and can optionally permit tools before it. A semantic check uses a verification prompt with the `JUDGE` validation mode.

This tutorial uses only a physical goal. [Stages and interaction](../../concepts/stages.md) explains the alternatives; [log verification](../building-blocks/log-verification.md) and [question stages](../interactions/asking-request.md) show how to add them later.

### Declare the button checkpoint

```python title="src/my_magma_scenarios/scenarios/buttons/stages.py"
from magma_core.simulation.data_structures import StageInput, UserInstruction
from magma_core.simulation.stage import BaseTaskStage
from magma_scenarios.scenarios.press_button.button_stages import Pressed


class PressNamedButton(BaseTaskStage):
    target_tool_calls = 1
    max_tool_calls = 3

    def __init__(self, button: str = "sw0") -> None:
        self.button = button
        super().__init__(
            goals=[Pressed(button)],
            stage_goal_description=f"Press {button}.",
            stage_input=StageInput(
                instruction=UserInstruction(f"Please press {button}."),
                flag_answer_to_user=False,
            ),
        )

    def _to_spec_arguments(self) -> dict:
        return {"button": self.button}
```

When the tool finishes, `Pressed("sw0")` checks whether `sw0` is depressed. Pressing another button does not satisfy this goal. The example does not impose an action order or forbid every other movement; add checks explicitly when those requirements matter.

`StageInput` carries the instruction. The target describes the expected one-call solution; the maximum leaves room for retries. This first example stops at physical completion; [multi-stage instructions](../interactions/multi-stages.md) adds completion messages and interaction boundaries.

The serialization method records the constructor argument for consumers that save stage specifications. It does not execute the stage.

## 3. Assemble the preset

A **preset** is a concrete task assembled from stages. It selects the environment and tools, supplies the initial vocabulary, and lists the checkpoints. This example assembles one checkpoint without a procedural task generator.

```python title="src/my_magma_scenarios/scenarios/buttons/preset.py"
from magma_core.simulation.data_structures import SituationInit
from magma_core.simulation.tasks import BaseTask
from magma_scenarios.scenarios.press_button.tool import Tool

from .stages import PressNamedButton


class FirstTask(BaseTask):
    maniskill_env_id = "PressButtonBasic-v1"
    Tools_cls = Tool

    def __init__(self, button: str = "sw0") -> None:
        super().__init__()
        if button not in {"sw0", "sw1", "sw2", "sw3", "sw4"}:
            raise ValueError(f"Unknown button: {button}")
        self.situation_init = SituationInit(
            attributes={"objects": ["sw0", "sw1", "sw2", "sw3", "sw4"]},
        )
        self.stages = [PressNamedButton(button)]
```

The environment ID and tools are shared components; the initial vocabulary and stage list belong to your task. Default initialization parameters and metadata are supplied by `BaseTask`.

## 4. Publish the manifest

```python title="src/my_magma_scenarios/manifest.py"
from magma_scenarios.manifest import ScenarioManifest

SCENARIO = ScenarioManifest(
    id="my_buttons",
    presets={
        "FirstTask": "my_magma_scenarios.scenarios.buttons.preset:FirstTask",
    },
    environments={
        "PressButtonBasic-v1": "magma_scenarios.envs.press_button.press_button",
    },
)
```

The shared environment mapping matches its original provider. Your own environment will instead point to a module in your package. Do not import all environments from a package `__init__.py`: the loader imports the modules declared in manifests when needed.

## 5. Install and inspect

From `my-magma-scenarios/`:

```bash
python -m pip install -e .
magma-scenarios list
magma-scenarios show my_buttons
```

`list` should include `my_buttons`. `show` should report `FirstTask` and `PressButtonBasic-v1`. Reinstall after changing entry points, then start a new process: discovery is cached per process.

## 6. Try the task

```bash
magma-scenarios test-tools my_buttons.FirstTask --nb-env 1
```

At the prompt:

```text
press_button(id="sw0")
```

Inspect `RETURN STATUS` and the stage result printed as `REWARD`. Successful execution should produce a success status and `FINISHED TASK`. The test does not require an LLM, but the physical tool uses the configured planner.

Try another task parameter:

```bash
magma-scenarios test-tools my_buttons.FirstTask --nb-env 1 --button sw2
```

Then enter `press_button(id="sw2")`. See [testing](testing.md) for configuration, reset, and the test coverage limits.

## Next step

Continue with [Create a Task Preset](create-tasks-light.md) to change the interaction you just tested. For a real example of one stage class serving several objectives, read [color-sorting checkpoints](../building-blocks/make-reusable-stages.md).

Later, a **request** can construct stages from sampled parameters when you need many varied interactions. The [request tutorial](../procedural-tasks/requests.md) introduces that separate workflow; it is not required to complete this one.
