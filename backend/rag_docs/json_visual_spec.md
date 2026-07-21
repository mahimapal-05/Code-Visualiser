# JSON Visualization Schema Specification

This document defines the schema that the AI Visualizer Agent must output in its step-by-step trace simulation. The frontend parses this schema to build interactive animations.

## Visualizer Schema

The LLM must return a JSON object with:
1. `steps`: List of objects, where each object represents a single instruction line's execution step.
2. `metadata`: General information about the code.

### Step Schema

Each step in the `steps` array contains:
- `line` (int): The current line number of code being executed (1-indexed).
- `explanation` (str): Plain-english description of what occurs in this step.
- `variables` (dict): Dictionary of active variables and their current values (e.g. `{"i": 0, "val": 15}`).
- `stack` (list): Call stack representation, where each item is a string describing the current active frame (e.g., `["fibonacci(4)", "fibonacci(5)"]`).
- `visuals` (list): A list of visual object components to render.

### Visual Components

A step's `visuals` array contain objects matching the following types:

#### 1. Array Component (`type: "array"`)
Used for sorting, list lookups, and index movements.
```json
{
  "type": "array",
  "name": "arr",
  "elements": [
    {"id": "0", "value": 5, "state": "comparing"},
    {"id": "1", "value": 3, "state": "comparing"},
    {"id": "2", "value": 8, "state": "normal"}
  ],
  "pointers": {
    "i": 0,
    "j": 1
  }
}
```
*States*: `"normal"`, `"comparing"`, `"swapped"`, `"sorted"`, `"visiting"`.

#### 2. Linked List Component (`type: "linked_list"`)
Used to render pointer links between nodes.
```json
{
  "type": "linked_list",
  "nodes": [
    {"id": "node_1", "value": 10, "nextId": "node_2", "state": "active"},
    {"id": "node_2", "value": 20, "nextId": null, "state": "normal"}
  ],
  "pointers": {
    "head": "node_1",
    "curr": "node_2"
  }
}
```
*States*: `"normal"`, `"active"`, `"modified"`.

#### 3. Recursion Tree Component (`type: "recursion_tree"`)
Used for visualizing recursion trees (e.g., Fibonacci, DFS).
```json
{
  "type": "recursion_tree",
  "nodes": [
    {"id": "root", "label": "fib(3)", "parentId": null, "state": "waiting", "val": null},
    {"id": "node_left", "label": "fib(2)", "parentId": "root", "state": "active", "val": null},
    {"id": "node_right", "label": "fib(1)", "parentId": "root", "state": "done", "val": 1}
  ]
}
```
*States*: `"active"`, `"done"`, `"waiting"`, `"backtracking"`.

#### 4. Console Log (`type: "console"`)
Displays run output buffer at the current point.
```json
{
  "type": "console",
  "output": "Starting sort...\nSwapping 5 and 3\n"
}
```

#### 6. Stack & Queue Component (`type: "stack_queue"`)
Used for visualizing stack buckets (push/pop) and queue tubes (enqueue/dequeue).
```json
{
  "type": "stack_queue",
  "variant": "stack",
  "name": "myStack",
  "items": [
    {"id": "0", "value": 10, "state": "normal"},
    {"id": "1", "value": 20, "state": "pushing"}
  ]
}
```
*States*: `"normal"`, `"pushing"`, `"popping"`, `"top"`.


