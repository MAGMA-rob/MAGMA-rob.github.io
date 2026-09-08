---
sidebar_position: 7
slug: /core-concepts/tools
title: Tools and Skills
---

# Tools and Skills

A tool is an elementary capability offered by the scenario. A skill orchestrates tools over time, retaining its own per-call state.

## Tool contract

A method decorated with `@register_tool` receives `Observation`, an environment index, and validated parameters. It returns `ToolExecution`: a trajectory or no-motion action, a verifier, and optional execution settings.

After execution, the verifier returns `ToolResult`: success, a status message, optional log, internal context, and explicit state updates. Tool success does not imply that the whole stage is complete; goals and logs are checked separately.

A tool's Python implementation sees the raw simulation data needed to execute it. This is not a promise that every part of that data is directly exposed to the language agent.

## Tool APIs

`BaseToolsAPI` groups decorated methods. Its concrete class determines the available tools. Subclasses have their own registry: inherited decorated methods are not automatically exposed. Reuse implementation logic, and explicitly decorate methods on the concrete API class.

## Skills

A skill can alternate `take_obj` and `depose`, inspect each result, retry within a chosen limit, and terminate with a message. `BaseSkill.start()` proposes the first tick; `tick(status)` processes subsequent results. Each call gets its own skill instance.

This is the extension point for iterative actions that used to be embedded in long tools with `redo`. The current `ToolExecution` has no `redo` callback. Keeping iteration in a skill makes intermediate results and interruption points visible to the orchestration layer.

A skill is not a stage: the skill performs work; the stage verifies the objective. It is also distinct from the user's custom LLM system.

## Logs and observations

A verifier reads a fresh raw observation. Capture only the call-specific values it needs, such as the target name and environment index. Use `context` for internal error-hook data, `Log` for execution evidence or attribute edits, and `state_updates` for explicit world-state changes.

**Next:** [Create a tool](../create-scenarios/building-blocks/create-tools-light.md), [compose a skill](../create-scenarios/execution/create-cycle.md), or consult the [tool reference](../reference/scenarios/create-tools.md).
