---
sidebar_position: 4
slug: /use-magma-gen/tutorials/interuption
title: Interrupt and Resume an Interaction
---

# Interrupt and Resume an Interaction

Use an interruption when a direct instruction must be handled while a previous action sequence has not yet reached its completion answer.

## Declare the boundary

An action stage before the interruption has `flag_answer_to_user=False`. The following stage carries a direct instruction instead of `EmptyInstruction`.

```python
from magma_core.simulation.data_structures import EmptyInstruction, StageInput, UserInstruction

inputs = [
    StageInput(UserInstruction("Press sw0, then sw1."), flag_answer_to_user=False),
    StageInput(
        UserInstruction("Before continuing, press sw2."),
        flag_answer_to_user=False,
        linked_to_prev=True,
    ),
    StageInput(EmptyInstruction(), flag_answer_to_user=True),
]
```

Bind these inputs to stages verifying `sw0`, the interrupting `sw2`, and the resumed `sw1`. The first instruction describes the work to remember; the final empty input continues using the preceding status. Use explicit goals and coherent physical reset settings for each stage.

## Expected interaction

At this stage boundary, the preceding action's final status is delivered before the new instruction. The agent should handle `sw2`, then resume the original request with `sw1`. Keeping the first answer flag false leaves that original interaction unfinished; the final answer boundary closes it.

Use the `ButtonCheckpoint` class from the [complete multi-stage example](multi-stages.md) to attach these instructions to physical and log checks. For the interrupting stage, set `linked_to_prev=True` in its `StageInput` if it belongs to the same evaluated interaction, and preserve that choice in its constructor arguments when serializing it.

The runtime's continuation and skill bookkeeping is described in the [skill reference](../../reference/scenarios/skills.md). Scenario authors declare the input sequence, expected goals, and reset behavior; the agent remains responsible for choosing the actions that resume the work.

## Interruption is not cancellation

Delivering a new instruction does not automatically abort a physical trajectory at any timestep. These authored interruptions occur at the runtime's stage/result boundary. Cancelling a running skill is a separate operation, exposed by consumers using the skill manager's cancellation capability.

`linked_to_prev` groups stages as part of an interaction; it is not the trigger by itself. The direct input and the preceding false answer flag establish the delayed-input case. Decide whether the new instruction belongs to the same evaluated interaction or a separate one.

## Validate the behavior

If your stages are built by a definition, inspect them with `test-requests ... trace`. For a preset, use the tool tester to check individual physical actions. Then [run the task with GEN](../first-scenario/generate.md#check-answers-and-multi-stage-interactions) to inspect status ordering, pending work, and resumption. Enable any required skills; the manual tool tester does not exercise that complete lifecycle.

See [skills](../execution/create-cycle.md) and [interaction concepts](../../concepts/stages.md).
