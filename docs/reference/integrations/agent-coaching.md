---
sidebar_position: 11
title: Agent Coaching Contract
---

# Agent Coaching Contract

The schemas live in `magma_core.protocol.agent_coaching`. They define transport and validation; the agent implements its own diagnosis/repair strategy and correction payload semantics.

## Session routes

| Route | Contract |
| --- | --- |
| `PUT /v1/coaching/sessions/{run_id}` | `CoachingSessionConfig`; shared helper returns 204 |
| `POST /v1/coaching` | `SpecializedCoachingRequest` → `SpecializedCoachingResponse` |
| `DELETE /v1/coaching/sessions/{run_id}` | Close workers after active requests; shared helper returns 204 |

`CoachingSessionConfig` carries `backends`, `provider` (`llm` or `human`), optional `endpoint`, positive `connect_timeout`, and `capture_logs`. LLM sessions require backends; human sessions require an endpoint. Backend definitions include type, endpoint, model, headers, timeout and retry count. GEN supplies effective settings. The shared session helper rejects conflicting reconfiguration with 409 and unknown/closing sessions with 404 on acquisition.

Advertise `coaching_session_version="1"` for the current session lifecycle. Inference protocol version `2.0` is a separate version.

## Request and proposal

A request contains `run_id`, `request_id`, `kind` (`failure`, `suboptimal`, `format`), `stage`, `target_step_id`, `trajectory`, and `reinjection_points`. Optional context includes `active_errors`, `diagnosis`, and `additional_info`.

Trajectory steps contain their integer ID, original `AgentInput`, optional decision/error, internal records, and execution information. The target must occur in the trajectory. A reinjection point contains a unique string ID and exactly one of an explicit input or an `input_step_id` referring to that trajectory.

A corrected response contains proposals, each with `reinjection_point_id` and a JSON-object `extra_keys`. The point must be one supplied by GEN. GEN wraps the payload as `AgentInput.extra_keys.coaching` and invokes the response endpoint. Payload contents belong to the agent's implementation.

`status="corrected"` requires proposals. `abandoned` and `error` require a reason and no proposals. Match the request ID and call `response.validate_request(request)`. Optional `logs` contain `coaching_type` and Markdown/text `content` for GEN to persist.

## Generic text resume and internal records

`coaching_resume=True` advertises support for generic text replacement through the inference path. `ReplaceSay` defines `{kind: "replace_say", text: nonempty string}`. Specialized payloads, such as full-history's `replace_decision`, are agent-specific.

`InternalStep` provides a common record shape used by the supplied exporters: `id`, `component`, `origin` (`model` or `coaching`), `full_prompt`, `input_elements`, and `output_raw`. The base inference wire contract remains a list of JSON objects; document any more specific record schema your coaching/export implementation requires.

`magma_core.workers.coaching_sessions` supplies `CoachingSessions` and `mount_coaching_routes(app, sessions, service_factory, ...)`. A service factory receives the session worker; its service implements `process(request)`. These helpers manage sessions and logs, not the agent's repair algorithm.

**Guide:** [Define your coaching logic](../../custom-agent/coaching.md). **Concept:** [Correction lifecycle](../../concepts/coaching.md).
