---
sidebar_position: 6
slug: /use-magma-gen/tutorials/lack-information
title: Require Clarification from the Agent
---

# Require Clarification from the Agent

A clarification stage checks whether the agent asks for information it does not have. It is a text-only objective, not a tool that fills in missing data silently.

For a controlled example, use `AskingBaseStage` with an incomplete instruction and an expected clarification:

```python
from magma_core.simulation.stage import AskingBaseStage

stage = AskingBaseStage(
    question="Press the button I selected.",
    answer="Ask the user which button they selected.",
)
```

A following stage can supply the user's answer and then verify the corresponding action. Use explicit instructions and [linking](multi-stages.md) to represent that interaction. Do not let a new independent parameter draw choose a different button from the one supplied in the answer.

The installed `MissingInformationStage` is a reusable domain-oriented alternative; inspect its constructor before selecting it. Validate both the clarification and subsequent action [with GEN and a semantic judge](../first-scenario/generate.md#check-answers-and-multi-stage-interactions).
