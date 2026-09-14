---
sidebar_position: 1
title: Understand and Use MAGMA-GEN
description: Collect agent trajectories, validate corrected continuations, inspect runs, and export training data.
slug: /use-magma-gen/overview
---

import DocCardList from '@theme/DocCardList';

# Understand and Use MAGMA-GEN

New here? Follow [installation](quickstart/installation.md), then
[launch your first generation](quickstart/launch-first-generation.md). This guide
covers the v2 beta.

MAGMA-GEN collects training data by letting an agent interact with tasks in simulation. It explores alternative decisions, checks their consequences, and can request coaching when a trajectory fails or is inefficient. The resulting graph records both the agent's behavior and the outcomes of attempted corrections.

:::tip
If you are not familiar with 'coaching'. Refer to our MAGMA-GEN CORL paper or read [Diagnose, propose, validate](coaching-and-generation.md).
:::

You use GEN by selecting a scenario, connecting an agent and the required services, configuring collection, and inspecting the run. You do not need to modify the generator. [Scenario authoring](../create-scenarios/overview.md) and [agent implementation](../custom-agent/overview.md) have their own guides.

## The generation-to-training workflow

```text
Scenario + agent + generation settings
  → agent-generated trajectories in simulation (+ optional coaching)
  → saved interaction graph, inspected in the viewer
  → selection and agent-specific dataset export
  → training (not provided by magma)
```

| What you want to understand | Read |
| --- | --- |
| Where the situations and decisions come from | [On-policy collection and branching](generation-process.md) |
| How a mistake becomes a candidate correction | [Diagnose, propose, validate](coaching-and-generation.md) |
| How to examine progress, decisions and coached branches | [Use the graph viewer](viewer.md) |
| Which recorded examples become training data | [Export generated data](export.md) |
| Which services and run options to configure | [Run configuration](quickstart/launch-first-generation.md) and [CLI reference](../reference/generation-cli.md) |

## Browse the guides

<DocCardList />

## Why collect the agent's own experience?

A provided successful trajectory shows one way to finish a task which does not expose the agent ot its own distribution. Causing an inference distribution shift. To adress this we use agent's own rollout to exposes the situations reached through its choices: a missed observation, an incorrect tool argument, or a decision made after an unsuccessful action. These contexts are useful when the training objective includes handling mistakes and recovering from them.

Inspired by well known **Dagger** approaches, the coaching system allows to automatize this idea to provide guidance without needing a human supervision via the **Diagnose, propose, validate** mechanism. For the scientific formulation and experiments, see the [MAGMA-GEN paper: Validated Recovery Supervision from Ambiguous Failures via Counterfactual Re-Execution](https://openreview.net/pdf?id=r7ZN8cPEcj).

The agent's weights are not updated automatically during a generation run. Training happens afterward using exported data. This approach is more efficient than a pure Reinforcement Learning approaches that requires millions of inference steps allowing to train with supervised loss.

:::warning
The code version corresponding exactly to the paper is the v0.1. The current documentation is for a newest version of the framework.
:::
