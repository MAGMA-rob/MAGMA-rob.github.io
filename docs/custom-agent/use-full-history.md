---
sidebar_position: 2
title: Run Your First LLM
---

# Run Your First LLM

Use `full-history-agent` when one model should receive the full interaction history and decide the next response or tool call. You supply a compatible checkpoint; the package already implements the MAGMA server, history management, and response conversion.

## Install and launch

Use Python 3.10 or newer and install the package through your configured MAGMA distribution. From a checkout containing `magma-core-dev/` and `agents/`:

```bash
python -m pip install -e ./magma-core-dev -e ./agents/full-history-agent
full-history-agent --model /models/my-qwen --model-format qwen --quantization none
```

Replace `/models/my-qwen` with a local Qwen checkpoint supported by the provided adapter. This example disables additional quantization and needs enough memory for that checkpoint. Model startup loads weights; merely importing configuration does not. The server listens on port 8888 by default.

The package also has GPT-OSS and MAGMA-template adapters. For a trained checkpoint or an explicit template, continue with [prompt formatting](model-prompts.md). GPT-OSS and checkpoints with native quantization must retain `--quantization auto`. Consult `full-history-agent --help` for dtype, token limits, and device placement options.

You can put model settings in a JSON configuration file and launch with `--config agent.json`. Explicit CLI options override configuration values.

## Send one instruction

These commands run without a simulation or planner:

```bash
curl --fail http://localhost:8888/health
curl --fail http://localhost:8888/v1/info
curl --fail http://localhost:8888/v1/responses \
  -H 'Content-Type: application/json' \
  --data '{"request_id":"first-call","inputs":[{"id":0,"instruction":{"type":"user","content":"Say hello briefly."},"tools":[],"attributes":{},"memory":{},"num_outputs":1}]}'
```

Health should report `{"status":"ready"}`. The response is a JSON **array** containing one candidate. Inspect `status`, `output.say`, and `memory.history`. Exact wording depends on the model. A successful candidate contains its updated memory; an invalid model output is reported with `status="error"` and an explanation.

This checks model/server integration. It does not demonstrate success on a robot task.

## What full-history remembers

The agent appends the current instruction and valid decision to `memory.history`. Initial persistent rules use `memory.memory_list`. Other keys are preserved. Returned memory is a complete replacement; to make a second manual request, pass the first response's memory back in its input. GEN and BENCH do this for their own trajectories.

`extra_keys.inference_mode=true` selects deterministic decoding in this implementation; false uses its sampling settings. Asking for several deterministic candidates can produce identical outputs.

**Next:** [Connect this server to GEN and BENCH](connect.md), or [adapt your model's prompt](model-prompts.md).
