---
sidebar_position: 10
title: Agent HTTP Contract
---

# Agent HTTP Contract

The source of truth is `magma_core.protocol.agent`. The protocol version is `2.0`; endpoint paths remain `/v1/...`. Models use strict validation and reject unknown fields. HTTP and HTTPS transport the same JSON; TLS may terminate at a reverse proxy.

| Endpoint | Request / response |
| --- | --- |
| `GET /health` | `AgentHealth`: `{"status":"ready"}` when ready |
| `GET /v1/info` | `AgentInfo`: identity, protocol and capabilities |
| `POST /v1/responses` | `AgentRequest` → `AgentResponse`, a JSON array |

## Inference input

`AgentRequest` contains nonempty `request_id` and `inputs`. Each `AgentInput` contains:

| Field | Contract |
| --- | --- |
| `id` | Strict integer, unique within the request |
| `instruction` | Required `{type: "user" or "env", content: string}` |
| `tools` | List of JSON objects, default empty |
| `attributes` | JSON object, default empty |
| `memory` | JSON object, default empty; agent-owned schema |
| `num_outputs` | Positive integer, default 1 |
| `extra_keys` | JSON object, default empty; agent-specific options |

Full-history and history-summarized interpret boolean `extra_keys.inference_mode` as deterministic decoding when true and sampling when false. This is an implementation convention, not a universal generation-parameter API. Full-history also interprets coaching payloads when supported. Unknown options are not automatically forwarded to a model.

## Response invariants

Return one `AgentOutput` per requested candidate, in input order and then ascending `candidate_index`, starting at zero. Match `request_id` and set `source_id` to the input ID. `AgentResponse.validate_request(request)` checks the complete sequence.

Every output requires `status` and the complete replacement `memory`. `internal_steps` defaults to an empty list of JSON objects.

- `completed`: requires `output: AgentDecision`, with no `error`.
- `error`: requires `error: AgentError`, with no `output`.

`AgentError` has `code`, `message`, and optional `component`. A decision has `say` (default empty string) and `tool_calls` (default empty list). Both cannot be nonempty. An empty decision is structurally valid but need not make progress in a task.

Each tool call requires nonempty `name`, JSON-object `arguments`, and nonempty `target_robot_name`. Runtime consumers perform tool/task execution checks separately from protocol validation.

## Example exchange

```json title="Request"
{"request_id":"demo","inputs":[{"id":7,"instruction":{"type":"user","content":"Say hello."},"memory":{},"num_outputs":1}]}
```

```json title="Response"
[{"request_id":"demo","source_id":7,"candidate_index":0,"status":"completed","memory":{},"internal_steps":[],"output":{"say":"Hello!","tool_calls":[]}}]
```

## Identity and capabilities

`AgentInfo` requires `agent_id`, `agent_version`, and a boolean mapping `capabilities`. Advertise `inference` accurately. `protocol_version` defaults to `2.0`. Optional coaching fields are `specialized_coaching`, `coaching_resume`, `coaching_session_version`, and `coaching_unavailable_reason`; see [coaching](agent-coaching.md). Local dataset export is discovered via entry points, not an HTTP capability.

A not-ready server may return HTTP 503. The provided FastAPI servers return 422 for invalid input. Candidate model/parsing failures use `status="error"` inside a valid response array, preserving count and diagnostics.

The server may keep model resources loaded, but interaction state must be recoverable from the supplied memory. There is no protocol reset endpoint. Batch IDs alone are not conversation IDs.

**Guide:** [Create a complete server](../../custom-agent/create-agent.md).
