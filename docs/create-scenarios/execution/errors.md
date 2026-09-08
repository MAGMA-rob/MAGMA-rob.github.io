---
sidebar_position: 3
title: Inject a Temporary Tool Failure
slug: /create-scenarios/errors
---

# Inject a Temporary Tool Failure

Begin with one temporary execution error before adding perception or accessibility changes.

## Declare support on the tool

In the tool module, import:

```python
from magma_core.simulation.data_structures import ToolErrorSupport
from magma_scenarios.templates.errors import OneShotToolFailureError
```

Add this argument to the physical tool's existing `@register_tool` decorator:

```python
errors=[ToolErrorSupport(OneShotToolFailureError, pre=True, post=False)],
```

This declares compatibility. It does not activate an error by itself. Concrete tools classes must redeclare support when they redeclare the decorated method.

## Configure the stage

Pass these error parameters to the stage constructor:

```python
from magma_core.simulation.stage import StageErrorParameters
from magma_scenarios.templates.errors import OneShotToolFailureError

error_parameters = StageErrorParameters(
    possible_errors=[OneShotToolFailureError(failure_probability=1.0, failure_count=1)],
    min_active_errors=1,
    max_active_errors=1,
)
```

For this deterministic debugging setup, the first compatible call fails before execution, and its error state consumes one failure. A later compatible call can succeed. Reduce the probability for stochastic cases.

## Selection is not triggering

`possible_errors` holds configured instances. The runtime samples active errors per stage/trajectory within the configured count bounds. Each error then decides whether it applies to a call, possibly using `ToolExecution.context`.

Errors needing a target may defer binding by returning `None` from `initialize`. The selected error remains active; it is not equivalent to omitting the error.

## Test recovery

Exercise the physical tool manually, then use the consuming agent runtime to verify that a failed status leads to an appropriate retry or alternative action. Inspect actual injected-error flags and effective tool-call accounting rather than treating all failures as agent mistakes.

Full hooks, naming requirements, and validation: [error reference](../../reference/scenarios/errors.md).
