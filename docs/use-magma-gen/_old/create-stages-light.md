---
sidebar_position: 5
title: Create a Stage (Lightweight)
description: Minimal path to your first MAGMA stage.
---

# Create a Stage (Lightweight)

Use this page if you want the shortest path to a working stage.
If you need text-only stages, log verification, additive stages, or deeper stage internals, continue with [Create Stages (Detailed)](./create-stages.md).

For the conceptual explanation, see [Tasks and Stages](../../core-concepts/tasks.md).

## The one idea to keep in mind

A stage is an objective, not an action.

- tools describe what the robot can do
- stages describe what must be true before the task can move on

For a first custom scenario, the easiest stage to write is a small action stage verified by goals.

## Minimal checklist

To create a first stage:

1. inherit from `BaseTaskStage`
2. set `target_steps` and `acceptance_steps`
3. define one or more goals
4. give the stage a `stage_goal_description`
5. build a `Situation`

## Minimal complete example

This example is the shortest complete goal stage from the detailed page:

```python
from magma_core.base.stage import BaseTaskStage
from magma_core.base.data_structures import Situation, UserInstruction
from magma_core.base.goals import At, NotAt


class PutValveInArea3(BaseTaskStage):
    target_steps = 2
    acceptance_steps = 1

    def __init__(self):
        goals = [
            At("valve", "area3"),
            NotAt("valve", ["area1", "area2", "area4", "area5"], True),
        ]
        super().__init__(
            goals=goals,
            reset_at_end=True,
            stage_goal_description="Put the valve into area3.",
        )

        self.situation = Situation(
            memory=["You are in charge of sorting objects in a factory."],
            preserved_memory_indices=[0],
            attributes={
                "objects": ["valve"],
                "target_areas": ["area1", "area2", "area3", "area4", "area5"],
            },
            instruction=UserInstruction("Please put the valve in area3."),
            flag_answer_to_user=True,
        )
```

## Why this example is enough for a first stage

It already shows the core pieces:

- one user instruction
- one set of task attributes
- one success goal
- one forbidden-state goal
- one stage description

That is enough to build many simple pick-and-place or sorting stages.

## What to remember

### `Situation` carries the stage context

`Situation` tells MAGMA:

- what the model should remember
- which attributes are available
- what the current user instruction is
- whether the stage should end with a user-facing answer

### Prefer small, readable goals

For a first stage, prefer short predicates like:

- `At(...)`
- `NotAt(...)`

That is usually clearer than one large custom verification function.

## What this lightweight page does not cover

Use the detailed page when you need:

- text-only stages with `verification_prompt`
- `verif_log_completion(...)`
- additive stages
- `build_init_state(...)`
- unusual stage-completion logic

## What you should show next if you extend this page

The next useful example to add would be either:

- one text-only stage that asks the user for missing information
- one action stage that also checks a tool log

Those are great second examples, but they are better kept out of the shortest onboarding path.

## Next step

Once you have a first stage, continue with [Create a Task Preset (Lightweight)](./create-tasks-light.md).
