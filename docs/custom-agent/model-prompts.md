---
sidebar_position: 3
title: Adapt Your Model's Prompt
---

# Adapt Your Model's Prompt

Keep full-history when its memory and decision logic fit your use case. Adapt the prompt and verify the output parser before writing a new server.

```text
MAGMA input → messages and template variables → rendered prompt
           → model completion → parser → MAGMA decision
```

## Inputs to the MAGMA-template adapter

The `MagmaCommander` adapter passes these values to `tokenizer.apply_chat_template`:

| Variable | Meaning |
| --- | --- |
| `messages` | Previous history converted to chat roles, followed by the current instruction |
| `tools` | MAGMA tool descriptions, including names and parameter specifications |
| `permanent_rules` | Strings from `memory.memory_list` |
| `summary` | `memory.summary`, or an empty string |
| `task_attributes` | Task vocabulary, including declared robot names when available |
| `add_generation_prompt` | `True`, to start the model's answer |

User instructions map to the `user` role, environment results to `system`, and previous model decisions to `assistant`. Tool descriptions come from MAGMA; do not assume they are already OpenAI function schemas. The Qwen and GPT-OSS adapters have their own formatting paths.

## Supply a template

Here is a complete plain-text Jinja template illustrating the available variables. Use the role markers and special tokens expected by **your checkpoint** in a real deployment; this template is not a universal replacement for its training format.

```jinja2 title="agent-template.jinja"
You control the robots declared in the task attributes.
Return only JSON: either {"say":"your response","action":{}} or
{"say":"","action":{"ROBOT":{"name":"TOOL","arguments":{}}}}.
Use the available tools and actual robot names.
Tools: {{ tools | tojson }}
Rules: {{ permanent_rules | tojson }}
Attributes: {{ task_attributes | tojson }}
Summary: {{ summary }}
{% for message in messages %}
{{ message['role'] }}: {{ message['content'] }}
{% endfor %}
{% if add_generation_prompt %}
assistant:
{% endif %}
```

Launch a compatible checkpoint with the explicit adapter and JSON parser:

```bash
full-history-agent --model /models/my-checkpoint --model-format magma \
  --chat-template ./agent-template.jinja --output-style json --quantization none
```

Inspect the prompt without loading weights:

```python
from pathlib import Path
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("/models/my-checkpoint")
tokenizer.chat_template = Path("agent-template.jinja").read_text()
print(tokenizer.apply_chat_template(
    [{"role": "user", "content": "Say hello briefly."}],
    tools=[], permanent_rules=[], task_attributes={}, summary="",
    tokenize=False, add_generation_prompt=True,
))
```

After the template's instructions, this input renders `Tools: []`, `Rules: []`, `Attributes: {}`, an empty summary, then `user: Say hello briefly.` and `assistant:`. Verify that the actual checkpoint's tokenization and generation boundary agree with its training setup.

## Match the output parser

For the JSON adapter, these are two separate valid model completions:

```json
{"say":"Hello!","action":{}}
```

```json
{"say":"","action":{"panda":{"name":"press_button","arguments":{"id":"sw0"}}}}
```

The second completion is appropriate only when the input declares that robot, tool, and button. The agent converts it to the HTTP decision:

```json
{"say":"","tool_calls":[{"name":"press_button","arguments":{"id":"sw0"},"target_robot_name":"panda"}]}
```

The internal `action` format is an adapter convention; `tool_calls` is the public protocol. A candidate cannot contain both a nonempty `say` and tool calls. With the JSON parser, Markdown fences or explanatory text around the JSON are invalid. The other trained output style, `qwen_format`, parses textual blocks and tool-call content; select it only for a matching checkpoint.

Changing the template does not change the parser, the model architecture supported by the loader, or memory management. If your model uses another output representation, remote API, or inference engine, [implement that conversion in your agent](create-agent.md).

Use `--prompt-log-dir /tmp/agent-prompts` to inspect rendered prompts and raw completions. The provided agents also return internal call records for later diagnostics and export.
