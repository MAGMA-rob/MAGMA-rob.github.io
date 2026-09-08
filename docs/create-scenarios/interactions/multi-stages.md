---
sidebar_position: 1
slug: /use-magma-gen/tutorials/multi-stages
title: Build a Multi-stage Interaction
---

# Build a Multi-stage Interaction

One user instruction can require several independently verified actions. Keep the first instruction explicit and subsequent continuation inputs empty.

```python
from magma_core.simulation.data_structures import EmptyInstruction, StageInput, UserInstruction

inputs = [
    StageInput(UserInstruction("Press sw0, then sw1."), flag_answer_to_user=False),
    StageInput(EmptyInstruction(), flag_answer_to_user=True),
]
```

This is an input sequence, not a complete task: give each action stage its corresponding input and goal. Both stages must retain physical state when the next checkpoint depends on it.

## Completion answer {#flag_answer_to_user}

The final answer flag marks the end of the requested action sequence. Current GEN preparation turns it into an explicit `CompletionAnswerStage`, clears the original flag, and moves any final reset to that answer stage. Detection tools can be permitted before the completion message.

Alternatively, when explicitly assembling stages for a consumer that accepts them, append `CompletionAnswerStage()` yourself with the preceding flag false. Do not add both mechanisms to the same boundary. `CompletionAnswerStage` uses `SAY_ONLY`; use `AskingBaseStage` for a semantically checked answer.

## Linking and new inputs

`EmptyInstruction` always implies `linked_to_prev=True`. A direct user instruction defaults to a new interaction, but can set `linked_to_prev=True` for a question or interruption belonging to the current one.

A stage with an answer flag followed directly by an `EmptyInstruction` is rejected by `BaseTask.validate()` before materialization. An unfinished action sequence followed by a direct instruction has different semantics: [interruption](interruption.md).

**Reference:** [stage input and completion](../../reference/scenarios/create-stages.md#how-flag_answer_to_user-works).
