---
sidebar_position: 4
---

# Tools

Tools are the action interface between the agent and the robotic system.
They define what the agent is allowed to do, which parameters each action accepts, and how success is checked after execution.

In MAGMA, the agent does not act on the [environment](./envs.md) directly.
It acts by selecting tools.

## 🛠️ Why Tools Exist

Tools give MAGMA a clean separation between reasoning and execution:

- the agent chooses the next action at a semantic level
- the robotics stack handles planning, control, and low-level execution

This separation keeps the agent interface stable even when the underlying robot implementation changes.
It also keeps [tasks](./tasks.md) focused on objectives rather than robot control details.

## 🔧 What a Tool Represents

A tool usually corresponds to a meaningful capability such as:

- picking an object
- placing an object in a location
- navigating to a target area
- opening or closing a container
- registering a new workspace location

From the agent's perspective, a tool is a structured callable function with arguments.
From the system's perspective, a tool is the entry point into planners, policies, or robot services.

## 📝 Tool Contract

Every tool should define:

- a name
- a description
- a parameter schema
- execution logic
- a verification mechanism

The verification step is important.
MAGMA is not only interested in whether a tool was called, but whether the call actually completed the current [stage](./tasks.md#what-a-stage-is) or not.

## 🔄 Execution Lifecycle

Conceptually, a tool call follows this lifecycle:

1. The [task](./tasks.md) exposes the available tool schema to the agent.
2. The agent selects a tool and provides structured parameters.
3. The tool converts that request into executable robot-side behavior.
4. The system executes the behavior in the [environment](./envs.md).
5. A verifier checks whether the intended effect happened.
6. Logs or outputs can update [task](./tasks.md) state or attributes.
7. The tool execution status is passed to the agent.

This makes tools more than simple wrappers.
They are the operational contract between reasoning and embodiment.

## 🧰 Tool APIs {#tool-apis}

A tool API is a class that groups related tools together.
[Tasks](./tasks.md) usually expose one tool API, or one variant of a shared API, depending on the interaction setting.

This is useful when:

- several tasks share the same base capabilities
- a benchmark should restrict the agent to a smaller action set
- one domain needs multiple tool configurations for different difficulty levels

In other words, a tool API is the capability surface that a task chooses to expose.

## 🤖 Tools and Planners

MAGMA does not require one specific execution backend.
A tool may call into:

- a motion planner
- a learned policy
- a classical controller
- a real robot service
- a hybrid robotics stack

For generation and evaluation, MAGMA commonly relies on planner-driven execution.
That is why the planner interface is an important customization point.

:::note
The official supports of policies for the generation and the evaluation is not yet available.
:::

If you need to integrate a custom execution backend, see [Custom planner integration](../customization/create-planner.md).

## 👀 Tools and Observations

Tools usually consume observations from the [environment](./envs.md), especially values exposed through the environment's observation payload.
For MAGMA, the most important part is the structured observation that allows a tool to map semantic inputs such as `"pick object_a"` to concrete world state.

Typical examples include:

- object poses
- end-effector pose
- container state
- robot state
- domain-specific metadata

The environment therefore supplies the state, and the tool interprets that state to produce an action.

## 📜 Logs and Task Progression

Tools can also emit logs or structured outputs.
These are useful for:

- updating [task](./tasks.md) attributes
- recording execution history
- validating order-dependent behavior
- preserving information for later [stages](./tasks.md#what-a-stage-is)

This matters for long-horizon tasks where success depends not only on the final world state, but also on how the interaction unfolded.

## 🧭 Design Guidance

Good MAGMA tools are:

- semantically clear to the agent
- narrow enough to be testable
- broad enough to reflect a real capability
- decoupled from task-specific heuristics

As a rule, tools should represent reusable capabilities, while [stages](./tasks.md#what-a-stage-is) should represent objectives.

## 🚀 Next Step

This page explains the role of tools.
If you want to implement them in MAGMA-GEN, continue with [Create a Tool (Lightweight)](../use-magma-gen/tutorials/create-tools-light.md).
