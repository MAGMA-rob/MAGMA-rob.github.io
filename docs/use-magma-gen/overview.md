---
sidebar_position: 1
title: Understand and Use MAGMA-GEN
description: Collect agent trajectories, validate corrected continuations, inspect runs, and export training data.
slug: /use-magma-gen/overview
---

# Understand and Use MAGMA-GEN

MAGMA-GEN collects training data by letting an agent interact with tasks in simulation. It explores alternative decisions, checks their consequences, and can request coaching when a trajectory fails or is inefficient. The resulting graph records both the agent's behavior and the outcomes of attempted corrections.

You use GEN by selecting a scenario, connecting an agent and the required services, configuring collection, and inspecting the run. You do not need to modify the generator. Scenario authoring and agent implementation have their own guides.

## The generation-to-training workflow

```text
Scenario + agent + generation settings
  → agent-generated trajectories in simulation
  → evaluation and optional coaching/re-execution
  → saved interaction graph, inspected in the viewer
  → selection and agent-specific dataset export
  → training outside this generation run
```

Generation, inspection, and export are distinct operations. A saved run contains more than the examples eventually selected for training. The viewer can follow a run while generation is active and inspect its saved graph afterward; it does not need a training-dataset export first.

| What you want to understand | Read |
| --- | --- |
| Where the situations and decisions come from | [On-policy collection and branching](generation-process.md) |
| How a mistake becomes a candidate correction | [Diagnose, propose, validate](coaching-and-generation.md) |
| How to examine progress, decisions and coached branches | [Use the graph viewer](viewer.md) |
| Which recorded examples become training data | [Export generated data](export.md) |
| Which services and run options to configure | [Run configuration](quickstart/launch-first-generation.md) and [CLI reference](../reference/generation-cli.md) |

## Why collect the agent's own experience?

A provided successful trajectory shows one way to finish a task. An agent's own rollout also exposes the situations reached through its choices: a missed observation, an incorrect tool argument, or a decision made after an unsuccessful action. These contexts are useful when the training objective includes handling mistakes and recovering from them.

GEN's educational role is to connect an observed difficulty to a proposed alternative and its tested outcome. The paper's motivation is that the learner needs examples from its own difficult contexts, including recovery after a reasonable action fails physically. A stronger coach directs additional exploration at suspected problem points instead of supplying an entirely different expert rollout. The coach's explanation is a hypothesis; execution checks whether the revised behavior actually helps in the task. For the scientific formulation and experiments, see the [MAGMA-GEN paper: Validated Recovery Supervision from Ambiguous Failures via Counterfactual Re-Execution](https://openreview.net/pdf?id=r7ZN8cPEcj). The pages here describe the current v2 user workflow, rather than reproduce the paper's experimental setup.

The mechanism ablation in Section 5.3 compares collection without coaching, coaching proposals used without re-execution validation, and the complete method. In that evaluated setting, combining coaching and re-execution yields better recovery than either ablated variant. This supports the role of both targeted proposals and outcome validation; it is not a guarantee of the same gain for every agent or scenario. See the [paper, Section 5.3](https://openreview.net/pdf?id=r7ZN8cPEcj) for the experimental conditions and results.

## On-policy collection, with explicit assistance

In the ordinary rollout, the connected agent proposes decisions and encounters the situations caused by those decisions. This is the on-policy part of collection. A coached decision is an intervention with additional assistance; its origin remains distinct in the recorded graph. Do not interpret a dataset containing coached examples as entirely unassisted agent behavior.

The agent's weights are not updated automatically during a generation run. Training happens afterward using exported data. Producing a later collection run with an updated checkpoint is a separate operation. Offpolicy preparation has a [dedicated future section](offpolicy.md).

## What you supply

A scenario supplies instructions, tools, and success conditions. Your agent supplies decisions and updated memory. Physical tools may require a motion planner; user simulation, semantic validation, and coaching use configured backends as needed. GEN coordinates these components and records what happens.

Use [full-history with your LLM](../custom-agent/use-full-history.md) and [connect it to GEN](../custom-agent/connect.md). If your tasks or agent behavior need changing, follow [scenario creation](../create-scenarios/overview.md) or [custom agents](../custom-agent/overview.md); those are separate from using the generator.
