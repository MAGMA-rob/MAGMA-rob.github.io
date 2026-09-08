---
sidebar_position: 10
title: Perfect Traces
---

# Perfect Traces

A `PerfectTrace` is a declared reference interaction: user messages, tool calls, expected results, and agent messages. It is not a recorded physics trajectory or proof that a simulated task can be completed.

`BaseRequest.build_perfect_trace(state, parameters)` returns `None` by default. A first preset or request does not need a trace. Trace-consuming workflows, including off-policy data preparation, can require one. The current GEN checkpoint-building path also rejects requests without traces when canonical TSR checkpoints are requested.

The trace must describe the same sampled interaction as `create_stages`. Reuse its parameters and evaluate the expected rules against the pre-request state. Keep public messages, robot/tool identities, and attribute updates consistent.

`request_tester trace` is a verbose view of request construction. It does not call or validate `build_perfect_trace`.

**Next:** [Add an optional trace](../create-scenarios/traces-and-replay/perfect-traces.md). Event contract: [perfect trace reference](../reference/scenarios/perfect-traces.md).
