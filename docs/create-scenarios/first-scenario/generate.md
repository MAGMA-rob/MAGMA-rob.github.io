---
sidebar_position: 3
title: Generate Data from Your Scenario
pagination_prev: create-scenarios/first-scenario/testing
pagination_next: null
---

# Generate Data from Your Scenario

Once the manual button test works, let an agent run `my_buttons.FirstTask` and export the recorded experience. The same preset defines the instruction, available tools, and success condition in both workflows.

## Prepare the services

Complete [GEN installation](../../use-magma-gen/quickstart/installation.md) and [configuration](../../use-magma-gen/quickstart/configuration.md). Use a compatible model with full-history, or [connect your own agent](../../custom-agent/connect.md). MAGMA model checkpoints have not been released yet.

Install your scenario package in the Python environment running GEN. If you created it under `~/magma-workspace/my-magma-scenarios`:

```bash
cd ~/magma-workspace
source .venv/bin/activate
python -m pip install -e ./my-magma-scenarios
magma-scenarios show my_buttons
```

Adjust the package path if you created it elsewhere. With Conda, activate your MAGMA environment instead of the venv. `show` should list `FirstTask` before you continue.

Start the planner, agent, and viewer using [the first three terminals in the launch guide](../../use-magma-gen/quickstart/launch-first-generation.md#terminal-1--planner). Keep them running. The commands below use the workspace's `config.yaml` and `output/` directory.

## Run your task

In the generation terminal:

```bash
cd ~/magma-workspace
source .venv/bin/activate
magma-gen run my_buttons_run --preset my_buttons.FirstTask \
  --config-path ./config.yaml --nb-env 1 --nb-branch 1 \
  --no-coaching --no-judge --no-randomized
```

Use a new run name each time: the launcher may clear an existing run directory. Compared with the first GEN example, the task selector now points to **your installed package**.

Select `my_buttons_run` in the [viewer](../../use-magma-gen/viewer.md). Inspect the instruction, the agent's proposed tool call, its execution result, and stage completion. A successful button run should call `press_button` for `sw0` and satisfy the button goal. A valid HTTP response alone does not establish task success.

The data is saved in `output/my_buttons_run`. To use the other button parameter from the tutorial, choose a new run name and append `--button sw2` to the command.

## Export the result

For a run produced by full-history:

```bash
magma-gen export output/my_buttons_run --agent full-history-agent
```

Inspect `output/my_buttons_run/datasets/` using [the export guide](../../use-magma-gen/export.md#inspect-the-exported-files). The exporter can return no examples if the graph has no eligible candidates.

For a custom agent, install and select [that agent's exporter](../../custom-agent/export.md). The selected exporter must match the agent that produced the graph.

## Check answers and multi-stage interactions

To run the [two-button preset](../interactions/multi-stages.md), register `ButtonSequence` and use `--preset my_buttons.ButtonSequence` with a new run name. Inspect both button actions and the final completion message in the viewer.

For questions, clarification, or rules that require semantic answer checks, first [configure a language-model backend](../../use-magma-gen/quickstart/configuration.md#add-a-language-model-backend-later). Remove `--no-judge` from the run command. You can keep `--no-coaching` while checking your task's answer criteria. Run your registered preset and inspect each answer stage's result, not only the model's text.

If your task uses registered skills, add `--skills` with the manifest keys to enable them, for example `--skills PressPair` for the [two-button skill](../execution/create-cycle.md). The task must still define goals and boundaries that fit those actions.

## Extend the task when needed

You now have a path from your own task to recorded agent experience. Choose an extension based on your application:

- [Adjust the preset](create-tasks-light.md) to change initialization or parameters.
- [Add several stages](../interactions/multi-stages.md) to build a longer interaction.
- [Generate task variations](../procedural-tasks/requests.md) with a definition and sampled requests.
- [Enable a validation backend](../../use-magma-gen/quickstart/configuration.md#add-a-language-model-backend-later) when your task needs semantic answer checks or coaching.
