---
sidebar_position: 3
title: Request Templates
description: Quick overview of built-in request templates
---

# Request Templates

Requests create stages from the current `TaskState` and may also update that state after the interaction.

## `magma_core.base.user_request`

| Template | What it offers | Use when |
| --- | --- | --- |
| `BaseRequest` | Root request interface with sampling, stage creation, and optional state update hooks. | You need a fully custom request flow. |
| `BaseConstraintRequest` | Helper for requests that create one or more constraints and package them into a `ConstraintBaseStage`. | The user is adding permanent rules that the task should remember. |
| `BaseAttributesModifRequest` | Helper for requests that modify task attributes through an `AttributesModifConstraint`. | The user changes the list of available entities, areas, or other task attributes. |

## `magma_scenarios.templates.requests`

| Template | What it offers | Use when |
| --- | --- | --- |
| `GiveObjectAssignmentRequest` | Samples direct object-to-area sorting rules. | You want short permanent assignment updates such as "box_1 goes to zone_a". |
| `GiveObjectCategoryRequest` | Samples object-to-category updates. | Objects may be reclassified before later category-level routing is applied. |
| `GiveCategoryAssignmentRequest` | Samples category-to-area rules. | Users give routing rules for whole categories instead of single objects. |
| `AddValueToListRequest` | Subclass helper for requests that add values to list attributes. | You want to build requests such as "add a new allowed area" while reusing sampling logic. |
| `RemoveValueToListRequest` | Subclass helper for requests that remove values from list attributes. | You want to build requests such as "remove this area/object from the task state". |
