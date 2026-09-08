---
sidebar_position: 5
slug: /use-magma-gen/tutorials/log-verification
title: Verify Execution Logs
---

# Verify Execution Logs

Use logs when the way an action was performed matters, such as pressing buttons in order or registering a particular attribute. Environment goals answer whether the world is correct; logs preserve execution evidence.

A tool verifier can return `ToolResult(ok=True, logs=Log(content=button_name))`. The runtime attaches the tool function name and stage ID. Despite its plural name, `ToolResult.logs` accepts one optional `Log`, not a list.

Inside a stage that stores `self.button`:

```python
from magma_core.simulation.data_structures import Log

# Method inside the stage:
def verif_log_completion(self, stage_log: list[Log], full_log: list[Log]) -> int:
    if not stage_log:
        return 0
    return 1 if stage_log[-1].content == self.button else -1
```

This policy fails immediately on a different last log; use a different policy if your stage permits intermediate detection or retries. `stage_log` is local to the checkpoint; `full_log` includes earlier execution history.

The default combined result fails if either environment or log verification fails, succeeds if both succeed, and otherwise remains ongoing. A log-only stage can have no goals, but must override the log verifier. A text-only stage cannot combine a verification prompt with custom log verification.

For attribute changes, use `Log.action` and an additive stage. See [attribute edits](../interactions/modify-attributes.md).
