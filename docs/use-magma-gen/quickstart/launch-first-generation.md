---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Launch the first generation

You need to have **three** terminal open and have **defined your config** as explained in [**Installation**](installation.md#how-to-set-your-own-config).

## 1. Get a default agent

By default we provide a reference agent setup to use with `magma-agent` service. *soon*

We recommend creating a folder `models` in `magma-agent/`, and unzip the model inside.

If you have your own model, check [**How to use your own agent**](../../customization/create-agent.md).

## 2. Launching Docker servers

<Tabs>
<TabItem value="hybrid" label="Hybrid Installation">

    Launch the two servers services with their dedicated script in `magma-agent/scripts` and `magma-planner-mplib/scripts`.

    > You will need to use the `-c <model_path>` option from the `magma_agent` launching script to specifiy the path to the model **folder**. ```bash scripts/launch_agent.bash -g 0 -p 8888 -c models/rss_demos_model/```

    Then, in the last terminal activate your conda env. This is your working terminal.

</TabItem> <TabItem value="conda" label="Conda Only">

    Activate your conda env in all terminals, then start each server with `python3 -m magma_agent --commander-id <model_path>` and `python3 -m magma_mplib`.

    Finally, your last terminal is your working terminal.

</TabItem> <TabItem value="docker" label="Docker Only">

    Launch the two servers services with their dedicated script in `magma-agent/scripts` and `magma-planner-mplib/scripts`.

    > You will need to use the `-c <model_path>` option from the `magma_agent` launching script to specifiy the path to the model **folder**. ```bash scripts/launch_agent.bash -g 0 -p 8888 -c models/rss_demos_model/```

    Launch the magma container using the [installation guide](../../installation.md) (or your own). This is your working terminal.
</TabItem> 
</Tabs>

## 3. Start the generation

Inside your working terminal:
```bash
python3 -m magma_gen.launch test --preset warehouse_sorting.NoManuPreset
```

It will create a folder named `test` in the `output` folder. At the end of the generation procedure it will save all .json containing interaction data and a config.json.

## Related Pages

- For all launch options, see [MAGMA-GEN Generation CLI](../running-generation/cli-argument.md)
- To understand what the pipeline is doing, see [Key Ideas](../running-generation/key-systems.md)
- To convert runs into datasets, see [How to export data from MAGMA-GEN](../running-generation/export.md)
