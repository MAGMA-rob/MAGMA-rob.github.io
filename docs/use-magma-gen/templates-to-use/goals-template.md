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
| `On` | Checks that one object is above another object. | A stage requires stacking or object-on-object placement. |
| `AtLeastCountAt` | Checks that at least `N` objects from a set are inside a target area. | Success depends on a minimum quantity rather than one exact object. |
| `ExactCountAt` | Checks that exactly `N` objects from a set are inside a target area. | The target area must contain a precise number of relevant objects. |
| `NotAt` | Checks that an object is not inside any forbidden area. | You want to encode forbidden placements or failure zones. |
| `MaxAt` | Fails when more than `N` objects from a set are inside a target area. | You want to cap how many objects may end up in one place. |
| `And` | Combines several goals with all-of semantics. | You want a reusable grouped goal, especially in benchmark-style checks. |
| `Or` | Combines several goals with any-of semantics. | Several alternative placements or outcomes are acceptable. |
