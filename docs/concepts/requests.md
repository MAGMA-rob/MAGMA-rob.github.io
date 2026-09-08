---
sidebar_position: 6
title: Requests and Constraints
---

# Requests and Constraints

A request describes one possible interaction event during task construction: an action request, a rule update, a question, or an interruption. It can produce several stages.

```text
Current TaskState
  → eligible request weights
  → select a request
  → sample parameters once
  → create stages from those parameters
  → apply the expected symbolic change
  → optionally replay constraints
  → next TaskState
```

The sampled parameters bind the request's instruction and objectives together. Reuse them when building a perfect trace; independent random choices could describe different tasks.

`create_stages` describes what will be executed. `apply_request` advances the symbolic construction state; it does not execute tools or establish that an agent succeeded.

## Constraints and replay

A `BaseConstraint` changes the symbolic state and records itself in `constraints_history`. On replay, constraints that are `outdated` are skipped. This is useful when attributes change and old assignments may no longer be valid.

`TaskState.recompute_from_base` keeps current attributes and memory while rebuilding derived relations and properties from a base snapshot and subsequent constraints. Arbitrary derived-state mutations are not automatically replayable.

## Telling the agent about a rule

Three components have different roles:

- a constraint changes symbolic state;
- a `ConstraintBaseStage` communicates a rule and checks the agent's response;
- a `RuleRenderer` projects active symbolic rules into canonical descriptions.

A rule renderer is used by consumers that need an explicit representation of active rules. The default returns no rules; implement one when your definition supplies initial rules that those consumers must expose.

**Next:** [Write and test a request](../create-scenarios/procedural-tasks/requests.md), then [introduce constraints](../create-scenarios/interactions/constraint-cycle.md).
