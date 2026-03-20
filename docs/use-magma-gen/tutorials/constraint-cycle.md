---
sidebar_position: 4
title: Define a Constraint Stage
description: Learn the simplest pattern to define stage that allows you to verify constraint or ask questions to agents and how to integrate them in your tasks.
---

# Define a Constraint Stage

MAGMA is made for complex and really interactive tasks, where:

1. the user gives a new rule
2. the agent acknowledges or understands it
3. the agent executes a cycle using that rule
4. rule can be overriden, deleted across the deployment

:::info
A constraint stage is typically a [text-only stage](../deep-dive/create-stages.md#text-only-stages-in-more-detail)
:::

A constraint stage allows to simulate an user implying constraint such as:
- "`ref_obj_1` goes to `area2`"
- "`ref_obj_3` must not be used"
- "`area4` is temporarily unavailable"

## Use the `ConstraintBaseStage`

`magma_core.base.stage` provides a default stage implementation for `ConstraintBaseStage`.

```python
class ConstraintBaseStage(BaseTaskStage):

    target_steps = 1 # 1 because the agent must just answer to the user
    acceptance_steps = 0

    def __init__(self, constraint: str, memory : List[str], attributes : Dict) -> None:
        super().__init__([], True, f"The stage of the goal is to ensure that the model understand what the user said : {constraint}")

        self.verification_prompt = f"The model understand what the user asked : {constraint}"
        self.situation = Situation(
            memory=memory,
            instruction=UserInstruction(constraint),
            flag_answer_to_user=False,
            attributes=attributes,
            preserved_memory_indices=[e for e in range(len(memory))]
        )
```

As you see, this stage does not define any goals or log verification. It defines a verification prompt that is derived from the constraint arguments. The situation use the default value that you give for memory and attributes.

:::tip
You see that the `flag_answer_to_user` is `False` on this stage. It's because in that case, the user answer is part of the evaluation and is verified. The flag `answer_to_user` must be set to `True` when you want the agent to acknowledge the end of a set of actions. More details [**here**](../deep-dive/create-stages.md#how-flag_answer_to_user-works).
:::

## Use it in a Task Preset

You can therefore, import the `ConstraintBaseStage` and use it directly inside your stages of your **Task Preset**.

```python
task_attributes = {
    "objects": ["ref_obj_1", "ref_obj_2", "ref_obj_3"],
    "target_areas": ["area1", "area2", "area3"],
}

self.stages = [
    ConstraintBaseStage(
        "Please remember that ref_obj_1 goes to area2.",
        [],
        task_attributes,
    ),
    Cycle(
        assignment={"ref_obj_1": "area2"},
        known_areas=task_attributes["target_areas"],
        flag_answer=True,
        instruction=UserInstruction("Launch a cycle for ref_obj_1."),
    ),
]
```

> The agent will receive first : "Please remember that ref_obj_1 goes to area2", *answer*, then "Launch a cycle for ref_obj_1". 

Here, the assignment of the cycle allows the MAGMA framework to know which object must go where but keep the instruction partially specified for the agent!

## Advanced possibility

You can also make this more generalizable by randomizing the object and the area passed to the constraint and update the cycle according to them:

```python title="Exemple of constraint randomizing"
class WarehouseSorting(BaseTask):
    """
    Class to create a Sorting task in a factory. Robot knows some objects and area. Users gives constraint about objects assignment.
    The robot must solves these constraint to complete multiple cycle. It must also precise a manufacturing order for each cycle.
    """
    name : str = "Parent Sorting Warehouse objects"
    env_id : str = "SortingCubesWarehouse-v1"

    Tools_cls = WithManufacturingOrder

    styles = [
        TaskStyle.CONSTRAINED,
        TaskStyle.LONG_STAGE
    ]

    def __init__(
            self,
            queries : List[Tuple[str,str,str]] = [
                ("constraint","ref_obj_1 goes to area2, ref_obj_2 goes to area3 and ref_obj_3 goes to area1",""),
                ("constraint","Hey, ref_obj_3 must not be sorted until explicit confirmation.",""),
                ("cycle","Can you launch a cycle according to your memory under manu_order AFR?","AFR")
                ],
            origin_areas : List[str] = ["area1", "area2", "area3"],
            assignments : List[Dict[str,str]] = [{"ref_obj_1":"area2","ref_obj_2":"area3","ref_obj_3":"none"}]
        ) -> None:
        super().__init__()
        task_attributes = {
            "objects" : list(assignments[0].keys()),
            "target_areas" : origin_areas
        }
        self.stages = []
        i = 0
        for t, content, manu_order in queries:
            if t == "constraint":
                self.stages.append(
                    ConstraintSorting(content,[],task_attributes)
                )
            else:
                if i >= len(assignments):
                    raise ValueError(f"The task needs to have the same amount of 'cycle' and assignment.")
                self.stages.append(
                    Cycle(
                        assignement=assignments[i],
                        all_area=origin_areas,
                        manu_order=manu_order,
                        instruction=content
                    )
                )
                i+=1

        if i < 3:
            self.approximal_difficulty = "Medium"
        else:
            self.approximal_difficulty = "Hard"
```

In this exemple, you can build any task structure that you want, by defining task that randomly sample objects passed to the `__init__`:

```python
class Preset2(WarehouseSorting):
    
    def __init__(self, difficulty : int = 1) -> None:
        obj = OBJECTS[:3].copy()
        random.shuffle(obj)

        queries : List[Tuple] = [
            ("constraint", f"Hello, please consider {AREAS[0]} the default for {obj[0]} and {obj[1]}.",""),
            ("cycle", "Launch a cycle under KTR for these objects only","KTR"),
        ]
        assignments = [{obj[0]:AREAS[0],obj[1]:AREAS[0]}]

        for i in range(difficulty):
            order=craft_random_manu_order()
            queries.append(("cycle", f"Hey! You can launch a cycle for {obj[0]} and {obj[1]} with order {order}",order))
            assignments.append({obj[0]:AREAS[0],obj[1]:AREAS[0]})
```

In that case, you can pass the difficulty argument directly through CLI when launching the generation.

## Use with Task Definition

Task definition allows you to avoid defining by hand these **Preset**: it samples every stage (constraints and cycle) randomly and auto apply constraints to them. 
:::tip
To learn about [Requests](../deep-dive/create-tasks-definition.md#requests-the-generation-time-building-blocks) and [Task State](../deep-dive/create-tasks-definition.md#the-latent-state-taskstate) check [Deep-Dive Task Definition](../deep-dive/create-tasks-definition.md)
:::

You can create a request inehrited form `BaseConstraintRequest`. This class implement base logic common to all constraint requests (stage creation and constraint apply). In your custom request, you just have to initialize the different [**Constraints**](../deep-dive/create-tasks-definition.md#constraints--dynamic-state-influence).

Let's take a look here:
```python title="Template to create a constraint request"
class GiveObjectCategoryRequest(BaseConstraintRequest):

    categories : List[str]

    def __init__(self, available_categories : List[str], max_object_assignment : int = 2):
        super().__init__()
        if len(available_categories) < 2:
            raise ValueError("It must have at least 2 caegories")
        self.categories = available_categories
        self.max_obj = max_object_assignment

    def sampling_weight(self, state: TaskState) -> float:
        if len(state.relations.get("object_type",{})) < 1:
            return 3 # if no assignment, probability to sample this request increase.
        return 1

    def initialize_constraints(self, state: TaskState):
        self.constraints = []
        all_objects = state.attributes.get("objects", []).copy()

        if len(all_objects) <=0:
            raise RuntimeError(f"Failed to build the stage from {self.__class__.__name__} due to empty objects")
        
        random.shuffle(all_objects)
        nb_update = random.randint(1,min(self.max_obj, len(all_objects)))

        assignment = defaultdict(list)
        for i in range(nb_update):
            cur_t = state.relations["object_type"].get(all_objects[i],None)
            t = random.choice(self.categories)
            if cur_t != t:
                assignment[t].append(all_objects[i])
                self.constraints.append(ObjectCategoryConstraint(
                    all_objects[i], t
                ))
        
        self.constraint_msg = "Hello,"
        for t, objs in assignment.items():
            obj_str = " and ".join(objs)
            self.constraint_msg += f" {obj_str} are now {t},"
        self.constraint_msg += "."
```
We define the `initialize_constraints` function to generate random object-category association. We also define a custom `sampling_weight` to increase the sampling weight when there is no assignment.

And for the constraint class
```python title="Exemple of constraint class"
class ObjectCategoryConstraint(BaseConstraint):

    def __init__(self, object : str, category : str) -> None:
        super().__init__()
        self.obj = object
        self.category = category

    def apply(self, state: TaskState):
        super().apply(state) # important for register the constraint in the state list.
        all_obj = state.attributes.get("objects", [])
        if not "object_type" in state.relations:
            state.relations["object_type"] = {}
        if not self.obj in all_obj:
            raise RuntimeError(f"The {self.__class__.__name__} failed to be applied")
        state.relations["object_type"][self.obj] = self.category

    def outdated(self, state: TaskState) -> bool:
        if not self.obj in state.attributes.get("objects",[]):
            return True
        return False
```
You define the function `apply` that apply the constraint to the Task State. And the function `outdated` to ensure that the constraint is deleted if it can not be applied anymore (in this case, the object has been removed).

:::tip
Unlike Task Preset, the handling of constraint and their lifecycle is automaticly done by the **Task Generator** but it requires more code. So use the different **Templates** to go faster!
:::

## More details

- [Text-only stages in more detail](../deep-dive/create-stages.md#text-only-stages-in-more-detail)
- [Goal predicates: objective verification for action stages](../deep-dive/create-stages.md#goal-predicates-objective-verification-for-action-stages)
- [Stage logs: verifying what happened](../deep-dive/create-stages.md#stage-logs-verifying-what-happened)