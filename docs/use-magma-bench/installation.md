---
title: Install and Download
sidebar_position: 2
pagination_prev: use-magma-bench/overview
pagination_next: use-magma-bench/run
---

# Install and Download

Use **Linux x86_64 and Python 3.12**, with compatible GPU drivers and Vulkan support for simulation rendering. You also need Git and Docker to run the motion planner. See the [simulation prerequisites](../use-magma-gen/quickstart/installation.md#prerequisites) for graphics setup.

## 1. Install the benchmark

Create a workspace and install the exact packages required by benchmark **v1.0.0**:

```bash
mkdir -p ~/magma-benchmark
cd ~/magma-benchmark
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install "magma_bench==2.0.1" "magma_core[simulation]==2.0.1" "magma_scenarios==2.1.1"
python -m pip check
```

This installs the benchmark runner and simulation dependencies. The benchmark files, agent server, and model weights are separate.

## 2. Download the benchmark

```bash
magma-bench fetch --version 1.0.0
```

The command prints the installed benchmark directory. By default it is `~/.cache/magma-bench/datasets/v1.0.0/`, or `$XDG_CACHE_HOME/magma-bench/datasets/v1.0.0/` if that environment variable is set.

Each version has its own directory. Fetching the same version again checks and reuses the complete download. If a download is damaged, fetch into a new empty directory with `--path`.

`magma-bench fetch` without `--version` downloads the latest stable benchmark release. Use an explicit version to keep your benchmark and [package versions](overview.md#benchmark-releases) aligned.

### Choose the download directory

To keep the benchmark in your workspace instead of the default cache:

```bash
magma-bench fetch --version 1.0.0 --path ./benchmark-v1.0.0
```

Use `--benchmark-root ./benchmark-v1.0.0` when running this copy. The CLI option `--dataset 1.0.0` selects benchmark v1.0.0 from the default cache. Evaluation reads local files and never downloads the benchmark itself.

## 3. Start the motion planner

In another terminal:

```bash
cd ~/magma-benchmark
git clone https://github.com/MAGMA-rob/magma-planner-mplib.git
cd magma-planner-mplib
bash scripts/launch_planner.bash -p 8000
```

Wait for server startup and leave this terminal running. The first launch builds the Docker image. Docker keeps the planner's dependencies separate from the simulation environment.

If a planner is already running, reuse its address. The default is `http://localhost:8000`.

**Next:** [Start your agent and run an evaluation](run.md).
