---
sidebar_position: 10
title: Agent HTTP Contract
---

# Agent HTTP Contract

The source of truth is [`magma_core.protocol.agent`](https://github.com/MAGMA-rob/magma-core/blob/main/src/magma_core/protocol/agent.py). GEN and BENCH use protocol **`2.0`**; endpoint paths remain `/v1/...`. Typed protocol objects reject unknown fields and enforce strict types. JSON objects inside `tools`, `attributes`, `memory`, `extra_keys`, and `internal_steps` can contain agent-specific data. JSON numbers must be finite.

| Endpoint | Request / response |
| --- | --- |
| `GET /health` | `AgentHealth`: readiness |
| `GET /v1/info` | `AgentInfo`: identity, protocol and capabilities |
| `POST /v1/responses` | `AgentRequest` → `AgentResponse`, a JSON array |

HTTP and HTTPS carry the same JSON; TLS may terminate at a reverse proxy. No Python inheritance or simulator dependency is required to implement these endpoints.

## Health and identity

A ready server returns:

```json title="GET /health"
{"status": "ready"}
```

`status` is the only health field; its only allowed value and default is `"ready"`. A server that is not ready may return HTTP 503.

An inference-only agent can return:

```json title="GET /v1/info"
{
  "protocol_version": "2.0",
  "agent_id": "my-agent",
  "agent_version": "0.1.0",
  "capabilities": {"inference": true, "coaching": false},
  "specialized_coaching": [],
  "coaching_resume": false,
  "coaching_unavailable_reason": null
}
```

| Field | Type and default |
| --- | --- |
| `protocol_version` | String; defaults to `"2.0"`. Consumers check compatibility. |
| `agent_id` | Required string identifying the implementation |
| `agent_version` | Required string identifying its version |
| `capabilities` | Required object mapping capability names to booleans; consumers require `inference: true` |
| `specialized_coaching` | List of strings; defaults to `[]` |
| `coaching_resume` | Boolean; defaults to `false` |
| `coaching_unavailable_reason` | String or null; defaults to null |

Advertise only implemented capabilities. See [coaching](agent-coaching.md) for correction kinds and resume support. Inference and coaching share `protocol_version`; there is no separate coaching version field. Local dataset export is discovered through Python entry points, not an HTTP capability.

## Inference input

| Request field | Contract |
| --- | --- |
| `request_id` | Required nonempty string |
| `inputs` | Required list of `AgentInput`; an empty list is valid and expects an empty response |

Each `AgentInput` contains:

| Field | Type, default, and constraint |
| --- | --- |
| `id` | Required strict integer, unique within this request |
| `instruction` | Required `AgentInstruction`, described below |
| `tools` | List of JSON objects; defaults to `[]` |
| `attributes` | JSON object; defaults to `{}` |
| `memory` | JSON object; defaults to `{}`; agent-owned state |
| `num_outputs` | Strict positive integer; defaults to 1 |
| `extra_keys` | JSON object; defaults to `{}`; agent-specific options |

`AgentInstruction` requires `type` (`"user"` or `"env"`) and `content` (string). A user message can introduce a task, answer a question, or provide a rule. An environment message supplies execution feedback. The protocol accepts any string content, including an empty string; it does not impose a parsed environment-payload schema.

`attributes` supplies scenario context and vocabulary; provided scenarios include declared robot names in `known_robots`. Values can change between steps. The agent must use the tools, robot names, and arguments available for the current task.

### Tool descriptions and private options

The wire schema accepts JSON objects for tool descriptions. Provided tools use this convention:

```json
{
  "name": "press_button",
  "description": "Press a button.",
  "parameters": {"id": {"description": "Button name.", "type": "str"}}
}
```

Convert these descriptions into whatever your model or provider expects. Parameter types such as `str` are MAGMA conventions, not automatically provider JSON Schema types.

Full-history and history-summarized interpret boolean `extra_keys.inference_mode` as deterministic decoding when true and sampling when false. Full-history also interprets `extra_keys.coaching` when supported. These are implementation conventions; unknown options are not automatically forwarded to a model.

## Response fields and ordering

`AgentResponse` is a JSON array of `AgentOutput`, without an outer `outputs` object. Return one entry per requested candidate, in input order and then ascending `candidate_index`, starting at zero. Match `request_id` and set `source_id` to the input's `id`.

| Output field | Type, default, and constraint |
| --- | --- |
| `request_id` | Required nonempty string, matching the request |
| `source_id` | Required strict integer, matching the input ID |
| `candidate_index` | Required strict nonnegative integer |
| `status` | Required `"completed"` or `"error"` |
| `memory` | Required JSON object; complete replacement state for this candidate |
| `internal_steps` | List of JSON objects; defaults to `[]` |
| `output` | `AgentDecision` or null; defaults to null; required non-null for `completed` |
| `error` | `AgentError` or null; defaults to null; required non-null for `error` |

`completed` requires a decision and no error. `error` requires an error and no decision. Unused `output` or `error` fields may be omitted or null. `AgentResponse.validate_request(request)` checks the complete candidate count, identifiers, and order; error candidates occupy their normal positions too.

For example, inputs with IDs 7 and 3 requesting two and one candidates respectively must produce `(source_id, candidate_index)` pairs `(7, 0)`, `(7, 1)`, `(3, 0)` in that order.

### Decisions and tool calls

| Decision field | Contract |
| --- | --- |
| `say` | String; defaults to `""` |
| `tool_calls` | List of `ToolCall`; defaults to `[]` |

| Tool-call field | Contract |
| --- | --- |
| `name` | Required nonempty string |
| `arguments` | JSON object; defaults to `{}` |
| `target_robot_name` | Required nonempty string |

Choose either user-facing text or tool calls for a step. The current decision schema validates field types but does not enforce mutual exclusion. GEN and BENCH normalize calls as actions; do not rely on accompanying text being shown. An empty decision is structurally valid but need not make progress. Tool availability, argument validity, robot selection, and task success are checked separately during execution.

## Example exchange

```json title="Request"
{
  "request_id": "demo",
  "inputs": [{
    "id": 7,
    "instruction": {"type": "user", "content": "Say hello."},
    "tools": [],
    "attributes": {},
    "memory": {},
    "num_outputs": 1,
    "extra_keys": {}
  }]
}
```

```json title="Response"
[{
  "request_id": "demo",
  "source_id": 7,
  "candidate_index": 0,
  "status": "completed",
  "memory": {},
  "internal_steps": [],
  "output": {"say": "Hello!", "tool_calls": []}
}]
```

For an action, the candidate's `output` can instead be:

```json
{
  "say": "",
  "tool_calls": [{"name": "press_button", "arguments": {"id": "sw0"}, "target_robot_name": "panda"}]
}
```

This assumes the input declares the button tool, `sw0`, and `panda`. See the [complete interaction](../../custom-agent/overview.md#one-complete-exchange) for the request and subsequent feedback.

## Environment feedback and errors

Execution feedback arrives in a later input with `instruction.type="env"`. `instruction.content` is a string; provided executors serialize a JSON payload into that string. A decoded payload may contain:

| Key | Meaning |
| --- | --- |
| `infos` | Feedback text, including robot/tool outcomes; can describe successful or failed execution |
| `previous_tool_call` | Executed actions keyed by robot name, each with `name` and `arguments` |
| `error` | Execution error text, used by BENCH for failures without robot feedback |
| `failure_reason` | Additional failure description when supplied by the executor |

These are executor conventions, not fields of `AgentInstruction`. Do not assume every payload contains every key, or that `infos` always means success. Other environment content remains possible under the string contract.

A failure instruction can look like:

```json
{
  "type": "env",
  "content": "{\"error\":\"The answer called a tool, but this text-only stage requires a user-facing response and does not allow tool calls.\"}"
}
```

An execution failure describes what happened in the environment. It is distinct from an agent error returned by `/v1/responses`.

## Agent and HTTP errors

`AgentError` requires nonempty strings `code` and `message`; optional `component` is a string or null, defaulting to null. The agent defines its error codes.

```json title="Failed candidate"
[{
  "request_id": "demo",
  "source_id": 7,
  "candidate_index": 0,
  "status": "error",
  "memory": {},
  "internal_steps": [],
  "error": {"code": "model_error", "message": "The model returned invalid JSON.", "component": "model"}
}]
```

A model/API/parsing failure should produce an error candidate inside a valid HTTP response, retaining complete memory and any diagnostic records. A not-ready server may use HTTP 503. FastAPI rejects invalid protocol requests with HTTP 422. Agent-specific validation can also return 422, as in full-history and the minimal server; these HTTP failures have no candidate array.

## Memory and internal records

Interaction state must be recoverable from the supplied memory. Each candidate returns a complete independent replacement; IDs alone cannot identify a conversation, and there is no reset endpoint. Keep model resources loaded, but do not depend on hidden mutable interaction history.

The provided agents read permanent rules from `memory.memory_list` as a list of strings. The protocol accepts a general JSON object; an agent can define its own additional memory keys. Preserve initial state you accept, or explicitly migrate it.

`internal_steps` is a list of JSON objects at the inference boundary. Supplied exporters use the more specific `InternalStep` schema for component, prompt, and raw-output records. See [memory and components](../../custom-agent/memory-and-models.md) and [coaching records](agent-coaching.md#generic-text-resume-and-internal-records).

**Guide:** [Create a complete server](../../custom-agent/create-agent.md), then [connect it to GEN or BENCH](../../custom-agent/connect.md).
