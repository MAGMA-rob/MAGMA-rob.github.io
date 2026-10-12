---
sidebar_position: 1
slug: /use-magma-gen/quickstart/installation
---

# Install MAGMA-GEN

This guide targets the stable releases MAGMA-GEN **2.0.0**, Core **2.0.1**,
and Scenarios **2.1.1**.

Install generation and the agent in the same Python environment. Run the planner
in Docker to isolate its dependencies.

## Prerequisites

- Linux x86_64 and Python 3.12 (or Conda to create a Python 3.12 environment).
- Git and a working Docker installation: `docker version` must reach the daemon.
- An NVIDIA GPU with enough memory for your model and simulation, compatible
  PyTorch drivers, and Vulkan support for rendering. Follow the
  [ManiSkill system setup](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html)
  if rendering is not configured.
- Internet access for the first download of
  [Starter MAGMA](https://huggingface.co/lbernat/Starter-MAGMA-Qwen3-4B).

The example paths below use `~/magma-workspace`. The quickstart uses full-history
with Starter MAGMA, downloaded automatically when the agent starts. You can also
use [a remote GPT or Gemini agent](../../custom-agent/use-full-history.md), or
[create your own agent](../../custom-agent/create-agent.md).

## 1. Install MAGMA-GEN

```bash
mkdir -p ~/magma-workspace
cd ~/magma-workspace
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "magma_gen[gui]==2.0.0" "magma_core[simulation]==2.0.1" "magma_scenarios==2.1.1"
```

This installs core with simulation support, the official scenarios, and the
viewer dependencies.

If you prefer Conda, use `conda create -n magma python=3.12` and
`conda activate magma` instead of the two venv commands. Activate that same
environment in every Python terminal used below.

## 2. Install the reference agent

From the same workspace and activated environment:

```bash
git clone https://github.com/MAGMA-rob/full-history-agent.git
python -m pip install -e ./full-history-agent
python -m pip check
magma-gen --version
full-history-agent --help
magma-scenarios list
```

This installs [full-history-agent](https://github.com/MAGMA-rob/full-history-agent).
Editable installation lets you adapt the agent code. It also registers its local
exporter so MAGMA-GEN can export datasets. The agent server communicates with MAGMA-GEN
through HTTP, while export uses the installed Python package directly.

### Update an existing installation

Upgrade the packages in the generation environment:

```bash
python -m pip install --upgrade "magma_gen[gui]==2.0.0" "magma_core[simulation]==2.0.1" "magma_scenarios==2.1.1"
```

Update the agent package and Core in the agent's environment as well, then restart
the agent server, viewer, and generator. Inference and coaching now share the
Core HTTP protocol `2.0`. A metadata compatibility error can mean that an older
agent process is still running, even after its package was updated.

Remove `provider` and `endpoint` from old `coaching` blocks; the current configuration
rejects these fields. Use [the current configuration](configuration.md) and
[coaching guide](../coaching-and-generation.md). For older saved graphs, see
[viewer compatibility](../viewer.md#open-a-saved-run).

## 3. Clone the planner

```bash
cd ~/magma-workspace
git clone https://github.com/MAGMA-rob/magma-planner-mplib.git
```

The launch script `bash scripts/launch_planner.bash -p 8000` builds its image locally. Its first launch requires network access and takes longer while dependencies are installed.

**Why Docker?** The planner requires MPLib **0.2.1**. ManiSkill **3.0.1** requires
MPLib **0.1.1** on Linux. MAGMA-GEN uses ManiSkill, so these planner and simulation dependencies cannot share a Python environment. Docker keeps the planner separate. The two services communicate over HTTP.

### Without Docker

Use a separate environment, never the generation environment:

```bash
cd ~/magma-workspace/magma-planner-mplib
python3.12 -m venv .venv-planner
.venv-planner/bin/python -m pip install -e .
.venv-planner/bin/magma-planner serve --host 127.0.0.1 --port 8000
```

This replaces the Docker planner terminal in the launch guide. Leave it running.
