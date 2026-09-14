---
sidebar_position: 3
slug: /use-magma-gen/quickstart/launch-first-generation
title: Launch Your First Generation
---

# Launch Your First Generation

Start after [installation](installation.md) and
[configuration](configuration.md). Use four terminals so service logs remain
visible. The commands assume the venv setup; with Conda, use `conda activate magma`
instead of `source .venv/bin/activate`.

## Terminal 1 — planner

```bash
cd ~/magma-workspace/magma-planner-mplib
bash scripts/launch_planner.bash -p 8000
```

Wait for Uvicorn to report startup. The script builds and starts the container;
keep it running. If you chose the native planner installation, use its launch
command instead. Start only one planner on port 8000.

## Terminal 2 — agent

```bash
cd ~/magma-workspace
source .venv/bin/activate
full-history-agent --config ./agent.json
```

Wait for model loading to finish. In another terminal, check readiness:

```bash
curl --fail http://localhost:8888/health
```

Expect `{"status":"ready"}`. The configured checkpoint and GPU memory determine
how long startup takes.

:::info
You can also run the **agent server** inside a docker on a distant machine if your local gpu has not enought memory. In that case, you still need to have the package installed on the host to be able to export properly.
:::

## Terminal 3 — viewer

```bash
cd ~/magma-workspace
source .venv/bin/activate
magma-gen viewer --output-dir ./output
```

Open **http://127.0.0.1:8900**. Start the viewer before generation for live updates.
The viewer and generator must use the same output directory.

## Terminal 4 — generation

```bash
cd ~/magma-workspace
source .venv/bin/activate
magma-gen run first_run --preset press_button.ButtonPressPreset1 \
  --config-path ./config.yaml --nb-env 1 --nb-branch 1 \
  --no-coaching --no-judge --no-randomized
```

Use a new run name each time: an existing target directory can be cleared by the
launcher. Data is saved under `~/magma-workspace/output/first_run`. Select the run
in the viewer to inspect decisions and tool results. The `--gui` option, if used,
opens the simulation window; it is separate from the graph viewer.

This first run checks the service connections and simulation. It has no semantic
answer judge or coaching backend, and a completed run does not guarantee a
successful task. For data collection with these features, follow
[backend configuration](configuration.md#add-a-language-model-backend-later).

## Export the saved run

After generation finishes, from the workspace with the same environment active:

```bash
magma-gen export output/first_run --agent full-history-agent
```

The local exporter selects eligible examples from the saved graph. A failed or
short run may contain no eligible examples. It does not require the agent server
to remain running. See [export](../export.md) for output files and selection rules.

## Stop and troubleshoot

Stop the agent and viewer with `Ctrl+C` in their terminals. Stop the planner with
`docker stop magma_mplib` from another terminal.

| Problem | Check |
| --- | --- |
| Agent connection refused | Model loading completed; `/health` succeeds; port matches config |
| Planner connection refused | Docker container is running on port 8000 |
| MPLib dependency conflict | Planner was installed in the generation environment; use Docker or a separate environment |
| CUDA/Vulkan or model memory error | Drivers, checkpoint size, and GPU memory remaining for simulation |
| Exporter not found | `full-history-agent` was installed in the same environment as gen |
| Viewer is empty | Same workspace/output path; viewer started before the run; refresh after completion |

Continue with [the viewer guide](../viewer.md), [generation settings](../../reference/generation-cli.md),
or [custom scenarios](../../create-scenarios/overview.md).
