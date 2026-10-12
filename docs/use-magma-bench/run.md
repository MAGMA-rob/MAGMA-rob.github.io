---
title: Run an Evaluation
sidebar_position: 3
pagination_prev: use-magma-bench/installation
pagination_next: null
---

# Run an Evaluation

Complete [installation and download](installation.md) first. Leave the planner running, and activate the benchmark environment in your evaluation terminal:

```bash
cd ~/magma-benchmark
source .venv/bin/activate
```

## 1. Start your agent

Start your MAGMA-compatible agent in another terminal and wait until it is ready. It must support MAGMA HTTP protocol **2.0**, with `/health`, `/v1/info`, and `/v1/responses`.

You can use [full-history with Starter MAGMA, GPT, or Gemini](../custom-agent/use-full-history.md), or [connect your own agent](../custom-agent/overview.md). The developer guide explains [the shared contract](../custom-agent/overview.md), [a minimal server](../custom-agent/create-agent.md), and [connection settings](../custom-agent/connect.md#connect-to-bench). For a local server on port 8888, check:

```bash
curl --fail http://localhost:8888/health
```

## 2. Configure answer verification

The benchmark uses a separate language-model backend to judge textual answers. With an Ollama server and a model available, create `benchmark.yaml` in your workspace:

```yaml
backends:
  judge:
    type: ollama
    endpoint: "http://localhost:11434/v1/chat/completions"
    default_model: "YOUR_INSTALLED_JUDGE_MODEL"
    timeout: 60
    max_retry: 3
    headers:
      Content-type: "application/json"

benchmark:
  backend_verifier: judge
  nb_env: 1
  videos: "off"
```

Replace the model name and endpoint with your running service. This judge backend is separate from the agent being evaluated.

## 3. Run the benchmark

```bash
magma-bench run --dataset 1.0.0 \
  --config-path ./benchmark.yaml \
  --agent-address http://localhost:8888 \
  --planner-address http://localhost:8000 \
  --results-path ./eval/my-agent/part-1 \
  --run-name my-agent \
  --videos off
```

This runs all scenarios from the downloaded benchmark. Replace the server addresses if your services run elsewhere. Results are written to the exact `--results-path` directory.

If you downloaded to a custom directory, replace `--dataset 1.0.0` with `--benchmark-root ./benchmark-v1.0.0`. Use one of these options, never both.

To resume an interrupted evaluation, repeat the same command with the same result directory and compatible settings. Use a new directory when changing the agent, benchmark release, or evaluation settings.

### Check the installation without a judge

For a quick check of the agent, planner, and simulation, run only the button scenario:

```bash
magma-bench run --dataset 1.0.0 \
  --agent-address http://localhost:8888 \
  --planner-address http://localhost:8000 \
  --results-path ./eval/smoke-test \
  --scenarios press_button --nb-env 1 --skip-judge --videos off
```

`--skip-judge` automatically accepts textual answers. Use this for installation checks; it changes the evaluation and does not validate those answers.

## Results and useful options

The result directory contains `run.json` (run settings and identity), `result.json` (summary), scenario and episode results, and `progress.log`.

| Option | Use |
| --- | --- |
| `--scenarios press_button coffee` | Evaluate only the selected benchmark scenario IDs. |
| `--nb-env 4` | Run up to four simulation environments in parallel. |
| `--sim-backend cpu` | Force CPU simulation; start with `--nb-env 1`. |
| `--model-logs` | Save the agent exchanges for each episode. |
| `--videos all` | Record all episodes. |
| `--videos planner-failure` | Keep videos for terminal planner failures. |

For videos, first install the optional dependencies in the same environment:

```bash
python -m pip install "magma_bench[video]==2.0.1"
```

### Export a complete evaluation summary

Once the full benchmark is finished, merge the result parts under `./eval/my-agent` into a YAML report. For the default benchmark cache:

```bash
magma-bench stats ./eval/my-agent.yaml ./eval/my-agent \
  "${XDG_CACHE_HOME:-$HOME/.cache}/magma-bench/datasets/v1.0.0"
```

If you downloaded to a custom directory, use that path as the last argument. The report includes success rates, stage progression, robustness, and scenario breakdowns. All benchmark episodes must be covered exactly once across the parts; a partial run or infrastructure failure prevents this export.

Use `magma-bench run --help` for all evaluation options.
