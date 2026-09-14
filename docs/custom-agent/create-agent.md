---
sidebar_position: 5
title: Create Your Agent Package
slug: /customization/create-agent
---

# Create Your Agent Package

Use this path when you need different model access, parsing, memory, or orchestration. Start with a small server that makes one deterministic decision, verify the HTTP contract, then replace the decision logic with your model. The same package can later support coaching and export.

## Create the package

```text
my-agent/
├── pyproject.toml
└── src/
    └── my_agent/
        ├── __init__.py
        └── server.py
```

Leave `__init__.py` empty. No simulator dependency is needed for this server.

```toml title="pyproject.toml"
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "my-magma-agent"
version = "0.1.0"
requires-python = ">=3.12,<3.13"
dependencies = ["magma_core>=2.0.0b1,<3.0.0", "fastapi", "uvicorn"]

[project.scripts]
my-agent = "my_agent.server:main"

[tool.setuptools.packages.find]
where = ["src"]
```

## Implement inference

```python title="src/my_agent/server.py"
from copy import deepcopy

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
        agent_id="my-agent", agent_version="0.1.0",
        capabilities={"inference": True, "coaching": False},
    )


@app.post("/v1/responses", response_model=AgentResponse)
def responses(request: AgentRequest) -> AgentResponse:
    for entry in request.inputs:
        history = entry.memory.get("history", [])
        if not isinstance(history, list) or any(not isinstance(item, dict) for item in history):
            raise HTTPException(status_code=422, detail="memory.history must be a list of objects")
    outputs = []
    for entry in request.inputs:
        for index in range(entry.num_outputs):
            memory = deepcopy(entry.memory)
            decision = AgentDecision(say="Hello from my agent.")
            history = memory.setdefault("history", [])
            history.append({
                "instruction": entry.instruction.model_dump(mode="json"),
                "decision": decision.model_dump(mode="json"),
            })
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
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)
```

This example owns a simple history schema whose `history` value must be a list. It accepts empty initial memory and returns independent copies for every candidate. It always says hello, so it checks integration but cannot solve action tasks.

## Install and inspect

From `my-agent/`:

```bash
python -m pip install -e .
my-agent
```

Use the [first HTTP request](use-full-history.md#send-one-instruction). Stop another agent on port 8888 before launching this one. Ask for two outputs and verify candidate indices `0` and `1`, independent memories, and preserved `source_id`. Then [connect the server](connect.md).

## Replace the decision logic

At `decision = ...`, build your prompt from `entry.instruction`, `tools`, `attributes`, and memory; call your model or system; parse its completion into `AgentDecision`. For a tool call, include the actual target robot name. The agent proposes actions; MAGMA executes them and sends results in a later input.

Load models once during application startup, and report health as ready only after loading succeeds. Keep inference off the HTTP event loop and serialize access if your model client has mutable batch buffers. The provided full-history server uses one inference worker while leaving health/info responsive.

Validate your memory schema and private options before processing. FastAPI rejects invalid protocol requests; add HTTP 422 errors for invalid agent-specific input. For an individual model/parsing failure, return an `AgentOutput` with `status="error"`, its memory and internal records, and an `AgentError`; do not omit that candidate. Keep `output` absent on errors.

Do not silently substitute a success decision for invalid model output. Record internal calls as described in [memory and components](memory-and-models.md). See the [HTTP reference](../reference/integrations/agent-http.md) for exact invariants and a JSON exchange.

Coaching and export can remain absent until inference works. You do not need to inherit a MAGMA runtime class or use Python for the HTTP implementation; the JSON contract is the integration boundary.
