---
sidebar_position: 1
title: Stage Templates
description: Quick overview of built-in stage templates
---

# Stage Templates

Stages define what the agent sees, how long it has to act, and how completion is verified.

## `magma_core.base.stage`

| Template | What it offers | Use when |
| --- | --- | --- |
| `BaseTaskStage` | Base class for custom stages with goals, situation, and completion logic. | You need a stage with custom environment or log verification. |
| `AskingBaseStage` | One-step text-only stage that checks whether the agent answers a question correctly. It can also allow tool calls before the final answer with `allow_tools_before_answer`. | You want to validate a direct answer, or a question that needs a narrow lookup tool before answering. |
| `ConstraintBaseStage` | One-step text-only stage that checks whether the agent understood a new rule. | A request introduces a permanent constraint that must be acknowledged first. |
| `ModifAttributesBaseStage` | One-step additive stage that checks for an `ADD` or `REMOVE` action on attributes. | A request should trigger a structured attribute update through tool use. |

## `magma_scenarios.templates.stages`

| Template | What it offers | Use when |
| --- | --- | --- |
| `MissingInformationStage` | Text-only stage that expects the agent to ask for missing information. | The user asks for an action but key routing data is not known yet. |
| `ForbiddenElemStage` | Text-only stage that expects the agent to refuse or flag forbidden elements. | The request conflicts with forbidden objects or forbidden areas. |
| `Cycle` | Ready-made sorting execution stage combining `At` and `NotAt` goals. | You want to run a sorting cycle once assignments are known. |
