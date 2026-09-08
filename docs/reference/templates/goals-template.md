---
sidebar_position: 2
slug: /use-magma-gen/templates-to-use/goals-template
title: Goal Predicates
---

# Goal Predicates

Import predicates from `magma_core.simulation.goals`.

| Predicate | Purpose |
| --- | --- |
| `BaseGoal` | Define a custom batched predicate |
| `At` | Check an object at a target area |
| `On` | Check an object above another object |
| `AtLeastCountAt` | Check a minimum count at a location |
| `ExactCountAt` | Check an exact count at a location |
| `NotAt`, `MaxAt` | Express location/count restrictions |
| `And`, `Or` | Combine predicates |

Verification uses `-1` for failure, `0` for pending, and `1` for success, with one value per environment. `And` takes the minimum. `Or` succeeds if any child succeeds, remains pending if none succeeds but one is pending, and fails only when all fail. The ordinary stage goal list already uses conjunction.

`At("cube", "target", thresh=0.1)` is a minimal location predicate. Ensure names and pose representations match your environment. A goal's metadata describes the predicate; it is unrelated to curriculum scheduling.

See [goal use in stages](../../create-scenarios/building-blocks/create-stages-light.md).
