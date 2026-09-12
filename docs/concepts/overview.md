---
sidebar_position: 1
slug: /core-concepts/overview
title: Concepts and Architecture
---

# Concepts and Architecture

MAGMA separates the interaction an agent must solve from the capabilities used to execute it. A scenario packages reusable components; a task assembles an interaction; stages define how progress is checked.

```text
Installed scenario provider
  └─ Scenario manifest
      ├─ Environment registrations
      ├─ Presets → explicit tasks
      ├─ Definitions + requests → constructed tasks
      └─ Optional skills → orchestration of tools

Task → initial situation + stages + tools + initialization parameters
Agent → tool or skill calls → environment → results → stage verification
```

## Read only what your current step needs

| Question | Concept |
| --- | --- |
| What belongs in a scenario? | [Scenarios](scenarios.md) |
| What does a task declare? | [Tasks](tasks.md) |
| How is progress checked? | [Stages and interaction](stages.md) |
| Which state should I modify? | [State and observations](state.md) |
| How are varied interactions constructed? | [Requests and constraints](requests.md) |
| What is executed? | [Tools and skills](tools.md) |
| How do several robots share resources? | [Execution and concurrency](execution.md) |
| How are failures introduced? | [Errors and recovery](errors.md) |
| How are agent mistakes corrected? | [Coaching and corrections](coaching.md) |
| What must an environment preserve? | [Environments](envs.md) |

These abstractions support generation and evaluation workflows. Each consumer determines which optional capabilities it requires. A scenario declaration alone does not make a custom task part of the official benchmark.

To build something, start with [your own scenario package](../create-scenarios/first-scenario/create-scenarios.md). Package and service responsibilities are described in [architecture](architecture.md).
