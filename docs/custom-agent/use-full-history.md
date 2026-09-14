---
sidebar_position: 2
title: Run Your First LLM
---

# Run Your First LLM

Use `full-history-agent` when one model should receive the full interaction history and decide the next response or tool call. MAGMA model checkpoints have not been released yet. You supply a compatible checkpoint; the package already implements the MAGMA server, history management, and response conversion.

## Install and launch

Follow [installation](../use-magma-gen/quickstart/installation.md) first. Use the same
Python 3.12 environment as MAGMA-GEN, with the reference agent installed through
`python -m pip install -e ./full-history-agent`. Then launch a compatible model:

```bash
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

## Request a tool call

Before starting simulation, check that your model can select a tool and return its arguments. Send a fresh request with the button tool and robot vocabulary:

```bash
curl --fail http://localhost:8888/v1/responses \
  -H 'Content-Type: application/json' \
  --data '{"request_id":"first-tool-call","inputs":[{"id":0,"instruction":{"type":"user","content":"Use panda to press sw0."},"tools":[{"name":"press_button","description":"Press a button.","parameters":{"id":{"description":"Button name.","type":"str"}}}],"attributes":{"objects":["sw0"],"known_robots":["panda"]},"memory":{},"num_outputs":1}]}'
```

Inspect `output.tool_calls`. The expected decision is:

```json
{"say":"","tool_calls":[{"name":"press_button","arguments":{"id":"sw0"},"target_robot_name":"panda"}]}
```

This is an expected output, not a recorded model result. The HTTP call only asks the agent to choose an action; it does not move a robot. If the model produces an invalid response or only answers in text, inspect its raw completion and [prompt/parser configuration](model-prompts.md) before continuing.

Once both requests work, [connect the agent to GEN](connect.md) to execute its decisions in simulation.

## What full-history remembers

The agent appends the current instruction and valid decision to `memory.history`. Initial persistent rules use `memory.memory_list`. Other keys are preserved. Returned memory is a complete replacement; to make a second manual request, pass the first response's memory back in its input. GEN passes this memory back automatically on each trajectory.

`extra_keys.inference_mode=true` selects deterministic decoding in this implementation; false uses its sampling settings. Asking for several deterministic candidates can produce identical outputs.

**Next:** [Connect this server to GEN](connect.md), or [adapt your model's prompt](model-prompts.md).
