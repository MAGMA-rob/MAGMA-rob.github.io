---
sidebar_position: 2
slug: /use-magma-gen/quickstart/configuration
---

# Configure Your First Run

Complete [installation](installation.md) first. All paths
below are relative to `~/magma-workspace`.

## Agent model

Create `agent.json` in the workspace:

```json
{
  "model": {
    "path": "/absolute/path/to/your/qwen-checkpoint",
    "format": "qwen",
    "quantization": "none"
  }
}
```

Replace the path with a compatible local checkpoint. This example uses the Qwen
adapter without additional quantization, so the model must fit in available
memory alongside simulation. Other model formats and quantization options are
explained in [Run your first LLM](../../custom-agent/use-full-history.md).
Model weights are not included in the agent repository.

## Generation configuration

Create `config.yaml` in the same workspace:

```yaml
magma_agent_address: "http://localhost:8888"
magma_planner_address: "http://localhost:8000"

backends: {}

coaching:
  enabled: false
  provider: llm

generate:
  seed: 42
  nb_branch: 1
  nb_env: 1
  nb_max_update: 1
  max_start_per_stage: 1
  randomized: false
```

The first run uses a provided preset, disables coaching, and passes `--no-judge`
to run without an additional language-model backend. This checks installation,
agent calls, and tool execution; it does **not** validate semantic answers or
collect coached corrections. Scenario-defined physical success/error checks
still apply. A model that runs correctly may still fail the task.

Always pass `--config-path ./config.yaml` in the example commands. Other settings
come from the installed core defaults; do not edit files inside `site-packages`.
When replacing a configuration block, provide all settings you want in that block.

## Add a language-model backend later

Coaching, semantic answer checks, and dynamic request generation may need a
separate backend. This backend is not the MAGMA agent server. Once a compatible
Ollama server and model are available, replace `backends: {}` with:

```yaml
backends:
  local:
    type: ollama
    endpoint: "http://localhost:11434/v1/chat/completions"
    default_model: "YOUR_INSTALLED_MODEL"
    timeout: 60
    max_retry: 3
    headers:
      Content-type: "application/json"
```

Replace the model and URL with the actual service values. Both the generator and
agent must be able to reach the backend. Remove `--no-judge` to enable answer
verification; set `coaching.enabled: true` and remove `--no-coaching` when you
want coaching. See [coaching](../coaching-and-generation.md) and the
[configuration reference](../../reference/generation-cli.md).
