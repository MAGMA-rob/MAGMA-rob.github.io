---
sidebar_position: 1
title: What can you do with MAGMA-GEN
description: MAGMA-GEN is a sophisticated system designed to enable AI agents to perform long-horizon manipulation tasks.
---


# What can you do with MAGMA-GEN

MAGMA-GEN is a data generation framework designed to train AI agents on **long-horizon, interactive robotic tasks** without relying on human demonstrations or annotations.

It enables the creation of tasks where agents must **plan, act, adapt, and remember over extended sequences (15+ steps)** in physically grounded environments powered by [ManiSkill3](https://maniskill.readthedocs.io/en/latest/#).


## 🧩 Task Formulation

MAGMA-GEN structures tasks as:

- **Tasks** → full objective  
- **Stages** → ordered sub-tasks  
- **Goals** → success conditions per stage  
- **Tools** → action interface exposed to the agent  

This creates a **hierarchical and compositional task space**, where:

- Tasks can be **fully scripted** or **procedurally generated**
- Complexity can scale without manual annotation
- Agents interact through a **tool-based API**

---

## ⚙️ How MAGMA-GEN Generates Data

The system builds trajectories through **interactive rollouts**:

1. Load a task from a scenario
2. Initialize environment and tools
3. Let the agent interact step-by-step
4. Sample multiple trajectories per state (tree exploration)
5. Prune failed executions
6. Continue from successful branches

This results in:

- Diverse trajectories  
- On-policy data  
- No human supervision  

---

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAGMA SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│  magma_gen (Data Generation)                                    │
│  ├── Builders (SFT/DPO, Single/Dual Agent)                      │
│  ├── Data Generator (Graph Management)                          │
│  ├── Executor (Environment Management)                          │
│  └── Runners (Task Orchestration)                               │
├─────────────────────────────────────────────────────────────────┤
│  magma_core (Foundation Framework)                              │
│  ├── Tasks & Stages (Task Definition)                           │
│  ├── Tools & Executors (Action System)                          │
│  ├── Data Structures (State Management)                         │
│  ├── Environments (Simulation Interface)                        │
│  └── Protocol (Communication Layer)                             │
└─────────────────────────────────────────────────────────────────┘
```
---

## 🔬 Research Positioning

MAGMA-GEN targets a gap between existing paradigms:

| Paradigm | Limitation |
|--------|-----------|
| Imitation Learning | Requires human demonstrations |
| RL (short horizon) | Poor scaling to long sequences |
| LLM agents (tool use) | Weak grounding in physical environments |

MAGMA-GEN explores:

- **Long-horizon embodied reasoning**
- **Memory-aware agents**
- **Tool-based interaction in robotics**
- **Autonomous data generation at scale**

---

## 🚀 What You Can Build

With MAGMA-GEN, you can:

- Generate datasets for **robotic instruction following**
- Train agents capable of **multi-step reasoning**
- Study **memory and planning in embodied AI**
- Prototype **real-world robotic behaviors in simulation**

---

## 🔗 Next Steps

- Follow the [Quickstart](./quickstart.md) to run your first generation
- Explore [Key Systems](./running-generation/key-systems.md)
- Understand [MAGMA concepts](../core-concepts/overview.md)
- Dive into advanced pipelines in the *Deep Dive* section