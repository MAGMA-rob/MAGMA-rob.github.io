---
pagination_next: custom-agent/use-full-history
pagination_prev: null
sidebar_position: 1
title: Understand Agent Exchanges
---

# Understand Agent Exchanges

An agent receives an instruction and context, chooses a response or actions, and returns its updated memory. MAGMA-GEN and MAGMA-BENCH execute the actions and send the next instruction or environment feedback.

You decide how to process the information. Your agent can run one local model, coordinate several models or agents, call a remote server such as vLLM, or use a hosted or proprietary API. It can build prompts, plan, retrieve information, or summarize context. The shared HTTP contract is the integration boundary; no particular algorithm, base class, or programming language is required.

## Keep interaction state in memory

`memory` is a JSON object where you put information you want to retrieve at the next call: history, a plan, a summary, or your own data. Every candidate returns a **complete memory**, which replaces the previous one. GEN and BENCH pass it back when continuing that interaction.

The agent must be **stateless for interactions**: it must be able to continue from the memory supplied in the request, even after a restart or on another worker. Keep model weights and API clients loaded, but do not keep authoritative conversation history in a server-global variable. Input IDs can be reused; they are not conversation IDs.

The provided scenarios and agents use `memory.memory_list` for permanent rules:

```json
{"memory_list": ["Keep fragile objects separate."]}
```

These are rules to retain and consider when solving tasks. Preserve them when returning memory. The rest of the memory structure is yours; `history` and `summary` are useful conventions, not required protocol fields.

GEN can ask for several candidates from the same input. Each must have independent memory:

```text
Input with memory M and num_outputs=2
  ├─ candidate 0 → decision A → memory M_A → next input with M_A
  └─ candidate 1 → decision B → memory M_B → next input with M_B
```

BENCH requests one candidate per input. Both consumers can batch several independent inputs in one request. See [advanced memory management](memory-and-models.md) for larger contexts and multiple components.

## What the agent receives

`POST /v1/responses` receives an object with `request_id` and an `inputs` list. Each input contains:

| Field | Meaning |
| --- | --- |
| `id` | Integer identifying this input within the request |
| `instruction` | `{type: "user" or "env", content: string}`: a user message or environment feedback |
| `tools` | Available tool descriptions and parameter specifications |
| `attributes` | Task vocabulary and current context, including `known_robots` |
| `memory` | The memory saved from the preceding candidate, or initial scenario memory |
| `num_outputs` | Number of candidates requested; defaults to 1 |
| `extra_keys` | Agent-specific options; defaults to an empty object |

Adapt these values to your own model or API. MAGMA tool descriptions are not automatically the function schemas expected by a remote provider.

## One complete exchange

The following examples illustrate the protocol; they are not recorded model results. The memory uses a small custom `plan` field.

### 1. Receive a user instruction

```json title="Request"
{
  "request_id": "button-1",
  "inputs": [{
    "id": 7,
    "instruction": {"type": "user", "content": "Use panda to press sw0, then confirm."},
    "tools": [{
      "name": "press_button",
      "description": "Press a button.",
      "parameters": {"id": {"description": "Button name.", "type": "str"}}
    }],
    "attributes": {"objects": ["sw0"], "known_robots": ["panda"]},
    "memory": {"memory_list": ["Only press the requested button."]},
    "num_outputs": 1,
    "extra_keys": {}
  }]
}
```

### 2. Propose an action and return memory

```json title="Response"
[{
  "request_id": "button-1",
  "source_id": 7,
  "candidate_index": 0,
  "status": "completed",
  "memory": {"memory_list": ["Only press the requested button."], "plan": "Confirm after sw0 is pressed."},
  "internal_steps": [],
  "output": {
    "say": "",
    "tool_calls": [{"name": "press_button", "arguments": {"id": "sw0"}, "target_robot_name": "panda"}]
  }
}]
```

The response is a **JSON array**, with one result per requested candidate. Match `request_id` and `source_id`, and number candidates from zero. Return results in input order, then candidate order.

### 3. Read the environment feedback

After executing the action, MAGMA sends an instruction such as:

```json
{
  "type": "env",
  "content": "{\"infos\":\"panda: press_button succeed with message: sw0 pressed.\",\"previous_tool_call\":{\"panda\":{\"name\":\"press_button\",\"arguments\":{\"id\":\"sw0\"}}}}"
}
```

This is the next input's `instruction`; the input also carries the returned memory, available tools, and current attributes. `content` is a string containing JSON. Here, `infos` describes the outcome and `previous_tool_call` identifies the executed action. Feedback can report failure too; see [environment feedback and errors](../reference/integrations/agent-http.md#environment-feedback-and-errors).

### 4. Choose the next decision

After reading the feedback, the agent can return a text decision:

```json
{"say": "sw0 is pressed.", "tool_calls": []}
```

Place this decision in the next candidate's `output`, return the new request's identifiers, and include its complete updated memory. Choose either user-facing text or tool calls for a step. The agent proposes actions; it does not execute robot tools itself.

## Start with an example or your own implementation

1. [Use the provided agents](use-full-history.md): full-history with Starter MAGMA, GPT, or Gemini.
2. [Create your agent](create-agent.md) if you need different model access or decision logic.
3. [Connect to GEN or BENCH](connect.md) using the same HTTP interface.

The [HTTP reference](../reference/integrations/agent-http.md) lists every field, default, and validation rule, including `/health`, `/v1/info`, and error responses. Coaching and dataset export are optional extensions in **Advanced**.
