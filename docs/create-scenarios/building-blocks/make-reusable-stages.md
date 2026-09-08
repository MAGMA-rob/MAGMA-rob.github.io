---
sidebar_position: 4
slug: /use-magma-gen/tutorials/make-reusable-stages
title: Make Stages Reusable
---

# Make Stages Reusable

A reusable stage keeps the same verification logic while accepting different objectives and interaction inputs. Parameterize the expected arrangement and checkpoint instead of writing a new class for each task.

## A concrete example: color sorting

The installed `color_sorting` scenario defines `SortByColorStage` and its goal `CountCubes` in `magma_scenarios.scenarios.color_sorting.cs_stages`. The goal counts cubes satisfying a color-to-location assignment; the stage chooses how many correct placements are needed at this checkpoint.

```python
from magma_scenarios.scenarios.color_sorting.cs_stages import SortByColorStage

assignment = {
    "red_tray": {"red": 1},
    "blue_tray": {"blue": 1},
}

stages = [
    SortByColorStage(
        n=1,
        assignment=assignment,
        instruction="Put the red cube in the red tray and the blue cube in the blue tray.",
        last=False,
    ),
    SortByColorStage(
        n=2,
        assignment=assignment,
        instruction="none",
        last=False,
    ),
]
```

This snippet assembles stages, not a standalone preset. It needs the color-sorting environment, matching red/blue cubes and trays, and compatible tools. It cannot run in the button environment from the first tutorial.

| Checkpoint | Physical completion condition | Input |
| --- | --- | --- |
| `n=1` | At least one cube satisfies the assignment | The user's sorting instruction |
| `n=2` | Both required placements are satisfied | Continue from the preceding tool status |

`n` is a **cumulative threshold**, not an instruction to move exactly one more cube. If both cubes are already correct, both thresholds are satisfied. Counts are capped per assignment entry: extra red cubes cannot compensate for a missing blue placement.

The goal does not prescribe which cube to move first or prove that the agent moved it. Use [logs](log-verification.md) if execution order matters, and configure the initial scene if it must start unsolved.

## Reuse the logic with another objective

The same class can describe the opposite assignment:

```python
cross_color_stage = SortByColorStage(
    n=2,
    assignment={
        "red_tray": {"blue": 1},
        "blue_tray": {"red": 1},
    },
    instruction="Put the blue cube in the red tray and the red cube in the blue tray.",
    last=False,
)
# This single checkpoint covers both placements rather than one incremental move.
cross_color_stage.target_tool_calls = 6
cross_color_stage.max_tool_calls = 8
```

The goal-construction logic remains identical. The assignment changes destinations, `n` changes the required progress, and the instruction communicates the desired behavior. The budget above allows for two placements using the stage's usual three-call-per-placement model; match it to your tools and initial arrangement.

The class keeps `reset_at_end=False`, so correctly placed objects remain available for later checkpoints. Its string `"none"` is a class-specific convention that creates `EmptyInstruction()`; it is not a universal MAGMA instruction value. Your own reusable class can accept `Instruction` or `StageInput` directly.

These examples leave the completion-answer flag false to focus on physical checkpoints. Add an answer boundary where the consuming interaction requires a user-facing completion message; see [multi-stage instructions](../interactions/multi-stages.md).

## Try the provided scenario

The registered `CleanTablePreset` implements this cumulative pattern. It accounts for cubes already correctly placed and starts at the next relevant threshold. `CrossColorPreset` uses the same stage class with another assignment.

```bash
magma-scenarios show color_sorting
magma-scenarios test-tools color_sorting.CleanTablePreset --nb-env 1 --cubes_per_color 1 --max_misplaced 2
```

The preset samples colors, so follow the displayed instruction and tools instead of assuming red and blue. The stage also declares error templates: masking or failures can occur in consumers that activate them. It is a real scenario with more behavior than a minimal example.

Inspect the implementation in an installed environment:

```python
import inspect
from magma_scenarios.scenarios.color_sorting.cs_stages import CountCubes, SortByColorStage

print(inspect.getsource(CountCubes))
print(inspect.getsource(SortByColorStage))
```

## Choose your checkpoints

For “all objects sorted,” one stage checking the full arrangement may suffice. Several thresholds let you inspect progress, introduce an interruption, or change the world between actions. A single stage covering all moves needs an appropriate budget; a per-placement limit does not fit an arbitrarily long task.

An [entry transition](../execution/env-transitions.md) is useful when an external event changes the scene, such as a new delivery. Ordinary pick-and-place belongs in tools; repeated orchestration belongs in a [skill](../execution/create-cycle.md).

## Apply the pattern in your package

Keep mutable stage data per instance, with initial task vocabulary and memory in `SituationInit`. Parameterize the objective and input, then derive goals from those arguments. For saved specifications, record the same constructor data in `_to_spec_arguments()`, as the color-sorting class does.

See [Create a Stage](create-stages-light.md) for the minimal contract and [serialization](../traces-and-replay/serialization.md) for reconstruction. Use ordinary stage sequences: the current composite-stage base remains experimental.
