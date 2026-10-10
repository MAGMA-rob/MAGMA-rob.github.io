---
title: Play a Task
sidebar_position: 2
---

# Play a Task

Install the official scenarios, start the motion planner, and control a robot by typing tool calls. You do not need a model, an agent server, or MAGMA-GEN.

Once installed, launching a task takes one command. The first installation and Docker image build take longer.

## 1. Install the scenarios

You need **Linux x86_64, Python 3.12, Git, Docker**, and a desktop with working Vulkan rendering. See the [simulation prerequisites](../use-magma-gen/quickstart/installation.md#prerequisites) if your graphics drivers are not configured.

In a terminal:

```bash
mkdir -p ~/magma-playground
cd ~/magma-playground
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install "magma_scenarios==2.1.1" "magma_core[simulation]==2.0.1"
```

This installs the scenarios and their simulation dependencies, including ManiSkill, SAPIEN, and PyTorch.

## 2. Start the planner

The planner computes robot motions. In a **second terminal**:

```bash
cd ~/magma-playground
git clone https://github.com/MAGMA-rob/magma-planner-mplib.git
cd magma-planner-mplib
bash scripts/launch_planner.bash -p 8000
```

Leave this terminal running. Docker isolates the planner's MPLib dependencies from those used by the simulator. The tester connects to `http://localhost:8000` by default.

## 3. Play your first task

Back in the **first terminal**, with the Python environment still active:

```bash
magma-scenarios test-tools press_button.ButtonPressOrdered --nb-env 1
```

The simulation viewer opens. The terminal displays the instruction, available tools, and object names. This task asks you to press `sw0` twice, then `sw4`.

At the `>` prompt, type these calls **one at a time**, waiting for `RETURN STATUS` after each:

```text
press_button(id="sw0")
press_button(id="sw0")
press_button(id="sw4")
```

Watch the robot execute each call. `REWARD: [1]` means the current stage succeeded; `FINISHED TASK` marks task completion.

Use named arguments, such as `id="sw0"`. A call without a robot prefix targets `panda`; `panda.press_button(id="sw0")` works too. For other robots, use the name provided by the task.

| Command | Action |
| --- | --- |
| `reset` | Restart the task. |
| `EXIT` | Close the tester and viewer. |

## Try another task

List the installed scenarios and inspect their available tasks:

```bash
magma-scenarios list
magma-scenarios show press_button
```

Choose a task from the **`presets`** section of `show`. Use the scenario ID and preset name together, separated by a dot. For example, to play a cube-sorting task:

```bash
magma-scenarios test-tools color_sorting.CleanTablePreset --nb-env 1
```

Follow the instruction and use the tools displayed in the terminal.

<details>
<summary>Change the planner address or simulation backend</summary>

The tester reads `config.yaml` in the directory where you launch it. To use another planner address or force CPU simulation, create that file with:

```yaml
magma_planner_address: "http://localhost:8000"
benchmark:
  sim_backend: cpu
```

Simulation backends are `auto` (default), `cpu`, and `gpu`. CPU simulation still needs working graphics drivers for the viewer. Keep `--nb-env 1` for this quickstart.

</details>
