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

## What happens at runtime

```text
An action completes a stage
  → its final tool status is delivered first
  → continuation of the old work is captured
  → the direct instruction waiting at the next stage is published
  → the agent handles the interruption
  → suspended work can be resumed or cancelled
```

The skill runtime detects a completed stage with a nonempty next instruction while the preceding answer flag is false. It temporarily hides that next instruction behind an empty input so the preceding status is processed first. The pending input and captured work are retained explicitly.

The captured continuation can be an agent answer proposing more work, or a saved skill tick. A skill may therefore remain running while its next action waits. Do not interpret the previous tool status as an instruction to discard the new input, or the new input as permission to silently lose the previous work.

## Interruption is not cancellation

Delivering a new instruction does not automatically abort a physical trajectory at any timestep. These authored interruptions occur at the runtime's stage/result boundary. Cancelling a running skill is a separate operation, exposed by consumers using the skill manager's cancellation capability.

`linked_to_prev` groups stages as part of an interaction; it is not the trigger by itself. The direct input and the preceding false answer flag establish the delayed-input case. Decide whether the new instruction belongs to the same evaluated interaction or a separate one.

## Validate the behavior

Inspect stage inputs with `test-requests ... trace`. Use the tool tester for individual physical actions. To verify status ordering, pending work, and resumption, run an agent-capable consumer with skills enabled as appropriate: the manual tool tester does not exercise that complete lifecycle.

See [skills](../execution/create-cycle.md) and [interaction concepts](../../concepts/stages.md).
