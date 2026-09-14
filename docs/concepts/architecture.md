---
sidebar_position: 12
title: Packages and Services
---

# Packages and Services

MAGMA separates scenario logic, runtime orchestration, and agent implementation. Each can evolve behind its documented contract.

| Package or service | Responsibility |
| --- | --- |
| `magma_core` | Shared contracts, state structures, and optional simulation/interface support |
| `magma_scenarios` | Environments, tools, task presets, requests, and scenario skills |
| `magma_gen` | Generate and evaluate branching interactions, coordinate coaching, record graphs |
| Agent package | Model access, prompts, decisions, memory, optional coaching and dataset rendering |
| Motion planner | Compute trajectories needed by physical tools |
| Configured model/human backends | User simulation, validation, or coaching assistance according to their assigned role |

## Inference crosses a service boundary

GEN call the same [agent HTTP API](../reference/integrations/agent-http.md). They need a compatible reachable server. Start with `full-history-agent` or [create your own package](../custom-agent/overview.md).

One agent package can contain several models. Scenario tools execute the proposed actions. Model resources can remain loaded, but interaction memory is passed explicitly so episodes and branches remain independent.

## Coaching and export

GEN provides coaching configuration and context; the agent owns its repair strategy. See [coaching](coaching.md).

Export is a local Python integration. Install the agent exporter in the export environment and discover it through `magma.export.gen`. No export HTTP server is needed. An inference-only HTTP implementation can use any language; implementing a local exporter is an additional integration.

## Deploy together or separately

The agent, simulator, and planner can run in separate environments or containers. Configure addresses reachable from each caller; `localhost` identifies the current process's host or container. HTTPS may terminate at a reverse proxy. Model loading settings belong to the agent, simulation settings to the consumer, and coaching provider settings to GEN.

The minimal custom HTTP example uses the core protocol without importing ManiSkill. Simulation dependencies are needed where environments/tools execute, not inherently in every agent process.

See [run configuration](../use-magma-gen/quickstart/configuration.md) for service addresses and model backends, and [installation](../use-magma-gen/quickstart/installation.md) for the planner setup.
