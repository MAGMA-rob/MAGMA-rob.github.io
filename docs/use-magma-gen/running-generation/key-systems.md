---
sidebar_position: 1
---

# Key Ideas

Learn more about how the generation works and the different components.

## Core Concept

Magma generates training data through **on-policy, offline rollouts** that simulate an agent playing in the environment. This approach minimizes compounding errors and long-horizon drift by keeping the agent close to the training distribution while collecting both positive and negative trajectories.

:::tip
For components concepts: Tasks, Tool API, Envs... Read [Core Concepts](../../core-concepts/overview.md).
:::

## Key Benefits

### Self-correction Data

The most valuable data generated are **positive outcomes emerging from negative actions**. When an agent makes a mistake but recovers successfully, this creates gold-standard examples of self-correction that are absent from human annotations and crucial for training robust agents.

### Scaling

With MAGMA-GEN, you are able to generate 5000+ data in 1 hours, all of them are viable, robust and unique.

:::info
For more theorical details, see the [Publications](/publications) page.
:::


## Five-Pillar Architecture

### 1. **Dynamic Environment Management**
- **Parallel Execution**: Multiple environments run simultaneously with dynamic allocation
- **State Preservation**: Environment states are saved and restored between tool executions
- **Efficient Resource Use**: Free environments are immediately reassigned to new tasks
- **Multi-Agent Support**: Handles complex scenarios with multiple interacting agents
- **Autonomous Randomization**: Interface Randomization without coding

### 2. **Dual-Agent System**
- **Commander Agent**: Makes high-level decisions (what action to take)
- **Memorizer Agent**: Manages context and memory updates
- **Coordinated Execution**: Both agents work together to maintain coherent task progression
- **Branching Strategy**: Multiple execution paths explored in parallel (configurable branching factor)

:::info
The pipeline support also single agent architecture.
:::

### 3. **Intelligent Coaching**
- **External Model Integration**: Uses separate LLM backends for coaching.
- **Asynchronous Processing**: Coaching requests are queued and processed independently
- **Error Recovery**: Provides guidance when agents make mistakes
- **Context-Aware**: Coaching adapts based on current task state and agent performance

### 4. **Simulated User**
- **External Model Integration**: Uses separate LLM backends for user simulation
- **Semantic Randomization**: AUtonomous randomization of instruction to ensure more variety in language.
- **Task Interuption**: Provide system to simulate task interuption and continuation.
- **Runtime Instruction Generation**: Generate instruction from template at runtime.

### 5. **Curriculum Task Building**
- **Task Generator**: Possibility to define Task Definition and generate unbound set of tasks from it.
- **Preset Parametrization**: Possibility to parametrize presets to change at launch the task objectives.
- **Difficulty-Aware**: Autonomous curriculum system adapting task difficulty to ensure good dataset distribution.
- *open sourced in summer 2026*

## Generation Workflow

### Phase 1: Task Initialization
1. **Task Loading**: Dynamic import of task definitions or presets
2. **Environment Setup**: ManiSkill environment initialization with state management
3. **Agent Configuration**: Commander and memorizer agents are configured
4. **Graph Initialization**: Decision tree structure is prepared for data collection

### Phase 2: Interactive Rollout
1. **Agent Decision**: Commander agent proposes actions based on current situation
2. **Memory Update**: Memorizer agent updates context and memory state
3. **Environment Execution**: Actions are executed in parallel environments
4. **State Verification**: Task completion is verified using goal-based criteria
5. **Branch Management**: Successful branches continue, failed branches are coached or terminated

### Phase 3: Data Collection
1. **Trajectory Recording**: Complete action sequences are logged
2. **Outcome Classification**: Each trajectory is labeled as success/failure
3. **Memory State Tracking**: Context evolution is preserved throughout
4. **Error Analysis**: Mistakes and recoveries are identified for training value

## Technical Implementation

### Environment Orchestration

To take advantage of the high parrallelism of Maniskill, we develop a dynamic allocation system. When we receive multiple answer from agent, we attribute a free environment and execute inside the tool call. When a tool is ended, we save the current state and free the env for a future answer. This allows to stay efficient by executing multiple different tool call in different environment, allowing to handle different outcomes and different task progression without slowing the growth of the tree.

### Agent Coordination

Agent generate multiple answer from each state leading to different trajectories that we explore through a tree of trajectories. Leading to the possibility to build Preference Dataset from MAGMA-GEN, as well as classic positive dataset for Supervised Fine Tuning. The agent run inside a **magma-agent** compatible service. The default provided implementation, relies on the *transformers* librairy from Hugging Face. It allows to batch the state and recolt multiple answer in parrallel. 

### System Integration

**Coaching** and **User Simulation** are handled by an external model. This model use one of the **backend** that you define in the config (see [Setup](../quickstart/installation.md#backends)). It uses a payload system, where each request is put in a queue and treated asynchronously. To learn more about how to define your own backend or client system, check [Create your own backend](../../customization/create-backends.md).

### Dynamic Task building

While the curriculum building is not yet avalaible in the open-source version of **MAGMA-GEN**, we release a sampling task generator capable of building task from a **Task Definiton**.

## Configuration Options

### Generation Modes
- **Single Agent**: Unified decision-making for simpler tasks
- **Dual Agent**: Internal dual-agent classes still exist, but the current `magma_gen.launch` entrypoint rejects `mode: dual`. Treat dual mode as legacy/unsupported for new generation runs.

### Performance Tuning
- **Branch Count**: Number of parallel execution paths (typically 2-3)
- **Environment Count**: Maximum parallel environments (typically 32-64)
- **Update Size**: Batch size for agent updates (typically 10)

### Advanced Features
- **Task Randomization**: Automatic variation of task parameters
- **Curriculum Learning**: Progressive difficulty scaling
- **User Simulation**: Simulated human interaction for interactive tasks

## Data Output Structure

Generated data includes:
- **Commander Data**: High-level decisions and reasoning
- **Memorizer Data**: Memory updates and context management
- **Environment States**: Complete simulation snapshots
- **Action Sequences**: Detailed tool execution logs
- **Success Metrics**: Task completion status and performance indicators

## Advantages Over Traditional Methods

1. **Scalability**: Automated generation vs. manual human annotation
2. **Quality**: Self-correction examples impossible to collect manually
3. **Consistency**: Standardized task execution and evaluation
4. **Flexibility**: Easy adaptation to new tasks and environments
5. **Efficiency**: Parallel execution maximizes computational resources

## Use Cases

- **Long-Horizon Manipulation**: Complex multi-step tasks
- **Error Recovery Training**: Teaching agents to handle mistakes
- **Interactive Scenarios**: Tasks requiring human-like interaction
- **Multi-Agent Coordination**: Complex collaborative tasks
- **Curriculum Learning**: Progressive skill development

This generation procedure enables the creation of high-quality, diverse training data that captures the nuances of real-world manipulation tasks while maintaining computational efficiency and scalability.
