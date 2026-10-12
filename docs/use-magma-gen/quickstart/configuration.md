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
    "path": "lbernat/Starter-MAGMA-Qwen3-4B",
    "format": "magma"
  }
}
```

This uses [Starter MAGMA](https://huggingface.co/lbernat/Starter-MAGMA-Qwen3-4B),
an experimental merged Qwen3 4B checkpoint. Full-history accepts the Hugging Face
identifier directly and downloads the tokenizer and weights on first launch.
No separate base model or adapter download is needed.

Choose **`magma`** as the client: the checkpoint uses MAGMA's prompt and output
format, despite its Qwen3 architecture. Keep the included chat template and
default `qwen_format` parser. The default `auto` quantization setting loads this
checkpoint without adding quantization. Allow memory for inference and simulation;
the weights alone are about 8 GB.

To start the same model without a configuration file:

```bash
full-history-agent --model lbernat/Starter-MAGMA-Qwen3-4B --model-format magma
```

Use either this command or `full-history-agent --config ./agent.json` in the
[launch guide](launch-first-generation.md). This starter model can make mistakes;
the first run checks integration rather than guaranteeing task success.

You can also use your own compatible checkpoint, a local model directory, or
[the GPT and Gemini agents](../../custom-agent/use-full-history.md). Other prompt
formats are described in [the advanced guide](../../custom-agent/model-prompts.md).
For another agent server, its own settings replace `agent.json`; keep the reachable
server URL in the generation configuration below.

## Generation configuration

Create `config.yaml` in the same workspace:

```yaml
magma_agent_address: "http://localhost:8888"
magma_planner_address: "http://localhost:8000"

backends: {}

coaching:
  enabled: false

generate:
  seed: 42
  nb_branch: 1
  nb_env: 1
  nb_max_update: 2
  max_start_per_stage: 1
  randomized: false
```

The first run uses a provided two-button preset configuration, disables coaching, and passes `--no-judge`
to run without an additional language-model backend. This checks installation,
agent calls, and tool execution; it does **not** validate semantic answers or
collect coached corrections. Scenario-defined physical success/error checks
still apply. A model that runs correctly may still fail the task.

Keep `nb_max_update` at least **2**: Core rejects values less than or equal to one,
even with one environment and one branch.

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
want coaching. See [coaching](../coaching-and-generation.md) for the correction
workflow and `magma-gen run --help` for available command-line options.

`--no-judge` also disables coaching, including human corrections in the viewer.
To use Coach mode, keep a configured backend and remove both `--no-judge` and
`--no-coaching`. Manual corrections themselves do not call the coaching LLM.
