---
sidebar_position: 9
title: Errors and Recovery
---

# Errors and Recovery

Error injection lets a task expose an agent to temporary execution failures or altered perception. Distinguish an error being available, selected for a stage, and actually triggered on a tool call.

The stage declares configured error instances through `StageErrorParameters`. The tool declares supported error classes through `@register_tool(errors=...)`. An error only affects a call when both sides are compatible.

`ToolErrorSupport` selects pre-execution and post-verification hooks. Runtime arguments, such as remaining failures or a bound target, are stored per trajectory. `initialize` may return `None` to delay binding until a compatible call provides context.

A failed planner, invalid call, ordinary unsuccessful action, and injected failure are distinct outcomes. Execution accounting tracks forgiven calls for selected failure categories separately from raw tool-call counts; do not inflate every stage budget to hide failures.

**Next:** [Inject a temporary error](../create-scenarios/execution/errors.md). Hook signatures and sampling rules: [error reference](../reference/scenarios/errors.md).
