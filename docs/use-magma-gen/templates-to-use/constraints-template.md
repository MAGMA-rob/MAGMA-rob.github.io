---
sidebar_position: 4
title: Constraint Templates
description: Quick overview of built-in constraint templates
---

# Constraint Templates

Constraints update the latent `TaskState` used to generate stages and keep track of user rules.

## `magma_core.base.constraints`

| Template | What it offers | Use when |
| --- | --- | --- |
| `BaseConstraint` | Minimal base class with `apply()` and `outdated()` hooks. | You need a custom state update or a custom validity check. |
| `AttributesModifConstraint` | Replaces the current `state.attributes` snapshot. | A request changes task attributes and the generator must work from the new attribute set. |

## `magma_scenarios.templates.constraints`

| Template | What it offers | Use when |
| --- | --- | --- |
| `RelationAssignmentConstraint` | Stores a source-to-target assignment in a configurable `state.relations[...]` dictionary, with optional source and target attribute validation. | You need object-to-area, object-to-category, category-to-area, or another persistent relation update. |

Common relation configurations:

| Relation | Constraint setup |
| --- | --- |
| Object to area | `RelationAssignmentConstraint(obj, area, "object_area", source_attribute_key="objects", target_attribute_key="target_areas")` |
| Object to category | `RelationAssignmentConstraint(obj, category, "object_type", source_attribute_key="objects")` |
| Category to area | `RelationAssignmentConstraint(category, area, "type_area", target_attribute_key="target_areas")` |
