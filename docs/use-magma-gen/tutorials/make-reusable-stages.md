---
sidebar_position: 3
title: Define reusable stages
description: Learn the simplest MAGMA pattern for writing reusable stages without hardcoding objects or areas.
---

# Define reusable stages

A good MAGMA stage should describe an objective, not one fixed demo case.

In the first [tutorial](./create-scenarios.md), hardcoding instruction and one one area is fine. In a real scenario, prefer a pattern where goals and `Situation` are build from arguments.

## The pattern

Let's take a look of an exemple: `ObjectToZone` in `magma_scenarios.scenarios.warehouse_sorting.stages`:
- it receives `assignment`, `all_objects`, and `instruction`
- it builds `At(...)` and `NotAt(...)` goals from those inputs
- it creates a `Situation` with the exact attributes needed by the stage

That makes the same stage reusable for:
- one object or several objects
- different target areas
- a fresh user message or a continuation with `EmptyInstruction()`

```python
class ObjectToZone(BaseTaskStage):
    target_steps = 2 #targets steps must be set according the number of tool call neded to complete the task
    acceptance_steps = 1

    def __init__(self, assignment, all_objects, instruction="none"):
        """        
        :param instruction: The instruction to give. If not specified, it will create an empty instruction.
        :param instruction: str.
        :param assignement: Dict of assignment. Objects as key and area as value. Objects which should not be manipulated must have 'none' as value.
        :type assignement: Dict[str, str]
        :param all_area: The list of all existing area.
        :type all_area: List[str]
        """
        goals = []
        # Here we build the different goals combinaison to validate the physical state
        for obj in all_objects:
            target = assignement.get(obj, None)
            forbidden_area = []
            for area in AREAS:
                if area == target:
                    goals.append(At(obj,area))
                else:
                    forbidden_area.append(area)
            if forbidden_area:
                goals.append(NotAt(obj,forbidden_area,True))

        super().__init__(goals, reset_at_end=True, stage_goal_description="...")

        # Here we initialize the situation
        self.situation = Situation(
            memory=["You are in charge of sorting objects in a factory."],
            preserved_memory_indices=[0],
            instruction=UserInstruction(instruction) if instruction != "none" else EmptyInstruction(),
            attributes={
                "objects": all_objects,
                "target_areas": AREAS,
            },
            flag_answer_to_user=False,
        )
```
:::tip
To learn more: [goals](../deep-dive/create-stages.md#goal-predicates-objective-verification-for-action-stages) and [situation](../deep-dive/create-stages.md#situation-the-initial-context-of-a-stage)
:::

## `Situation` in one minute

`Situation` is the starting context of the stage. It tells MAGMA:

- what the agent remembers with `memory`
- what the current request is with `instruction`
- which structured values tools and prompts can use with `attributes`
- whether the stage should end with a user-facing answer through `flag_answer_to_user`

For reusable stages, the important rule is simple: put variable task data in constructor arguments and `attributes`, not inside hardcoded stage.

## Reuse templates when they already exist

There are a lot of pre-defined template that you can use, or inherits from to customize the logic. Most of the time, you do not need to define a whole stage from scratch:
- `Cycle` in `magma_scenarios.templates.stages` reuses a common sorting-cycle pattern
- `AddLocationStage` and `RemoveLocationStage` reuse `ModifAttributesBaseStage`

:::tip
Keep env names, stage goals, and `Situation.attributes` aligned. If your env exposes `ref_obj_1` and `area2`, use those same names in goals and stage attributes.
:::

For more details, see:

- [Create Stages (Detailed)](../deep-dive/create-stages.md)
- [Situation: the initial context of a stage](../deep-dive/create-stages.md#situation-the-initial-context-of-a-stage)
- [Recommended stage design pattern](../deep-dive/create-stages.md#recommended-stage-design-pattern)
