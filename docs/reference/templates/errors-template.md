---
sidebar_position: 5
slug: /use-magma-gen/templates-to-use/errors-template
title: Error Templates
---

# Error Templates

The installed `magma_scenarios.templates.errors` exports:

| Class | Role |
| --- | --- |
| `OneShotToolFailureError` | Probabilistic pre-execution failure with a remaining-failure counter |
| `GraspFailureError` | Base for preventing access to selected targets; specialize initialization |
| `RequestedObjectGraspFailureError` | Select inaccessible surplus object instances while retaining feasible candidates |
| `MaskedObjectError` | Perception-oriented error template |

For a first test use `OneShotToolFailureError(failure_probability=1.0, failure_count=1)` in the stage and declare compatible support on the tool. Availability alone does not activate an error on every call.

Inspect each template's required context and runtime arguments before reuse. See [error injection contract](../scenarios/errors.md) and the [temporary failure guide](../../create-scenarios/execution/errors.md).
