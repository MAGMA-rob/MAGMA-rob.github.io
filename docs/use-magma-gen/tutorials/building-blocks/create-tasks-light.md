---
sidebar_position: 4
title: Create a Task Preset (Lightweight)
description: Minimal path to your first runnable MAGMA task preset.
---

# Create a Task Preset (Lightweight)

Use this page if you want the shortest path to a runnable preset.
If you need optional metadata, multi-robot setup, planner options, or the full task wiring details, continue with [Create a Task Preset (Detailed)](../../deep-dive/create-tasks.md).

:::info
This page complements the main [Create your custom scenario in 5 minutes](../create-scenarios.md) tutorial.
Use it as a drill-down on the preset step, not as a separate authoring flow.
:::

For the conceptual explanation, see [Tasks and Stages](../../../core-concepts/tasks.md).

## Before you start

This page assumes you already have:

- an environment ID
- one tools class
- one or more stage classes

If not, go back to:

- [Create an Environment](./create-envs.md)
- [Create a Tool (Lightweight)](./create-tools-light.md)
- [Create a Stage (Lightweight)](./create-stages-light.md)

## The job of a preset

A task preset is the lightweight class that ties together:

- the environment
- the tools API
- the ordered list of stages

That is its main job.

## Minimal checklist

To create a first preset:

1. inherit from `BaseTask`
2. define `name`, `env_id`, `Tools_cls`, `styles`, and `all_task_attributes`
3. call `super().__init__()`
4. build `self.stages`
5. register the preset in the scenario `TASK_PRESETS` dict

## Minimal complete example

```python
from magma_core.base.tasks import BaseTask
from magma_core.base.tasks_style import TaskStyle

from .tools import SimpleTools
from .stages import PutValveInArea3


class SimpleSortingPreset(BaseTask):
    name = "Simple Sorting Preset"
    env_id = "SortingCubesWarehouse-v1"

    Tools_cls = SimpleTools

    styles = [TaskStyle.CONSTRAINED]
    approximal_difficulty = "Easy"

    all_task_attributes = {
        "objects": ["valve"],
        "target_areas": ["area1", "area2", "area3"],
    }

    def __init__(self):
        super().__init__()
        self.stages = [
            PutValveInArea3(),
        ]
```

## Register the preset

Once the preset class exists, expose it in your scenario `__init__.py`:

```python
TASK_PRESETS = {
    "SimpleSortingPreset": "preset:SimpleSortingPreset",
}
```

That is enough to make the preset discoverable under:

```python
amazing_scenario.SimpleSortingPreset
```

## What to remember

### Keep the preset small

The preset should mostly assemble existing pieces.

- environment logic belongs in the env class
- tool behavior belongs in the tools API
- objective logic belongs in the stages

### `all_task_attributes` is the full catalog

Stage-specific attributes still live in each stage's `Situation`.

## What this lightweight page does not cover

Use the detailed page when you need:

- multi-robot `agent_names`
- `tools_constant`
- `env_options`
- `planner_options`
- richer metadata patterns

## What you should show next if you extend this page

The next useful example to add would be:

- one preset with two stages chained together
- one preset with a different tools API variant

Those are good follow-up examples, but not necessary for the first runnable preset.

## Next step

Register the preset in your scenario package, then return to [Create a Scenario](../create-scenarios.md) to check the full authoring flow.
