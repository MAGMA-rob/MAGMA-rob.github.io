---
sidebar_position: 1
slug: /use-magma-bench/overview
---

# Evaluate Your Agent with MAGMA-BENCH

MAGMA-BENCH is the evaluation workflow for testing agents on interactive, long-horizon, multi-robot tasks.

:::info Documentation status
The detailed benchmark and official evaluation guides are being prepared. To connect a v2 agent to an existing benchmark artifact, follow [Connect to GEN and BENCH](../custom-agent/connect.md).
:::

Use [full-history with your LLM](../custom-agent/use-full-history.md) for a first integration, or [create an agent package](../custom-agent/create-agent.md) for custom behavior.

## First evaluation

The first-run guide will cover prerequisites, a provided agent configuration, a small evaluation run, and its expected output.

## Tasks and metrics

The benchmark guide will explain the task suite, measured capabilities, success criteria, and interpretation of failures and partial results.

## Official evaluation protocol

The protocol will specify benchmark versions, task selection, seeds, budgets, allowed information and assistance, and the conditions needed to compare results.

## Analyze and reproduce results

The results guide will cover reports, recorded interactions, failure analysis, and the configuration needed to reproduce an evaluation.

## Custom evaluations

Evaluating custom tasks will be documented separately from the official benchmark protocol. See [Create scenarios and tasks](../create-scenarios/overview.md) for the shared authoring workflow.

## Custom agent integration

For your own LLM or a system coordinating multiple models and components, see [Custom Agent](../custom-agent/overview.md).
