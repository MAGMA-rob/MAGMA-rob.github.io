---
sidebar_position: 2
slug: /use-magma-gen/tutorials/task-randomization
title: Randomize Public Vocabulary
---

# Randomize Public Vocabulary

Vocabulary randomization changes names and descriptions exposed to the model while keeping runtime identifiers stable. It is distinct from physical scene randomization and request sampling.

For the button tool in your package:

```yaml title="src/my_magma_scenarios/scenarios/buttons/randomization.yaml"
tools:
  press_button:
    name: [press_button, push_switch]
    description: [Press the selected button.]
    parameters:
      id:
        name: [id, button_name]
        description: [Name of the button to press.]
attributes:
  objects:
    - [sw0, sw1, sw2, sw3, sw4]
    - [button_a, button_b, button_c, button_d, button_e]
```

Set `randomized_config_path` on the preset or definition using a path relative to its module. Include YAML files in your provider's package data.

```python
from pathlib import Path

# Attribute on your preset or definition class:
randomized_config_path = str(Path(__file__).parent / "randomization.yaml")
```

Test manually with:

```bash
magma-scenarios test-tools my_buttons.FirstTask --nb-env 1 --randomized
```

Use the names displayed by the tester. Keep canonical names in tools, goals, observation keys, and sampled request data; the wrapper maps between public and runtime vocabularies.

Declare future attribute values in `SituationInit.all_task_attributes` when the vocabulary can grow. Alias sets must cover the relevant vocabulary. A saved `RandomizationSpec` represents the chosen mappings; the runtime wrapper consumes that selection rather than resampling at every call.

For ordinary domain messages, let the runtime translate as needed. `ToolExecution.reason_is_public` marks an already-public preparation reason and should not be enabled casually, or names may be translated incorrectly.
