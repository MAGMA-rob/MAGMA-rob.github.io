---
pagination_next: use-magma-gen/quickstart/installation
sidebar_position: 1
title: Generate Data with MAGMA-GEN
description: Run a task, inspect agent decisions, and export training data.
slug: /use-magma-gen/overview
---

# Generate Data with MAGMA-GEN

MAGMA-GEN collects training data by running an agent on tasks in simulation. It records the agent's decisions and their outcomes in an interaction graph. Optional coaching proposes corrections that GEN executes and checks.

## Your first run

Use a provided button task and the full-history agent to check the complete workflow:

1. [Install MAGMA-GEN](quickstart/installation.md), the agent package, and the planner.
2. [Configure your model and services](quickstart/configuration.md).
3. [Launch a first generation](quickstart/launch-first-generation.md).
4. [Inspect the run](viewer.md) to see what the agent did and whether the task succeeded.
5. [Export the saved graph](export.md) and inspect the training examples.

The first run uses one environment and one branch, with coaching and semantic answer checks disabled. It checks the integration; task success depends on your model. A short or unsuccessful run may produce an empty dataset.

:::info Bring your own model
MAGMA model checkpoints have not been released yet. You need a checkpoint compatible with the provided agent, or [your own agent integration](../custom-agent/overview.md). Without a model, you can still [create and manually test a scenario](../create-scenarios/first-scenario/create-scenarios.md).
:::

## What you get

```text
Task + agent + generation settings
  → agent decisions executed in simulation
  → saved interaction graph
  → selected examples rendered by the agent exporter
  → training and validation datasets
```

GEN records experience and exports data. Model training happens separately; a generation run does not update the agent's weights.

## Understand and extend the workflow

After your first run, read [collection and branching](generation-process.md) to understand how GEN explores alternatives. [Coaching: diagnose, propose, validate](coaching-and-generation.md) explains how a failure can lead to a tested correction.

To collect data for your own application, [create a scenario](../create-scenarios/overview.md) or [connect your model or agent](../custom-agent/overview.md). You can change either independently.

## Software and paper versions

These guides cover the **v2 beta**. The software version used for the MAGMA-GEN paper is **v0.1**; its commands and implementation details may differ from this version.
