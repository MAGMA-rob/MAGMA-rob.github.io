---
sidebar_position: 1
---

# Setup

How to **setup** MAGMA-GEN for your configuration.

## Prerequies

You must have completed the **core installation procedure**. You have the choice between [**hybrid**](../../installation.md), [conda](../../installation.md), or [docker](../../installation.md).

## Install 

### for hybrid / conda

```bash
pip install git+https://github.com/MAGMA-rob/magma-gen.git@main
```

### for docker

```bash
git clone https://github.com/MAGMA-rob/magma-gen.git
```

Be sure that the running docker script correctly mount the folder and run pip install at the launch.

## Setup 

`magma_core` provides a default configuration file located at:

```
magma-core/src/magma_core/configs/default_config.yaml
```

This file defines the default behavior of MAGMA and can be overridden if needed.

---

# Configuration Structure

The configuration is composed of three main sections:

- `backends`
- `magma_agent_address` and `magma_planner_address`
- Default pipeline arguments (`generate`, `benchmark`)

---

### Backends

```yaml
backends: {}
```

The `backends` section defines the list of language model backends available to MAGMA.

These backends are used by:
- [Coaching](../running-generation/key-systems.md#3-intelligent-coaching)
- [User Simulation](../running-generation/key-systems.md#s)
- Curriculum systems
- Any component requiring LLM interaction

You can define multiple backend instances, each with its own configuration.

Example:

```yaml
backends:
  default_ollama:
    type: ollama
    endpoint: "http://172.16.21.1:21601/v1/chat/completions"
    default_model: "gpt-oss:20b"
    timeout: 30
    max_retry: 3
    headers:
      Authorization: null
      Content-type: "application/json"
```

#### Parameters

- `type` — Backend type (currently only `ollama`)
- `endpoint` — Full HTTP endpoint of the model server
- `default_model` — Model name used by default
- `timeout` — Request timeout (seconds)
- `max_retry` — Number of retries on failure
- `headers` — Optional HTTP headers (e.g. authorization)

Currently we mostly support Ollama server. But you can create your own clients if needed. See [**Create your own backend**](../../customization/create-backends.md).

---

### MAGMA Services

```yaml
magma_agent_address: "http://localhost:8888"
magma_planner_address: "http://localhost:8000"
```

These fields specify the addresses of:

- `magma_agent` server
- `magma_planner` server

They must match the actual running services. If you are changing them when launching their servers, you must update this path.

---

### Generation Pipeline Defaults (MAGMA-GEN)

```yaml
generate:
  mode: single
  seed: null
  nb_branch: 2
  history_length: 3
  nb_env: 64
  nb_max_update: 10
  max_start_per_stage: 10
  randomized: true
  coaching: true
```

This section defines the default parameters for the MAGMA-GEN pipeline.

These values are used unless overridden at runtime.

#### Parameters

- `mode` — Generation mode. Use `single` in the current launcher; `dual` is still parsed but rejected by `magma_gen.launch`.
- `seed` — Optional seed for reproducible task creation and runtime randomization
- `nb_branch` — Number of candidate answers generated per state
- `history_length` — History window size kept for dual-mode internals
- `nb_env` — Number of parallel ManiSkill environments
- `nb_max_update` — Maximum number of states processed in parallel
- `max_start_per_stage` — Maximum number of trajectories per stage
- `randomized` — Whether the task uses randomization
- `coaching` — Enables coaching feedback during generation

---

### How to set your own config

When using MAGMA-GEN, the configuration is loaded from our current directory. So you can create a `config.yaml` and specify the different parameters value.

:::tip Quick Setup
For your first run, if you do not change servers port, you just have to specify **one** backend to start using.
:::

When launching the pipeline, you can also overidde some of the MAGMA-GEN parameters directly with CLI. It allows you to quiclky apply some modification without modifying your default configuration.

:::tip Config with **Docker-only** Installation
Be aware that using the **docker-only** procedure, you will need to mount this `config.yaml` to the home of the container `/home/magma` **OR** modify directly the `magma-core/src/magma_core/configs/default-config.yaml`.
:::

## Next Step

Once your config is ready, continue with [Launch the first generation](./launch-first-generation.md).

If you want the full runtime reference, see [MAGMA-GEN Generation CLI](../running-generation/cli-argument.md).
