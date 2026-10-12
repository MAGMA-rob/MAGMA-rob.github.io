---
pagination_prev: custom-agent/overview
pagination_next: custom-agent/create-agent
sidebar_position: 2
title: Use the Provided Agents
---

# Use the Provided Agents

These agents implement the same MAGMA HTTP interface for GEN and BENCH. Choose one, start its server, check a response and a tool call, then [connect it](connect.md).

| Agent | Model access | Extensions |
| --- | --- | --- |
| [full-history-agent](https://github.com/MAGMA-rob/full-history-agent) | Local weights through Transformers | Coaching with compatible clients, local dataset export |
| [gpt-agent](https://github.com/MAGMA-rob/gpt-agent) | Remote OpenAI API | Inference only |
| [gemini-agent](https://github.com/MAGMA-rob/gemini-agent) | Remote Gemini API | Inference only |

Use Python 3.12 with MAGMA Core installed. For GEN, follow [installation](../use-magma-gen/quickstart/installation.md); for BENCH, follow [its installation guide](../use-magma-bench/installation.md).

## Full-history with Starter MAGMA

Full-history gives one model the interaction history, current instruction, tools, attributes, and permanent rules. It builds the prompt, runs inference, converts the completion into a MAGMA decision, and appends the exchange to `memory.history`.

From your workspace with the Python environment active:

```bash
git clone https://github.com/MAGMA-rob/full-history-agent.git
python -m pip install -e ./full-history-agent
full-history-agent \
  --model lbernat/Starter-MAGMA-Qwen3-4B \
  --model-format magma
```

If you already cloned and installed the agent during GEN installation, run only the launch command.

[Starter MAGMA](https://huggingface.co/lbernat/Starter-MAGMA-Qwen3-4B) is an experimental merged Qwen3 4B checkpoint for getting started. The Hugging Face identifier is accepted directly: the first launch downloads and caches the tokenizer and weights. No separate base model or LoRA adapter is needed. Allow enough GPU memory for inference and simulation; the weights alone are about 8 GB. It can make mistakes, so use the first run to check integration.

Select **`magma`**, even though the underlying architecture is Qwen3: this checkpoint uses the MAGMA prompt and output conventions. Keep its included chat template and the default `qwen_format` parser. The server listens on port 8888.

For the equivalent `agent.json` configuration and launch, see [GEN configuration](../use-magma-gen/quickstart/configuration.md#agent-model). Explicit CLI settings override JSON settings.

### Different model formats

| Client (`--model-format`) | Purpose |
| --- | --- |
| `magma` | Checkpoints trained with the MAGMA conversation format, including Starter MAGMA |
| `qwen` | Standard Qwen chat and tool-call conventions |
| `harmony` | GPT-OSS using Harmony |
| `llama` | Supported Llama chat and tool-call conventions; coaching is unavailable |

The default `auto` detects supported formats, but explicit selection makes the starter setup clear. These clients are implementation choices in full-history. Your own agent can support a single format, use a different parser, or organize its components differently.

Read [prompt formatting](model-prompts.md) when adapting a checkpoint and the [repository README](https://github.com/MAGMA-rob/full-history-agent#model-clients) for configuration examples. GPT-OSS and natively quantized checkpoints must retain `--quantization auto`. Use `full-history-agent --help` for available options.

## GPT through a remote API

```bash
git clone https://github.com/MAGMA-rob/gpt-agent.git
python -m pip install -e ./gpt-agent
export OPENAI_API_KEY='your-key'
gpt-agent --host 127.0.0.1 --port 8888
```

The key is read from `OPENAI_API_KEY`. The agent turns MAGMA memory and instructions into context for the Responses API, translates tool descriptions into provider function schemas, then converts returned text or function calls into `say` or `tool_calls`. The selected robot becomes `target_robot_name`, and the exchange is stored in the returned memory.

Use `gpt-agent --help` or the [repository README](https://github.com/MAGMA-rob/gpt-agent) for model, reasoning, concurrency, retry, and timeout settings. It provides inference without coaching or a dataset exporter.

## Gemini through a remote API

```bash
git clone https://github.com/MAGMA-rob/gemini-agent.git
python -m pip install -e ./gemini-agent
export GEMINI_API_KEY='your-restricted-key'
gemini-agent --host 127.0.0.1 --port 8888
```

The key is read from `GEMINI_API_KEY`; the Robotics ER model requires a restricted Gemini API key. The agent builds context and function declarations for the Interactions API, sends the request, and converts the result back to a MAGMA decision and updated memory.

Use `gemini-agent --help` or the [repository README](https://github.com/MAGMA-rob/gemini-agent) for its model and API settings. It also provides inference without coaching or a dataset exporter.

Both remote agents illustrate the same flow:

```text
MAGMA input → provider context and tools → remote API
            → text or function calls → MAGMA decision + updated memory
```

A vLLM server or proprietary API fits the same pattern: translate the input into what the service expects, call it, then translate its result back. Its model endpoint does not need to expose MAGMA directly; your agent exposes MAGMA's three inference endpoints.

## Send one instruction

Run one agent at a time on port 8888. These checks need no simulation or planner:

```bash
curl --fail http://localhost:8888/health
curl --fail http://localhost:8888/v1/info
curl --fail http://localhost:8888/v1/responses \
  -H 'Content-Type: application/json' \
  --data '{"request_id":"first-call","inputs":[{"id":0,"instruction":{"type":"user","content":"Say hello briefly."},"tools":[],"attributes":{},"memory":{},"num_outputs":1}]}'
```

Health should report `{"status":"ready"}`. The response is a JSON array containing one candidate. Check `status`, `output.say`, and the returned memory. An invalid completion or API failure should appear as a candidate with `status="error"` and diagnostics. See the [HTTP reference](../reference/integrations/agent-http.md) for response fields.

## Request a tool call

Send a fresh request with a tool and robot vocabulary:

```bash
curl --fail http://localhost:8888/v1/responses \
  -H 'Content-Type: application/json' \
  --data '{"request_id":"first-tool-call","inputs":[{"id":0,"instruction":{"type":"user","content":"Use panda to press sw0."},"tools":[{"name":"press_button","description":"Press a button.","parameters":{"id":{"description":"Button name.","type":"str"}}}],"attributes":{"objects":["sw0"],"known_robots":["panda"]},"memory":{},"num_outputs":1}]}'
```

The expected decision in `output` is:

```json
{"say":"","tool_calls":[{"name":"press_button","arguments":{"id":"sw0"},"target_robot_name":"panda"}]}
```

This is an expected output, not a recorded model result. The HTTP call asks for a decision; it does not move a robot. If the agent only returns text or reports a parsing error, inspect its completion and configuration before continuing.

## Continue with the returned memory

For a second manual request, put the first candidate's entire `memory` into the new input. GEN and BENCH do this automatically. Full-history preserves `memory_list` and other keys, and adds the current instruction and valid decision to `history`.

Full-history also accepts `extra_keys.inference_mode=true` for deterministic decoding; false uses sampling. Several deterministic candidates may be identical. This option belongs to the implementation, not to every MAGMA agent.

**Next:** [Create your own agent](create-agent.md), or [connect this server to GEN or BENCH](connect.md).
