---
sidebar_position: 1
---

# Custom Agent

Choose the integration path that matches the system you want to run in MAGMA-GEN or evaluate with MAGMA-BENCH.

## A single LLM

Use this path when one model receives the interaction context and produces the next response or tool call. The integration guide will cover model access, message formatting, tool schemas, and response handling.

## A system with multiple models or components

Use this path when your agent coordinates several LLMs, memory, planning, routing, or other components. Treat the whole system as the agent being integrated. The guide will cover its external interaction contract, state across steps, and reset between episodes.

These two paths describe the agent's internal organization. They are separate from the number of robots in a scenario or the number of environments running in parallel.

:::info Documentation status
The concrete MAGMA 1.0 integration contracts and runnable examples for both paths still need to be documented in [Use your own agent](create-agent.md).
:::

## Related integrations

A coaching model backend and a robot motion planner have different roles from the agent being evaluated. Their extension guides belong in the reference:

- [Model backends](../reference/integrations/create-backends.md).
- [Motion planners](../reference/integrations/create-planner.md).
