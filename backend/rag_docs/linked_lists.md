# Linked List Operations

Linked lists are node-based structures where elements are connected by pointers rather than stored contiguously. Visualizing lists requires rendering node values, dynamic arrow linkages, and named pointers.

## Visualizing Node Manipulation

- Nodes are represented in the `"linked_list"` visual component type.
- Each node has a unique `id`, a `value`, and a `nextId` representing the next link.
- Named pointers (`head`, `curr`, `prev`, `temp`) should point to the correct node ID at each execution state.
- During insertions, the new node's state is `"modified"` and `nextId` is updated.
- During deletion, the bypassed node's link is updated, and the deleted node loses its incoming connections.

## Insertion Example

When inserting a node `new_node` (value 15) between `curr` (value 10) and `curr.next` (value 20):
1. `new_node.next` is set to `curr.next` (value 20).
2. `curr.next` is set to `new_node` (value 15).

### Linked List Step Example

```json
{
  "line": 12,
  "explanation": "Update current node's next pointer to point to the new node.",
  "variables": {
    "val": 15
  },
  "stack": ["insertNode"],
  "visuals": [
    {
      "type": "linked_list",
      "nodes": [
        {"id": "node_1", "value": 10, "nextId": "node_new", "state": "normal"},
        {"id": "node_new", "value": 15, "nextId": "node_2", "state": "modified"},
        {"id": "node_2", "value": 20, "nextId": null, "state": "normal"}
      ],
      "pointers": {
        "head": "node_1",
        "curr": "node_1",
        "new": "node_new"
      }
    }
  ]
}
```
