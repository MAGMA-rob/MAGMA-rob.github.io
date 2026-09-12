---
sidebar_position: 1
slug: /intro
---

# Welcome to MAGMA

MAGMA is a framework for embodied AI agents working on interactive, long-horizon, multi-robot tasks. Use provided scenarios or build your own tasks and environments, generate training data with MAGMA-GEN, and evaluate agents with MAGMA-BENCH.

## Choose your starting point

| I want to… | Start here |
| --- | --- |
| Install MAGMA and try a provided example | [Get started](getting-started/overview.md) |
| Run my LLM or integrate a custom agent | [Use your model or agent](custom-agent/overview.md) |
| Evaluate my model on the benchmark | [Evaluate your agent](use-magma-bench/overview.md) |
| Generate data for training | [Generate data](use-magma-gen/overview.md) |
| Create my own tasks and scenarios | [Create scenarios and tasks](create-scenarios/overview.md) |

Start with the workflow you need. You can explore the shared concepts and implementation details as you go.

## Connect a custom model or agent system

Start with [full-history-agent](custom-agent/use-full-history.md) to run one compatible LLM, then [connect it to GEN and BENCH](custom-agent/connect.md). If you need different memory, multiple models, or custom decision logic, the [agent creation guide](custom-agent/overview.md) explains how to build a package and add its own coaching and export behavior.

## Understand and look things up

- [Concepts and architecture](concepts/overview.md) explains scenarios, tasks, stages, tools, environments, and services.
- [Reference](reference/overview.md) collects detailed contracts, reusable components, and CLI options.
