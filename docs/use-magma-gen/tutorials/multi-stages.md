---
sidebar_position: 8
title: How to Build multi-stage instruction
description: Learn how to chain several stages inside one task with `flag_answer_to_user` and `EmptyInstruction()`.
---

# How to Build multi-stage instruction

MAGMA best practise is to keep **Stage** as elementary as possible. So to target instruction like:
- *"Do X then Y"*
- *"Can you do X two times"*

We recommend use several stages.

## The two key controls

### `flag_answer_to_user`

This flag tells MAGMA whether the current stage should end with a proper user-facing answer.

- `False`: internal stage, the agent will get the return message of its previous tool
- `True`: end of a user-visible block, MAGMA will generate an additional answer step such as *'I have done X'*.

In practice, intermediate stages usually use `False`, and the last stage of the chain often uses `True`.

:::note
A task could be a sequence of chain. Generally when the user need to interact (gives new order, new constraint), the previous stage has the `flag_answer_to_use` set to True. Excepts for [Interruption](./interuption.md).
:::

### `EmptyInstruction()`

Use `EmptyInstruction()` when the next stage should continue the same interaction, without injecting a new user message.

In practise the first stage have a real `UserInstruction` and following have `EmptyInstruction` to correctly load the previous return message.

This is the standard continuation pattern in task presets.

## Minimal pattern

Here is an exemple:

```python
attrs = {
    "objects": ["ref_obj_1", "ref_obj_2", "ref_obj_3"],
    "target_areas": ["area1", "area2", "area3", "area4"],
}

self.stages = [
    AddLocationStage(
        UserInstruction("Please add area4 and area5 to your known areas."),
        "area4",
        [],
        attrs,
        flag_answer_to_user=False,
    ),
    AddLocationStage(
        EmptyInstruction(),
        "area5",
        [],
        attrs,
        flag_answer_to_user=True,
    ),
]
```

The first stage starts the interaction. The second stage continues it without a new user message, and only the last stage is responsible for the final answer.

### Advanced use in Task Preset

```python
ins = UserInstruction(content)
for j, area in enumerate(tupl[2]):
    self.stages.append(AddLocationStage(
        ins,
        area,
        [],
        copy.deepcopy(task_attributes),
        flag_answer_to_user= j == len(area)-1
    ))
    ins = EmptyInstruction()
    task_attributes["target_areas"].append(area)
```

Here you have a **simple code snippet** that allow to build multiple stages depending on the number of area to add. The flag is set to `True` only at the last, and the `ins` is overriden by an `EmptyInstruction` directly after the first stage.

## The rule to remember

`EmptyInstruction()` is only safe if the previous stage had `flag_answer_to_user=False`.

Why? Because when `flag_answer_to_user=True`, MAGMA inserts an additional answer step. So the next stage must start from a real new instruction, not from an implicit continuation.

`BaseTask.validate()` checks this for you and raises an error if the combination is invalid.

## A good mental model

- use multiple stages to verify intermediate progress
- use `EmptyInstruction()` for continuation
- put `flag_answer_to_user=True` only on the last stage of a block

:::tip
If you are writing a chain like "instruction -> internal step -> internal step -> final answer", only the last stage should usually answer the user.
:::

For more details, see:

- [Instructions inside a `Situation`](../deep-dive/create-stages.md#instructions-inside-a-situation)
- [How `flag_answer_to_user` works](../deep-dive/create-stages.md#how-flag_answer_to_user-works)
- [Common pitfalls](../deep-dive/create-stages.md#common-pitfalls)
