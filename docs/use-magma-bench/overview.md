---
pagination_prev: null
pagination_next: use-magma-bench/installation
sidebar_position: 1
slug: /use-magma-bench/overview
---

# Evaluate Your Agent with MAGMA-BENCH

MAGMA-BENCH runs a fixed suite of robot tasks in simulation, sends instructions to your agent, and saves its results. The benchmark and the Python packages have separate versions.

Start with [Install and Download](installation.md), then [Run an Evaluation](run.md).
Use [a provided agent](../custom-agent/use-full-history.md) or
[connect your own agent](../custom-agent/overview.md) through the developer guide.
Local checkpoints and remote model APIs use the same MAGMA interface.

## Benchmark releases

Use the **exact package versions** required by your benchmark release:

| Benchmark release | Python | `magma_bench` | `magma_core` | `magma_scenarios` |
| --- | --- | --- | --- | --- |
| **v1.0.0** | **3.12** | **2.0.1** | **2.0.1** | **2.1.1** |

These requirements are recorded in the benchmark's `manifest.json`. MAGMA-BENCH checks them before starting an evaluation and prints the required installation command if they do not match. Keep a separate Python environment when another benchmark release requires different versions.

Benchmark v1.0.0 contains **1,254 episodes across 19 scenarios**, including button pressing, sorting, delivery, table cleaning, laundry, coffee preparation, and packaging. Download it through the CLI from [lbernat/MAGMA-BENCH on Hugging Face](https://huggingface.co/datasets/lbernat/MAGMA-BENCH).
