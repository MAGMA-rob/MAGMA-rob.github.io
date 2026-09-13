---
sidebar_position: 2
slug: /use-magma-gen/quickstart/launch-first-generation
title: Run Configuration and Services
---

# Run Configuration and Services

Using GEN requires a configured scenario, a compatible running agent, simulation dependencies, and any planner/backend services needed by the task. These components can run in different processes or containers; their configured addresses must be reachable from their callers.

For one LLM, use [full-history-agent](../../custom-agent/use-full-history.md). Its model settings belong to the agent process. GEN's configuration covers simulation, service addresses, exploration and coaching. You do not need to edit generator code or implement a new agent to run a compatible checkpoint.

## Select the task and collection settings

A typical command using a working `config.yaml` and an installed preset is:

```bash
magma-gen run my_run --preset press_button.ButtonPressPreset1 \
  --config-path ./config.yaml --magma-agent-address http://localhost:8888 \
  --nb-env 1 --nb-branch 1 --no-coaching
```

This illustrates the inputs to a run, not a complete installation recipe. The button tools need their planner. Use a fresh run name: the launcher can clear existing contents in the target output directory. Run data is saved under `output/my_run`.

`--preset` selects an explicit task; `--definition` selects a request-based task definition. Branching changes exploration, environment count changes simulation concurrency, and `--no-coaching` disables assistance. See [the collection process](../generation-process.md) for their effects and [CLI/configuration reference](../../reference/generation-cli.md) for exact options.

## Observe generation and preserve the run

Start the [viewer](../viewer.md) separately before generation if you want live graph inspection. An unavailable viewer does not prevent collection. The simulation window enabled by `--gui` is a different interface.

During the run, inspect progress, failures and pending corrections. Completion of generation means the run has stopped collecting and saved its graph; it is not a guarantee that all branches succeeded or that the output contains enough selected training examples.

Keep the run directory, its `config.json`, graph files and `_coaching_logs/` where present. [Export](../export.md) reads the saved graph and produces datasets afterward. The agent exporter must be installed in that export environment, even if the inference server ran elsewhere.

## Enable coaching when it is meaningful

GEN uses the agent's advertised correction capabilities. Configure the top-level `coaching` section and its providers/backends, then collect with coaching enabled. A connected provider cannot supply correction behavior absent from the agent.

Read [diagnose, propose, validate](../coaching-and-generation.md) to interpret proposals and tested outcomes. The exact session and repair interfaces belong to agent development, not to operating GEN.
