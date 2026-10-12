---
pagination_prev: custom-agent/use-full-history
pagination_next: custom-agent/connect
sidebar_position: 3
title: Create Your Agent
slug: /customization/create-agent
---

# Create Your Agent

Your agent exposes the [HTTP contract](../reference/integrations/agent-http.md) and owns its decision logic. Start with this small server, check the exchange, then replace the example decision with your model or system. It needs no simulator dependency.

## Create the package

```text
my-agent/
├── pyproject.toml
└── src/
    └── my_agent/
        ├── __init__.py
        └── server.py
```

Leave `__init__.py` empty. Use Python 3.12 in an activated environment.

```toml title="pyproject.toml"
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "my-magma-agent"
version = "0.1.0"
requires-python = ">=3.12,<3.13"
dependencies = ["magma_core[interface]==2.0.1", "fastapi", "uvicorn"]

[project.scripts]
my-agent = "my_agent.server:main"

[tool.setuptools.packages.find]
where = ["src"]
```

## Implement the three endpoints

```python title="src/my_agent/server.py"
from copy import deepcopy

import uvicorn
from fastapi import FastAPI, HTTPException
from magma_core.protocol.agent import (
    AgentDecision, AgentHealth, AgentInfo, AgentOutput, AgentRequest, AgentResponse,
)

app = FastAPI()


@app.get("/health", response_model=AgentHealth)
def health() -> AgentHealth:
    return AgentHealth()


@app.get("/v1/info", response_model=AgentInfo)
def info() -> AgentInfo:
    return AgentInfo(
        agent_id="my-agent",
        agent_version="0.1.0",
        capabilities={"inference": True, "coaching": False},
    )


@app.post("/v1/responses", response_model=AgentResponse)
def responses(request: AgentRequest) -> AgentResponse:
    outputs: list[AgentOutput] = []
    for entry in request.inputs:
        history = entry.memory.get("history", [])
        if not isinstance(history, list) or any(not isinstance(item, dict) for item in history):
            raise HTTPException(status_code=422, detail="memory.history must be a list of objects")

        for index in range(entry.num_outputs):
            memory = deepcopy(entry.memory)
            # Replace this line with your decision logic.
            decision = AgentDecision(say="Hello from my agent.")
            candidate_history = deepcopy(history)
            candidate_history.append({
                "instruction": entry.instruction.model_dump(mode="json"),
                "decision": decision.model_dump(mode="json"),
            })
            memory["history"] = candidate_history
            outputs.append(AgentOutput(
                request_id=request.request_id,
                source_id=entry.id,
                candidate_index=index,
                status="completed",
                memory=memory,
                output=decision,
            ))

    response = AgentResponse(outputs)
    response.validate_request(request)
    return response


def main() -> None:
    uvicorn.run(app, host="127.0.0.1", port=8888)
```

This server always says hello; it checks integration but does not solve robot tasks. Its custom `history` is a list of objects. It accepts empty initial memory, preserves other keys such as `memory_list`, and returns an independent copy for every candidate. No conversation state is stored globally.

## Install and check

From `my-agent/`:

```bash
python -m pip install -e .
my-agent
```

Stop any other server using port 8888. Send the [first HTTP request](use-full-history.md#send-one-instruction), then change `num_outputs` to 2. Expect two candidates with indices `0` and `1` and the same `source_id` as the input. Continue each using its own returned memory.

## Add your decision logic

At the marked line, use `entry.instruction`, `entry.tools`, `entry.attributes`, and `memory` to compute an `AgentDecision`. You can call a local model, a remote execution server, an API, or several internal agents. Format the information however your system requires, then convert its result into the public decision format.

For text, return `AgentDecision(say="Your answer")`. For actions, populate `tool_calls` with the declared tool name, its arguments, and the actual `target_robot_name`. MAGMA executes those tools and returns feedback in a later `env` instruction. Your model's raw completion can have a different format; your agent performs the conversion.

For local inference, start from [full-history and its model clients](use-full-history.md#different-model-formats). For remote calls, inspect the [GPT](https://github.com/MAGMA-rob/gpt-agent) and [Gemini](https://github.com/MAGMA-rob/gemini-agent) implementations. The protocol does not require you to reproduce their architecture.

Load model resources or initialize API clients once during startup. Report ready only when initialization succeeds. Keep blocking inference off the HTTP event loop, and serialize access to a shared model client if it has mutable inference buffers.

## Handle failures and optional extensions

FastAPI validates protocol inputs. Validate your own memory and options too; the example rejects incompatible history with HTTP 422.

If one candidate's model call or parsing fails, return an `AgentOutput` with `status="error"`, its complete `memory`, any available `internal_steps`, and an `AgentError`. Leave `output` absent or null and preserve the candidate's position. See the [error response example](../reference/integrations/agent-http.md#agent-and-http-errors). Do not replace a failed completion with a successful placeholder decision.

Record internal model calls when you need diagnostics or training data; see [memory and components](memory-and-models.md). [Coaching](coaching.md) and [export](export.md) are separate, optional additions. This server implements inference only.

**Next:** [Connect your agent to GEN or BENCH](connect.md).
