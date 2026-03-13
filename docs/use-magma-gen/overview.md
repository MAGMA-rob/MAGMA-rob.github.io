---
sidebar_position: 1
---

# Overview

MAGMA-GEN is a sophisticated system designed to enable AI agents to perform long-horizon manipulation tasks in simulated environments without relying on human annotations. It uses [maniskill3](https://maniskill.readthedocs.io/en/latest/#) to simulate real motion and tasks.

## 📦 Packages

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

The `magma_gen` package uses the different [**scenarios**](#what-is-a-scenario) that are defined in `magma_scenarios` which relies on the different class definition from `magma_core`.

## How does the generation work?

The pipeline loads a Task defined from a [**scenarios**](#what-is-a-scenario). Each Task exposes an API of [**tool**](#what-is-a-tool) and is composed of a list of Stage. A stage is a sort of subTask that must be completed to continue over the whole Task. Each subTask define a set of Goals that must be completed to pass to the next Stage. The sequence of Stage can be fully handcrafted through a Preset or built autonomously from a Task Definition. This allows you to define custom task if you have specific interaction in mind, but also to generate an unbound set of task from the same scenarios to ensure generalization of the agent.

The Executor class is responsible for making the interface between the Task-side (dynamic allocation of Maniskill envs, computing motor action for each agents, mapping the agent call to the right function, handling env state evenement and return information to the agents) and the Agent-Side. It is also it which handles the basic semantic randomization (tool names, description, parameters, attributes...). Learn more of it in *soon*. 

The Agent-side receive state from the Executor and generate batched answer for it. Typically the agent interaction is structured around a tree-based data architecture, where we sample multiple answer from each state to ensure a proper coverage of the model distribution. At the end of the stage, fully failed trajectory are pruned, and we start over the positive trajectories, maintaining a real interaction process between each stages and ensuring a correct constraint dependences. 

## What is a tool?

A tool is a function that abstract the movement away from the agent reasoning process. It is represented as a function with possible parameters, that generate a motion for the robot. 

```python title="Tool exemple from the MakeCoffee scenario"
@register_tool(
    description="Press the start button of the coffee maker.",
    params_spec={}
)
def press_button(self, obs: Observation, env_id : int, params : dict) -> ToolExecution:
    """tool to press the starting button of the machine"""
    poses = []

    poses = compute_press_trajectory(obj_pos=obs.maniskill_obs["extra"]["coffee_maker"][env_id][:3].cpu().numpy())

    # define verifier inline
    def verifier(new_obs: Dict) -> ToolResult:
        ok = self.is_button_pressed(new_obs["extra"]["coffee_maker"][env_id][-2])   
        if ok:
            reason = f"Coffee launched!"
        else:
            reason = f"Failed to press the coffee maker button."
        return ToolResult(ok,reason,logs=Log(""))
    
    return ToolExecution(poses=poses, verifier=verifier, reason="")
```

Basically, we rely on [mplib](https://motion-planning-lib.readthedocs.io/latest/) to generate the movement. But this abstraction allows you to deploy your own AI on real robots while keeping the same abstraction. Currently MAGMA-GEN supports only motion planner to generate movement during the data generation procedure. If you want to learn more on tools, please look at *soon*.

## What is a scenario?

A scenario is generally composed of:
- A maniskill environment (based on gym and sapien)
- An API of tools
- Some Task Stages
- Some Task Definition or/and Preset