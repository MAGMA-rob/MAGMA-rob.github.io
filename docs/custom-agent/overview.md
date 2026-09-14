---
sidebar_position: 1
title: Use Your Model or Agent
---

# Use Your Model or Agent

An agent turns MAGMA's instructions, tool descriptions, task attributes, and memory into a response or tool calls. Its package owns prompt construction, model access, decision making, and memory updates. MAGMA-GEN executes the proposed actions and evaluate their effects.

## Do I need to create a package?

| Your goal | Start with |
| --- | --- |
| Run one compatible LLM with the full interaction history | [Use full-history-agent](use-full-history.md) |
| Change the prompt while retaining the provided decision and memory logic | [Adapt the chat template](model-prompts.md) |
| Use a different model API, output parser, or inference engine | [Create an agent package](create-agent.md), then replace its decision function |
| Add custom memory, planning, routing, or several models | [Create an agent package](create-agent.md), then [manage memory and components](memory-and-models.md) |

Start with full-history to obtain a first result. You do not need to implement coaching or dataset export to run inference. A model must support the selected adapter's input and output conventions; a template alone cannot make every checkpoint compatible.

One package represents the whole agent, even if it contains several models. The number of internal models is independent of the number of robots controlled or environments processed in parallel. The provided history-summarized implementation is a worked example of multi-model design in the advanced memory guide.

## Follow the integration path

1. [Run a first LLM](use-full-history.md) and inspect its response.
2. [Adapt its prompt](model-prompts.md) if your checkpoint needs another template.
3. [Connect it to GEN](connect.md).
4. If you need different behavior, [create your package](create-agent.md) and [define its state](memory-and-models.md).
5. Add your agent's [coaching logic](coaching.md) and [dataset export](export.md) when needed.

## Keep the responsibilities clear

A scenario defines the world, tools, instructions, and success conditions. An agent chooses how to solve those instructions. The motion planner executes physical trajectories; a coaching backend supplies assistance when requested. They are separate integrations.

Read [packages and services](../concepts/architecture.md) for deployment, [coaching concepts](../concepts/coaching.md) for the correction lifecycle, and the [agent HTTP reference](../reference/integrations/agent-http.md) for exact fields.
