---
sidebar_position: 1
---

# Get Started

Get started with **MAGMA** framework.

---

:::warning
🏗 This documentation is in writing 🏗
:::
---

## 🌋 Welcome to the Documentation 🌋

MAGMA is a framework for building, generating and evaluating
long-horizon robotic tasks for language agents.

It provides:
- a unified task abstraction
- tools APIs for robot interaction
- a generation system (MAGMA-GEN)
- a benchmark for evaluation (MAGMA-BENCH)

If you want to learn more about what is MAGMA, take a look at the [home page](https://MAGMA-rob.github.io)

## 🟧 Choose your workflow

The documentation of MAGMA is divided depending on the different use possibility:
- You want to **generate data, create your own task** to robustify your agents on long-horizon tasks? Start here : [**MAGMA-GEN** overview](./use-magma-gen/overview.md)
- You want to **evaluate** your language agents on long-horizon multi-robot tasks under evolving constraint? Start here : [**MAGMA-BENCH** overview](./use-magma-bench/overview.md)
<!-- - You want to **create a custom ROS2 application** to deploy a magma model on your system? Start here : . -->

---

## 🎯 Targeted Task Class

MAGMA-GEN focuses on a category of problems that are still largely underexplored:

### Long-horizon, stateful, and interruptible tasks

These tasks require agents to:

- Maintain **persistent memory** across time  
- Handle **dynamic updates of goals and constraints**  
- React to **external instructions during execution**  
- Resume partially completed plans  
- Ground reasoning into **physical actions**


## 🧠 Example Task Patterns

### 1. Rule-based object manipulation

> “Object X must go to zone A, object Z must go to zone B.”

Then later:

- “Sort X and Z”
- “Which zone is associated with X?”
- “Update the rule: X now goes to C”

👉 Requires:
- Memory
- Symbol grounding
- Rule updating


### 2. Interruptible execution

> “Start sorting objects…”
>
> “Stop. Go help workers in Hall 4.”
>
> “Resume previous task.”

👉 Requires:
- Task suspension
- Context recovery
- Plan continuity

### 3. Conditional and deferred actions

> “When you finish packaging this crate, go restock the workstation B.”

👉 Requires:
- Event-based reasoning
- Delayed execution
- Dependency tracking

### 4. Long-horizon structured plans

> “Pick object A, place it in zone B, repeat twice, then send a notification to client@client.fr.”

👉 Requires:
- Multi-step planning
- Loop execution
- Task completion tracking

---

## 🐋 Docker

**MAGMA** officially supports [docker](https://www.docker.com/) for all of its packages. If you want to use docker for a specific package, you can freely deploy into a container. Dockerfile and launching scripts are provided. 

We recommend to use docker for python server such for package `magma_agent` or `magma_mplib` which starts python server, exposes the port and ensure an isolate excution. But it's not mandatory and everything could work in a single conda environment.

## 📦 Repositories

MAGMA is divided into multiples repository. Repositories names are `magma-xxx`. They contains generally one python package `magma_xxx` with a corresponding names. For `magma-ros2-*`, they contains multiple ROS2 packages named `magma_*`.

Here is a global presentation of all packages and their dependencies.

```
+-------------+   +-------------+
| magma_gen   |   | magma_bench |
+-------------+   +-------------+
        \           /
         \         /
          v       v
        +-----------------+
        | magma_scenarios |
        +-----------------+
              |
              v
        +------------+
        | magma_core |
        +------------+
```

### Generation and Evaluation Packages

| Package           | Role                                                   | Internal Dependencies                  | Principal External Dependencies | Runtime Plugin Dependencies |
|------------------|--------------------------------------------------------|----------------------------------------|----------------------------------|------------------------------|
| `magma_core`      | Core abstractions, task logic, shared utilities        | —                                      | `torch`, `mani_skill`, `numpy`   | —                            |
| `magma_scenarios` | Scenario definitions and task environments             | `magma_core`                          | —                                | —                            |
| `magma_agent`     | Default policy / agent server implementation          | —                                      | `torch`                          | Must expose **Agent API**    |
| `magma_planner`   | Default motion planning backend implementation        | —                                      | `torch`, `mplib`                 | Must expose **Planner API**  |
| `magma_gen`       | Data generation and orchestration layer               | `magma_core`, `magma_scenarios`       | —                                | Agent API–compatible server, Planner API–compatible backend |
| `magma_bench`     | Running the benchmark to evaluate your agent          | `magma_core`, `magma_scenarios`       | —                                | Planner API–compatible backend |

#### 1. Hard Dependencies (Import-Level)

These are direct code-level dependencies required for the package to run.  
They must be installed because the package imports them directly.

Examples:
- `magma_scenarios` depends on `magma_core`
- `magma_core` depends on `torch`, `mani_skill`, and `numpy`

#### 2. Runtime Plugin Dependencies (Interface-Level)

Some packages depend on services that implement a specific API contract,  
but not on a specific implementation.

Typically, `magma_gen` requires:
  - An **Agent backend** implementing the *Agent API*
  - A **Planner backend** implementing the *Planner API*

Default implementations are provided in:
- `magma_agent` for *AGENT API*
- `magma_planner` for *Planner API*

However, these components are replaceable. Any custom backend can be used as long as it exposes the same API endpoints.

This design enables:
- Custom agent servers
- Alternative motion planners
- Distributed deployments
- Minimal or modular configurations

:::info Customization
Learn more on that in the **Customization** pannels.
:::

### Deployment Package

There are additionals repositories that allows to deloy MAGMA-robtyle application on custom robot within ROS2 framework.

 Package           | Role                                                   |
|------------------|--------------------------------------------------------|
| `magma_ros2_core`      | Core abstractions, task logic, TTS, STT        |
| `magma_ros2_apps` | Registry of application definition (Robot Interface)          |