---
sidebar_position: 5
slug: /use-magma-gen/tutorials/asking-request
title: Ask the Agent a Question
---

# Ask the Agent a Question

Use a text-only stage when success depends on the agent answering a question.

```python
from magma_core.simulation.stage import AskingBaseStage

stage = AskingBaseStage(
    question="Which button should be pressed next?",
    answer="sw1",
)
```

The answer becomes the semantic validation target. The template already represents an answer stage, so it does not need another completion-answer flag.

When the agent must inspect the scene first, set `allow_tools_before_answer=True` and list the allowed detection tool names. An empty allowlist means all tools when tool use is enabled. Make the budget appropriate by setting the stage's `target_tool_calls` and `max_tool_calls` consistently; the template's defaults are one each.

Questions depending on earlier rules belong in requests: derive the expected answer from the same pre-request state used to produce the question. Do not expose the answer as a new instruction to the agent.

The tool tester skips text-only stages. Validate response correctness [with GEN and a semantic judge](../first-scenario/generate.md#check-answers-and-multi-stage-interactions). See [stage reference](../../reference/scenarios/create-stages.md).
