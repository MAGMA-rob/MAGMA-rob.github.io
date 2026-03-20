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
| `ObjectAssignmentConstraint` | Stores a direct object-to-area rule in `state.relations["object_area"]`. | The user gives or overrides the target area for specific objects. |
| `ObjectCategoryConstraint` | Stores an object-to-category rule in `state.relations["object_type"]`. | The user reclassifies objects before later category-based rules are applied. |
| `CategoryAreaConstraint` | Stores a category-to-area rule in `state.relations["type_area"]`. | Whole categories should map to an area instead of assigning each object one by one. |
