---
sidebar_position: 5
title: Use log verification in Stages
description: Learn when to use logs, how `verif_log_completion(...)` works, and how logs combine with stage goals.
---

# Use log verification

Goals verify the final state of the environment. Logs verify what happened during the stage.

Use logs when success is not only about the final position of objects, but also about the method that was used.

## How it works

1. a tool verifier returns a `ToolResult`
2. that `ToolResult` can include a `Log`
3. the stage receives:
   - `stage_log`: logs from the current stage only
   - `full_log`: all logs collected so far
4. `verif_log_completion(...)` returns `1`, `0`, or `-1`

```python title="Log class"
class Log:
    function : str # Is set in the execute tool of the BaseTask class.
    content : Any
    action : Optional[Literal["ADD","REMOVE"]] = None

    def __init__(
            self,
            content : Any,
            action : Optional[Literal["ADD","REMOVE"]] = None
        ) -> None:
        self.content = content
        self.action = action
```
> More details on [Log](../deep-dive/create-tools.md#log)

### Example 1: forbid one tool

`ObjectToZone` in `warehouse_sorting.stages` uses normal goals to check object placement, but it also rejects `launch_cycle`:

```python
def verif_log_completion(self, stage_log, full_log) -> int:
    for log in stage_log:
        if log.function == "launch_cycle":
            return -1
    return 1
```

That means the stage is not only "put the object in the right area", but also "do it without using the cycle tool".

### Example 2: verify semantic information

`Cycle` in `magma_scenarios.templates.stages` can also check that the correct manufacturing order was logged.

```python
def verif_log_completion(self, stage_log : List[Log], full_log : List[Log]) -> int:
    if self.manu_order is None: return 1
    if len(stage_log) == 0: return 0
    if stage_log[-1].content == self.manu_order: return 1
    return -1
```

This is useful when the final physical state is correct, but you also need to verify extra task metadata.

## How logs combine with goals

For a normal action stage, MAGMA checks both:

- environment goals such as `At(...)` and `NotAt(...)`
- log verification through `verif_log_completion(...)`

By default, the stage succeeds only if both pass and fail if one of them fail.

:::info
[Stage logs: verifying what happened](../deep-dive/create-stages.md#stage-logs-verifying-what-happened)
:::

## Define a tool that use logs

As you see in the exemple, we need to have tools that register logs when they are executed. This is done inside the `ToolResult` return of the verifier of tools.

```python
def launch_cycle(self, obs : Observation, env_id : int, params: Dict) -> ToolExecution:
    ...
    def verifier(new_obs: Dict) -> ToolResult:
        for obj_name in obj_to_sort:
            if torch.norm(
                new_obs["extra"][obj_name][env_id][:2] - new_obs["extra"][assignment[obj_name]][env_id][:2]
                ) > 0.1:
                return ToolResult(False, f"A {obj_name} cube is still unsorted.")

        s = ', '.join(f'{obj} to {ass}' for obj, ass in assignment.items())
        return ToolResult(True, f"All objects has been sorted : {s}", logs=Log(content=manu_order))
    ...
```

:::note
If you want to use `Log(action="ADD" | "REMOVE")` to modify task attributes, that is a separate pattern. See [Allow dynamic attribute updates](./modify-attributes.md).
:::
