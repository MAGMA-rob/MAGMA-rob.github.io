---
pagination_next: use-magma-gen/overview
sidebar_position: 1
slug: /intro
---

# MAGMA v2 Beta Documentation

:::warning Beta status
This documentation is a work in progress and covers the MAGMA v2 beta. APIs and examples may change. MAGMA model checkpoints have not been released yet; the agent guides currently require you to supply a compatible model.

We aim to release the benchmark paper, code, and model checkpoints in November, before CoRL. This is a tentative target, not a confirmed release date.
:::

MAGMA is a framework for embodied AI agents working on interactive, long-horizon, multi-robot tasks. Use provided scenarios or build your own tasks and environments to generate training data with MAGMA-GEN.

## Choose your starting point

| I want to… | Start here |
| --- | --- |
| Generate data for training | [Generate data](use-magma-gen/overview.md) |
| Use my own model or agent | [Use your model or agent](custom-agent/overview.md) |
| Create my own tasks and scenarios | [Create scenarios and tasks](create-scenarios/overview.md) |

New to MAGMA? Start with **Generate data** to run a provided task, inspect its trajectory, and export the result. If you already have a specific goal, follow the corresponding guide above.

The [MAGMA-BENCH evaluation guide](use-magma-bench/overview.md) is being prepared.

## Understand and look things up

- [Concepts and architecture](concepts/overview.md) explains scenarios, tasks, stages, tools, environments, and services.
- [Reference](reference/overview.md) collects scenario authoring and agent integration contracts.
