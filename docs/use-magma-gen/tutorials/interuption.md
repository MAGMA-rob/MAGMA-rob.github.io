---
sidebar_position: 9
title: Simulate User Interruption
description: Learn how to simulate realistic User Simulation.
---

# Simulate User Interruption

MAGMA-GEN targets long horizon and highly interactive tasks. It allows you to simulate interactions like:
- *"Stop what you are doing right now and do X. You will continue your task after."*
- *"When you have done with your task, do X."*

## Important Consideration

To simulate interuption at the agent level, we override the return status messages by a `UserInstruction`. Meaning that we let the action completely finish in the environment without informing the agents. This is done for two reasons:
- First, it allows to verify that the first action was correct.
- Two, we can keep things structured as stage.

## Use in Task Preset

Using in Preset is easy but requires to be setup by hand. Let's see an exemple:

```python

self.stages = [
    Cycle(
        assignment=assignment_dict,
        instruction = UserInstruction("Can you launch a cycle for all objects please?"),
        flag_answer_to_user = False,
        reset_at_end=True,
    ),
    Add(
        instruction = UserInstruction("Robot, stop what you are doing. I need you to add area4 right now! When you have done that, you can continue your precedent task."),
        flag_answer_to_user = False
    ),
    Cycle(
        assignment=assignment_dict,
        instruction = EmptyInstruction(),
        flag_answer_to_user = True
    )
]
```

As explained in [Understand Flag Answer](./multi-stages.md#flag_answer_to_user) or [Deep Dive Stages: flag](../deep-dive/create-stages.md#how-flag_answer_to_user-works), the `flag_answer_to_user` set to False, allows to make the next stage use the return status as an instruction instead of an `UserInstruction`, **at condition** that the next stage start with an `EmptyInstruction`. 

Typically, to simulate a task interuption, we keep a `UserInstruction` right after the flag. Like this, the return status is overriden by the UserInstruction and therefore the agents never receive the information about the task completion.

And we can end with a repeat of the interupted stage, without instruction. You will need to set the `reset_at_end` to `True` at the interupted stage to allows the system to return to a non-completed state before continuing the stage (that at the environment level, is in fact restarting).

## Use in Task Definition

:::warning
🏗 Work in progress
:::