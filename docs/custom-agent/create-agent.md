---
pagination_next: custom-agent/connect
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

## Call your own local model

If full-history already supports your checkpoint, use [its configuration and prompt adapters](use-full-history.md). The following extension is for a custom agent whose model should return the public `AgentDecision` JSON format directly.

Use an instruction-tuned causal language model supported by your installed Transformers version, with a chat template and enough available GPU memory. This example loads the checkpoint without additional quantization. Add `torch`, `transformers`, and `accelerate` to your package dependencies, then reinstall it.

Add these imports to `server.py`:

```python
import json
import os
from threading import Lock

import torch
from pydantic import ValidationError
from transformers import AutoModelForCausalLM, AutoTokenizer
from magma_core.protocol.agent import AgentError
```

Replace `main` with the following code. Loading finishes before the HTTP server starts, and the lock serializes access to the shared model:

```python
def main() -> None:
    import uvicorn

    model_path = os.environ["MY_AGENT_MODEL"]
    app.state.tokenizer = AutoTokenizer.from_pretrained(model_path)
    app.state.model = AutoModelForCausalLM.from_pretrained(
        model_path, dtype="auto", device_map="auto",
    )
    app.state.model.eval()
    app.state.inference_lock = Lock()
    uvicorn.run(app, host="0.0.0.0", port=8888)
```

Inside `responses`, replace `decision = AgentDecision(say="Hello from my agent.")` with this block. Keep the surrounding candidate loop and the history update that follows it:

```python
context = {
    "instruction": entry.instruction.model_dump(mode="json"),
    "tools": entry.tools,
    "attributes": entry.attributes,
    "memory": memory,
}
messages = [
    {"role": "system", "content": (
        'Choose the next response or action. Return only JSON: '
        '{"say":"your answer","tool_calls":[]} or '
        '{"say":"","tool_calls":[{"name":"TOOL",'
        '"arguments":{},"target_robot_name":"ROBOT"}]}. '
        'Use only the supplied tools, arguments, and robot names.'
    )},
    {"role": "user", "content": json.dumps(context)},
]
raw_output = ""
try:
    with app.state.inference_lock, torch.inference_mode():
        tokenizer = app.state.tokenizer
        model = app.state.model
        prompt = tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True,
        )
        inputs = tokenizer(
            prompt, return_tensors="pt", add_special_tokens=False,
        ).to(model.get_input_embeddings().weight.device)
        tokens = model.generate(**inputs, max_new_tokens=256, do_sample=False)
        raw_output = tokenizer.decode(
            tokens[0, inputs["input_ids"].shape[1]:], skip_special_tokens=True,
        )
    decision = AgentDecision.model_validate_json(raw_output)
except (ValidationError, ValueError, RuntimeError) as error:
    outputs.append(AgentOutput(
        request_id=request.request_id,
        source_id=entry.id,
        candidate_index=index,
        status="error",
        memory=memory,
        internal_steps=[{"output_raw": raw_output}],
        error=AgentError(code="model_error", message=str(error), component="model"),
    ))
    continue
```

Start the server from your activated agent environment:

```bash
MY_AGENT_MODEL=/absolute/path/to/your/checkpoint my-agent
```

Run the [instruction and tool-call requests](use-full-history.md#send-one-instruction) against this server, then [connect it to GEN](connect.md). The tool-call example supplies the robot name and button vocabulary needed for the action.

This adapter expects JSON without Markdown fences or reasoning text. A checkpoint that uses another output format needs a matching parser. Deterministic decoding may return identical candidates, and passing the protocol checks does not guarantee task success. For longer tasks, [manage the context size and record internal model calls](memory-and-models.md) before collecting training data.
