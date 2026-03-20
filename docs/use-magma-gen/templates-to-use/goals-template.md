---
sidebar_position: 2
title: Goal Templates
description: Quick overview of built-in goal templates
---

# Goal Templates

Goals evaluate observations and return `1` for success, `0` while still running, and `-1` for failure.

## `magma_core.base.goals`

| Template | What it offers | Use when |
| --- | --- | --- |
| `BaseGoal` | Base predicate interface with a `verify(obs)` method. | You need a custom success or failure condition. |
| `At` | Checks that one object is inside one target area. | A stage succeeds only when a specific object reaches a specific location. |
| `CountAt` | Checks that at least `N` objects from a set are inside a target area. | Success depends on a quantity rather than one exact object. |
| `NotAt` | Checks that an object is not inside any forbidden area. | You want to encode forbidden placements or failure zones. |
