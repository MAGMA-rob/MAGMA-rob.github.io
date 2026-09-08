---
sidebar_position: 2
slug: /installation
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Core installation

MAGMA can be installed depending on your needs. We provide 3 installations mode:
- Hybrid (**Recommended**) : Use [docker](https://www.docker.com/) containers for server services, execute the main process in a virtual env.
- Conda-only : If you do not want to install docker.
- Docker-only : If you want to run all process in containers.

## ⏱️ Quick Install

<Tabs>

<TabItem value="hybrid" label="Hybrid Installation (Recommended)">

    **Env setup**

    ```bash
    conda create -n magma python=3.10
    conda activate magma
    ```

    **Install Core (Recommended via GitHub)**

    Install directly from GitHub:

    ```bash
    pip install git+https://github.com/MAGMA-rob/magma-core.git@main
    ```

    For reproducibility, you can pin a version tag:

    ```bash
    pip install git+https://github.com/MAGMA-rob/magma-core.git@v0.1.0
    ```

    These packages are not meant to be modified by default users. They still can be installed from source, in that case just clone the repository and `pip install -e .`.
    In case of errors you can fork them from their respective repository and open a merge request.

    **Scenarios**

    Install the provided scenarios as a dependency:

    ```bash
    pip install git+https://github.com/MAGMA-rob/MAGMA-scenarios.git@main
    ```

    Create custom scenarios in [your own provider package](../create-scenarios/first-scenario/create-scenarios.md), then install that package with `pip install -e .`. You do not need to clone or edit `magma_scenarios` to add scenarios.

    **Planner and Agent Servers**

    `magma-agent` and `magma-planner-mplib` are server components.

    ```bash
    git clone https://github.com/MAGMA-rob/magma-agent.git
    git clone https://github.com/MAGMA-rob/magma-planner-mplib.git
    ```

    In each of these packages, you have access to a build/launch script that allows you to launch the server:
    ```bash title="Launch the Agent server using gpu 0 to port 8888"
    bash scripts/launch_agent.bash -g 0 -p 8888
    ```
    ```bash title="Launch the planner server"
    bash scripts/launch_planner.bash
    ```

    :::info Information
    The agent container is supposed to stop immediately as we do not provide an agent yet.
    :::

</TabItem>

<TabItem value="conda" label="Conda Installation">

    **Env setup**

    ```bash
    conda create -n magma python=3.10
    conda activate magma
    ```

    **Install Core (Recommended via GitHub)**

    Install directly from GitHub:

    ```bash
    pip install git+https://github.com/MAGMA-rob/magma-core.git@main
    ```

    For reproducibility, you can pin a version tag:

    ```bash
    pip install git+https://github.com/MAGMA-rob/magma-core.git@v0.1.0
    ```

    These packages are not meant to be modified by default users. They still can be installed from source, in that case just clone the repository and `pip install -e .`.
    In case of errors you can fork them from their respective repository and open a merge request.

    **Scenarios**

    Install the provided scenarios as a dependency:

    ```bash
    pip install git+https://github.com/MAGMA-rob/MAGMA-scenarios.git@main
    ```

    Create custom scenarios in [your own provider package](../create-scenarios/first-scenario/create-scenarios.md), then install that package with `pip install -e .`. You do not need to clone or edit `magma_scenarios` to add scenarios.

    **Planner and Agent Servers**

    Servers are better to install locally. If you want proper isolation you can even create a specific conda env for `magma_agent` as it requires hf librairies.

    In all case you can just clone these repositories and install them:
    ```bash
    git clone https://github.com/MAGMA-rob/magma-planner-mplib.git
    cd magma-planner-mplib
    pip install -e .

    git clone https://github.com/MAGMA-rob/magma-agent.git
    cd magma-agent
    pip install -e .
    ```

</TabItem>

<TabItem value="docker" label="Docker Installation">

    MAGMA is composed of multiple repositories with different roles. As we use Docker, we need to clone all of these following repositories:

    ```bash
    git clone https://github.com/MAGMA-rob/magma-agent.git
    git clone https://github.com/MAGMA-rob/magma-planner-mplib.git
    git clone https://github.com/MAGMA-rob/magma-core.git
    ```

    For `magma-agent` and `magma-planner-mplib` repositories, you have access to a build/launch script that allows you to launch servers:
    ```bash title="Launch the Agent server using gpu 0 to port 8888"
    bash scripts/launch_agent.bash -g 0 -p 8888
    ```
    ```bash title="Launch the planner server"
    bash scripts/launch_planner.bash
    ```
    :::info Information
    The agent container is supposed to stop immediately as we do not provide an agent yet.
    :::

    Custom scenarios belong in your own provider package. Mount and install that package separately when you need it in the container; the provided scenarios are installed as a dependency.

    **Core Dockers**

    As the root of all repositories, create a Dockerfile:
    ```Dockerfile
    FROM maniskill/base

    RUN pip install requests json-numpy

    # Install dependencies for GUI applications
    RUN apt-get update && apt-get install -y \
        x11-apps \
        mesa-utils \
        libgl1-mesa-glx \
        libglib2.0-0 \
        && rm -rf /var/lib/apt/lists/*

    # Allow GUI applications inside the container
    ENV DISPLAY=:0
    ENV QT_X11_NO_MITSHM=1
    ENV LIBGL_ALWAYS_INDIRECT=1

    WORKDIR /home
    ```

    That you can compile with ```docker build -t magma -f Dockerfile .```
    And you can use this script to launch the magma container:
    ```sh
    #!/bin/bash

    # Default GPU = 0 if not provided
    GPU_ID=${1:-0}

    CONTAINER_NAME="magma_${GPU_ID}"

    echo "Starting MAGMA on GPU ${GPU_ID}"
    echo "Container name: ${CONTAINER_NAME}"

    xhost +local:root > /dev/null 2>&1

    docker run -it \
        --gpus "device=${GPU_ID}" \
        --name ${CONTAINER_NAME} \
        --rm \
        -e DISPLAY=$DISPLAY \
        -e QT_X11_NO_MITSHM=1 \
        -e LIBGL_ALWAYS_INDIRECT=1 \
        -e NVIDIA_VISIBLE_DEVICES=${GPU_ID} \
        -e NVIDIA_DRIVER_CAPABILITIES=all \
        -v ./magma-bench:/home/magma-bench \
        -v ./magma-core:/home/magma-core \
        -v ./magma-gen:/home/magma-gen \
        -v ./demos:/home/demos \
        -v ./eval:/home/eval \
        -v ./output:/home/output \
        -v /tmp/.X11-unix:/tmp/.X11-unix \
        -v $HOME/.Xauthority:/root/.Xauthority:rw \
        magma:latest \
        bash -c "
            pip install -e /home/magma-core && \
            pip install git+https://github.com/MAGMA-rob/MAGMA-scenarios.git@main && \
            pip install -e /home/magma-gen && \
            pip install -e /home/magma-bench && \
            bash
        "
    ```

    :::tip Select the application
    If you are planing to use only GEN or only BENCH, you can remove the pip install line of the unused one from the bash -c command.
    :::

</TabItem>
</Tabs>

---

## ✅ And now?

If you want to evaluate your own agent on the MAGMA-BENCHMARK, you can start with the [**benchmark setup**](../use-magma-bench/overview.md).

If you want to train your agent on long-horizon, multi-robot tasks or define your own scenarios, start with [**magma-gen setp**](../use-magma-gen/overview.md)