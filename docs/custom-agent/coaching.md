---
sidebar_position: 7
title: Define Your Agent's Coaching Logic
---

# Define Your Agent's Coaching Logic

Your agent decides how to repair its own behavior. The shared protocol lets GEN request and execute a correction without knowing whether your package contains one LLM, a planner, or several memory components. Read [coaching concepts](../concepts/coaching.md) first.

## Choose what your agent can repair

Start with one correction kind. For example, a single-model agent can replace an invalid decision and rebuild its history. A multi-model agent may need to correct a summary, change a routing decision, or rerun downstream components. Define the repair payload and memory effects inside your package.

Full-history is one implementation: it supports `replace_say` and `replace_decision` payloads, reconstructs the exchange from the supplied input, and returns a corrected decision without another model inference. These are its behaviors, not a universal repair algorithm.

## Advertise support accurately

In `/v1/info`, list implemented `specialized_coaching` kinds (`failure`, `suboptimal`, `format`), set `capabilities.coaching`, and advertise `coaching_session_version="1"` when implementing the session protocol. `coaching_resume=True` separately opts into GEN's generic text-replacement resume path; it requires handling `replace_say` through the response endpoint.

Leave unsupported capabilities false or empty. An inference-only agent needs none of the following coaching routes.

## Implement the session and correction exchange

GEN registers its effective provider configuration with `PUT /v1/coaching/sessions/{run_id}` before specialized requests. The configuration contains backend definitions or human-provider settings. It belongs to GEN; do not require a second, conflicting coaching-backend configuration in the agent.

`POST /v1/coaching` receives a `SpecializedCoachingRequest`: correction kind, target step, stage objective, available diagnosis, active errors, trajectory inputs/decisions/internal steps, and allowed reinjection points. Your implementation returns a `SpecializedCoachingResponse`:

- `corrected`: one or more proposals, each selecting an allowed point and carrying your repair payload in `extra_keys`;
- `abandoned`: a reason the agent cannot propose a useful repair;
- `error`: a reason processing failed.

GEN places a proposal's `extra_keys` under `AgentInput.extra_keys.coaching` and sends it to `/v1/responses` at that point. Your inference path interprets this payload, reconstructs state from the supplied input, and returns the usual decision, memory, and internal records. Do not apply the correction only in a private server session that a restarted or branched request cannot reproduce.

For example, a full-history replacement proposal can carry:

```json
{
  "reinjection_point_id": "allowed-point-from-request",
  "extra_keys": {
    "kind": "replace_decision",
    "decision": {"say": "", "tool_calls": [
      {"name": "press_button", "arguments": {"id": "sw0"}, "target_robot_name": "panda"}
    ]}
  }
}
```

Use an actual point ID and available tools from the request. Your agent may define a different specialized payload, such as a summary replacement; GEN transports it, while your response handler determines its meaning.

GEN closes the session with `DELETE /v1/coaching/sessions/{run_id}`. Keep configurations immutable during a session and release workers after active requests finish. The core provides `CoachingSessions` and `mount_coaching_routes` for the shared lifecycle; the `service_factory` you supply implements your own `process(request)` repair logic. Full-history's `coaching/service.py` shows this split.

## Validate corrections

Verify unknown restart points are rejected, failed repairs return reasons, the corrected history matches the corrected decision, and ordinary subsequent calls retain no stale correction request. Return coaching logs to GEN, including failures or abandonment. GEN stores these with local diagnostics under the run's `_coaching_logs/` directory.

Backend addresses must be reachable from the agent process or container. A configured provider alone does not make an unsupported agent coachable. Run an actual corrected continuation and inspect its evaluation before claiming the repair succeeds.

**Reference:** [coaching routes and models](../reference/integrations/agent-coaching.md).
