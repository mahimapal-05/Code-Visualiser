import os
import json
import re
from typing import List, Dict, Any, Optional
from groq import Groq
from dotenv import load_dotenv
from backend.runner import execute_code
from backend.rag import get_rag_engine
import hashlib

# Load environment variables
load_dotenv()

# In-memory execution trace cache to speed up live visual compilation
trace_cache = {}

def get_code_hash(code: str, language: str) -> str:
    """Generates a SHA-256 hash for cache lookups, ignoring minor leading/trailing indentation changes."""
    normalized = "\n".join(line.strip() for line in code.strip().split("\n"))
    return hashlib.sha256(f"{language}:{normalized}".encode("utf-8")).hexdigest()


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        return Groq(api_key=api_key)
    except Exception:
        return None

def analyze_code_for_keywords(code: str) -> str:
    """
    Extracts key coding concepts from user code to aid in RAG search queries.
    """
    keywords = []
    code_lower = code.lower()
    
    if "sort" in code_lower or "swap" in code_lower:
        keywords.append("sorting")
    if "node" in code_lower or "next" in code_lower or "head" in code_lower:
        keywords.append("linked list")
    if "def " in code_lower and re.search(r'(\w+)\(.*\).*:\s*(.*\s*)*\1\(', code):
        keywords.append("recursion")
    elif "class" in code_lower and ("fib" in code_lower or "fact" in code_lower):
        keywords.append("recursion")
    elif "recursion" in code_lower or "fibonacci" in code_lower or "factorial" in code_lower:
        keywords.append("recursion")
    if "tree" in code_lower or "bst" in code_lower or "left" in code_lower or "right" in code_lower:
        keywords.append("binary tree")
    if "grid" in code_lower or "matrix" in code_lower or "dfs" in code_lower or "bfs" in code_lower:
        keywords.append("grid")
        
    return " ".join(keywords) if keywords else "variables array basics"

def get_offline_fallback_trace(code: str, language: str) -> Optional[Dict[str, Any]]:
    """
    Provides pre-compiled rich interactive trace files for common algorithms.
    This enables a high-fidelity 'offline demo' out-of-the-box before keying API credentials.
    """
    code_normalized = re.sub(r'\s+', '', code.lower())
    
    # 1. Bubble Sort check
    if "bubblesort" in code_normalized or ("sort" in code_normalized and "swap" in code_normalized):
        return {
            "metadata": {
                "algorithm_name": "Bubble Sort",
                "time_complexity": "O(N^2)",
                "space_complexity": "O(1)",
                "summary": "Bubble Sort compares adjacent items and swaps them if they are in the wrong order. This is repeated until the list is sorted."
            },
            "steps": [
                {
                    "line": 1,
                    "explanation": "Initialize the list with unsorted numbers: [5, 3, 8, 2].",
                    "variables": {"arr": [5, 3, 8, 2], "n": 4},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 5, "state": "normal"},
                                {"id": "1", "value": 3, "state": "normal"},
                                {"id": "2", "value": 8, "state": "normal"},
                                {"id": "3", "value": 2, "state": "normal"}
                            ],
                            "pointers": {}
                        }
                    ]
                },
                {
                    "line": 2,
                    "explanation": "Start outer loop i = 0. We will carry out n-1 passes.",
                    "variables": {"arr": [5, 3, 8, 2], "n": 4, "i": 0},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 5, "state": "normal"},
                                {"id": "1", "value": 3, "state": "normal"},
                                {"id": "2", "value": 8, "state": "normal"},
                                {"id": "3", "value": 2, "state": "normal"}
                            ],
                            "pointers": {"i": 0}
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "Start inner loop j = 0. Compare arr[0] (5) and arr[1] (3).",
                    "variables": {"arr": [5, 3, 8, 2], "n": 4, "i": 0, "j": 0},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 5, "state": "comparing"},
                                {"id": "1", "value": 3, "state": "comparing"},
                                {"id": "2", "value": 8, "state": "normal"},
                                {"id": "3", "value": 2, "state": "normal"}
                            ],
                            "pointers": {"i": 0, "j": 0}
                        }
                    ]
                },
                {
                    "line": 4,
                    "explanation": "Since 5 > 3, we swap them. The array becomes [3, 5, 8, 2].",
                    "variables": {"arr": [3, 5, 8, 2], "n": 4, "i": 0, "j": 0},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "swapped"},
                                {"id": "1", "value": 5, "state": "swapped"},
                                {"id": "2", "value": 8, "state": "normal"},
                                {"id": "3", "value": 2, "state": "normal"}
                            ],
                            "pointers": {"i": 0, "j": 0}
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "Increment j to 1. Compare arr[1] (5) and arr[2] (8).",
                    "variables": {"arr": [3, 5, 8, 2], "n": 4, "i": 0, "j": 1},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "normal"},
                                {"id": "1", "value": 5, "state": "comparing"},
                                {"id": "2", "value": 8, "state": "comparing"},
                                {"id": "3", "value": 2, "state": "normal"}
                            ],
                            "pointers": {"i": 0, "j": 1}
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "Since 5 < 8, no swap is needed. Increment j to 2. Compare arr[2] (8) and arr[3] (2).",
                    "variables": {"arr": [3, 5, 8, 2], "n": 4, "i": 0, "j": 2},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "normal"},
                                {"id": "1", "value": 5, "state": "normal"},
                                {"id": "2", "value": 8, "state": "comparing"},
                                {"id": "3", "value": 2, "state": "comparing"}
                            ],
                            "pointers": {"i": 0, "j": 2}
                        }
                    ]
                },
                {
                    "line": 4,
                    "explanation": "Since 8 > 2, swap them. Array becomes [3, 5, 2, 8]. The largest element (8) has bubbled to the end.",
                    "variables": {"arr": [3, 5, 2, 8], "n": 4, "i": 0, "j": 2},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "normal"},
                                {"id": "1", "value": 5, "state": "normal"},
                                {"id": "2", "value": 2, "state": "swapped"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {"i": 0, "j": 2}
                        }
                    ]
                },
                {
                    "line": 2,
                    "explanation": "Outer loop increment i = 1. Start the second sorting pass.",
                    "variables": {"arr": [3, 5, 2, 8], "n": 4, "i": 1},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "normal"},
                                {"id": "1", "value": 5, "state": "normal"},
                                {"id": "2", "value": 2, "state": "normal"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {"i": 1}
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "Inner loop j = 0. Compare arr[0] (3) and arr[1] (5).",
                    "variables": {"arr": [3, 5, 2, 8], "n": 4, "i": 1, "j": 0},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "comparing"},
                                {"id": "1", "value": 5, "state": "comparing"},
                                {"id": "2", "value": 2, "state": "normal"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {"i": 1, "j": 0}
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "Since 3 < 5, no swap. Increment j to 1. Compare arr[1] (5) and arr[2] (2).",
                    "variables": {"arr": [3, 5, 2, 8], "n": 4, "i": 1, "j": 1},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "normal"},
                                {"id": "1", "value": 5, "state": "comparing"},
                                {"id": "2", "value": 2, "state": "comparing"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {"i": 1, "j": 1}
                        }
                    ]
                },
                {
                    "line": 4,
                    "explanation": "Since 5 > 2, swap them. Array becomes [3, 2, 5, 8]. The second largest element (5) is sorted.",
                    "variables": {"arr": [3, 2, 5, 8], "n": 4, "i": 1, "j": 1},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "normal"},
                                {"id": "1", "value": 2, "state": "swapped"},
                                {"id": "2", "value": 5, "state": "sorted"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {"i": 1, "j": 1}
                        }
                    ]
                },
                {
                    "line": 2,
                    "explanation": "Increment outer pass i = 2. Remaining unsorted elements are [3, 2].",
                    "variables": {"arr": [3, 2, 5, 8], "n": 4, "i": 2},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "normal"},
                                {"id": "1", "value": 2, "state": "normal"},
                                {"id": "2", "value": 5, "state": "sorted"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {"i": 2}
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "Inner loop j = 0. Compare arr[0] (3) and arr[1] (2).",
                    "variables": {"arr": [3, 2, 5, 8], "n": 4, "i": 2, "j": 0},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 3, "state": "comparing"},
                                {"id": "1", "value": 2, "state": "comparing"},
                                {"id": "2", "value": 5, "state": "sorted"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {"i": 2, "j": 0}
                        }
                    ]
                },
                {
                    "line": 4,
                    "explanation": "Since 3 > 2, swap them. Array is now sorted: [2, 3, 5, 8].",
                    "variables": {"arr": [2, 3, 5, 8], "n": 4, "i": 2, "j": 0},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 2, "state": "swapped"},
                                {"id": "1", "value": 3, "state": "sorted"},
                                {"id": "2", "value": 5, "state": "sorted"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {"i": 2, "j": 0}
                        }
                    ]
                },
                {
                    "line": 5,
                    "explanation": "Sorting completes. All elements marked sorted: [2, 3, 5, 8].",
                    "variables": {"arr": [2, 3, 5, 8], "n": 4, "i": 3},
                    "stack": ["bubble_sort"],
                    "visuals": [
                        {
                            "type": "array",
                            "name": "arr",
                            "elements": [
                                {"id": "0", "value": 2, "state": "sorted"},
                                {"id": "1", "value": 3, "state": "sorted"},
                                {"id": "2", "value": 5, "state": "sorted"},
                                {"id": "3", "value": 8, "state": "sorted"}
                            ],
                            "pointers": {}
                        }
                    ]
                }
            ]
        }
        
    # 2. Fibonacci (Recursion) check
    if "fib" in code_normalized or "recursion" in code_normalized:
        return {
            "metadata": {
                "algorithm_name": "Recursive Fibonacci",
                "time_complexity": "O(2^N)",
                "space_complexity": "O(N) stack depth",
                "summary": "Calculates Fibonacci numbers using recursion, creating a branching call tree that returns sums of lower values."
            },
            "steps": [
                {
                    "line": 1,
                    "explanation": "Invoke fib(3) to calculate the third Fibonacci number.",
                    "variables": {"n": 3},
                    "stack": ["fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "active", "val": None}
                            ]
                        }
                    ]
                },
                {
                    "line": 2,
                    "explanation": "fib(3): n (3) is not <= 1. Spawn sub-call fib(2).",
                    "variables": {"n": 3},
                    "stack": ["fib(2)", "fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "waiting", "val": None},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "active", "val": None}
                            ]
                        }
                    ]
                },
                {
                    "line": 2,
                    "explanation": "fib(2): n (2) is not <= 1. Spawn sub-call fib(1).",
                    "variables": {"n": 2},
                    "stack": ["fib(1)", "fib(2)", "fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "waiting", "val": None},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "waiting", "val": None},
                                {"id": "1a", "label": "fib(1)", "parentId": "2", "state": "active", "val": None}
                            ]
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "fib(1): base case reached! Return 1.",
                    "variables": {"n": 1},
                    "stack": ["fib(2)", "fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "waiting", "val": None},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "active", "val": None},
                                {"id": "1a", "label": "fib(1)", "parentId": "2", "state": "done", "val": 1}
                            ]
                        }
                    ]
                },
                {
                    "line": 4,
                    "explanation": "fib(2): Spawn second sub-call fib(0).",
                    "variables": {"n": 2},
                    "stack": ["fib(0)", "fib(2)", "fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "waiting", "val": None},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "waiting", "val": None},
                                {"id": "1a", "label": "fib(1)", "parentId": "2", "state": "done", "val": 1},
                                {"id": "0a", "label": "fib(0)", "parentId": "2", "state": "active", "val": None}
                            ]
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "fib(0): base case reached! Return 0.",
                    "variables": {"n": 0},
                    "stack": ["fib(2)", "fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "waiting", "val": None},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "active", "val": None},
                                {"id": "1a", "label": "fib(1)", "parentId": "2", "state": "done", "val": 1},
                                {"id": "0a", "label": "fib(0)", "parentId": "2", "state": "done", "val": 0}
                            ]
                        }
                    ]
                },
                {
                    "line": 5,
                    "explanation": "fib(2): Sum values fib(1)+fib(0) = 1+0 = 1. Return 1.",
                    "variables": {"n": 2, "result": 1},
                    "stack": ["fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "active", "val": None},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "done", "val": 1},
                                {"id": "1a", "label": "fib(1)", "parentId": "2", "state": "done", "val": 1},
                                {"id": "0a", "label": "fib(0)", "parentId": "2", "state": "done", "val": 0}
                            ]
                        }
                    ]
                },
                {
                    "line": 6,
                    "explanation": "fib(3): Spawn second sub-call fib(1).",
                    "variables": {"n": 3},
                    "stack": ["fib(1)", "fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "waiting", "val": None},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "done", "val": 1},
                                {"id": "1a", "label": "fib(1)", "parentId": "2", "state": "done", "val": 1},
                                {"id": "0a", "label": "fib(0)", "parentId": "2", "state": "done", "val": 0},
                                {"id": "1b", "label": "fib(1)", "parentId": "3", "state": "active", "val": None}
                            ]
                        }
                    ]
                },
                {
                    "line": 3,
                    "explanation": "fib(1): base case reached! Return 1.",
                    "variables": {"n": 1},
                    "stack": ["fib(3)"],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "active", "val": None},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "done", "val": 1},
                                {"id": "1a", "label": "fib(1)", "parentId": "2", "state": "done", "val": 1},
                                {"id": "0a", "label": "fib(0)", "parentId": "2", "state": "done", "val": 0},
                                {"id": "1b", "label": "fib(1)", "parentId": "3", "state": "done", "val": 1}
                            ]
                        }
                    ]
                },
                {
                    "line": 7,
                    "explanation": "fib(3) sums sub-calls: fib(2)+fib(1) = 1+1 = 2. Complete computation.",
                    "variables": {"n": 3, "result": 2},
                    "stack": [],
                    "visuals": [
                        {
                            "type": "recursion_tree",
                            "nodes": [
                                {"id": "3", "label": "fib(3)", "parentId": None, "state": "done", "val": 2},
                                {"id": "2", "label": "fib(2)", "parentId": "3", "state": "done", "val": 1},
                                {"id": "1a", "label": "fib(1)", "parentId": "2", "state": "done", "val": 1},
                                {"id": "0a", "label": "fib(0)", "parentId": "2", "state": "done", "val": 0},
                                {"id": "1b", "label": "fib(1)", "parentId": "3", "state": "done", "val": 1}
                            ]
                        }
                    ]
                }
            ]
        }
        
    # 3. Linked list Node check
    if "node" in code_normalized or "next" in code_normalized:
        return {
            "metadata": {
                "algorithm_name": "Linked List Insertion",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "summary": "Inserts a new node containing value 15 directly after the current head node in a Singly Linked List."
            },
            "steps": [
                {
                    "line": 1,
                    "explanation": "Create head node (10) and next node (20) in list.",
                    "variables": {"head_val": 10, "next_val": 20},
                    "stack": ["insert_after"],
                    "visuals": [
                        {
                            "type": "linked_list",
                            "nodes": [
                                {"id": "n1", "value": 10, "nextId": "n2", "state": "normal"},
                                {"id": "n2", "value": 20, "nextId": None, "state": "normal"}
                            ],
                            "pointers": {"head": "n1"}
                        }
                    ]
                },
                {
                    "line": 5,
                    "explanation": "Allocate new Node containing value 15. The head node points to it.",
                    "variables": {"new_val": 15},
                    "stack": ["insert_after"],
                    "visuals": [
                        {
                            "type": "linked_list",
                            "nodes": [
                                {"id": "n1", "value": 10, "nextId": "n2", "state": "normal"},
                                {"id": "n2", "value": 20, "nextId": None, "state": "normal"},
                                {"id": "n_new", "value": 15, "nextId": None, "state": "modified"}
                            ],
                            "pointers": {"head": "n1", "new_node": "n_new"}
                        }
                    ]
                },
                {
                    "line": 8,
                    "explanation": "Set new_node.next equal to head.next (n2).",
                    "variables": {"new_val": 15},
                    "stack": ["insert_after"],
                    "visuals": [
                        {
                            "type": "linked_list",
                            "nodes": [
                                {"id": "n1", "value": 10, "nextId": "n2", "state": "normal"},
                                {"id": "n2", "value": 20, "nextId": None, "state": "normal"},
                                {"id": "n_new", "value": 15, "nextId": "n2", "state": "modified"}
                            ],
                            "pointers": {"head": "n1", "new_node": "n_new"}
                        }
                    ]
                },
                {
                    "line": 9,
                    "explanation": "Redirect head.next to point to new_node. Node is inserted successfully.",
                    "variables": {"new_val": 15},
                    "stack": ["insert_after"],
                    "visuals": [
                        {
                            "type": "linked_list",
                            "nodes": [
                                {"id": "n1", "value": 10, "nextId": "n_new", "state": "normal"},
                                {"id": "n_new", "value": 15, "nextId": "n2", "state": "normal"},
                                {"id": "n2", "value": 20, "nextId": None, "state": "normal"}
                            ],
                            "pointers": {"head": "n1", "new_node": "n_new"}
                        }
                    ]
                }
            ]
        }

    return None

def get_local_bubble_sort_trace(arr: List[int]) -> Dict[str, Any]:
    """Generates bubble sort visual trace frames locally in under 1ms."""
    steps = []
    n = len(arr)
    elements = [{"id": str(idx), "value": val, "state": "normal"} for idx, val in enumerate(arr)]
    
    steps.append({
        "line": 1,
        "explanation": f"Initialize array: {arr}.",
        "variables": {"arr": arr.copy(), "n": n},
        "stack": ["bubble_sort"],
        "visuals": [{
            "type": "array",
            "name": "arr",
            "elements": json.loads(json.dumps(elements)),
            "pointers": {}
        }]
    })
    
    curr_elements = json.loads(json.dumps(elements))
    
    for i in range(n):
        for idx in range(n - i, n):
            if idx >= 0:
                curr_elements[idx]["state"] = "sorted"
                
        steps.append({
            "line": 2,
            "explanation": f"Start pass i = {i}.",
            "variables": {"arr": [e["value"] for e in curr_elements], "n": n, "i": i},
            "stack": ["bubble_sort"],
            "visuals": [{
                "type": "array",
                "name": "arr",
                "elements": json.loads(json.dumps(curr_elements)),
                "pointers": {"i": i}
            }]
        })
        
        for j in range(0, n - i - 1):
            for idx in range(n - i):
                curr_elements[idx]["state"] = "normal"
                
            curr_elements[j]["state"] = "comparing"
            curr_elements[j+1]["state"] = "comparing"
            
            steps.append({
                "line": 3,
                "explanation": f"Compare arr[{j}] ({curr_elements[j]['value']}) and arr[{j+1}] ({curr_elements[j+1]['value']}).",
                "variables": {"arr": [e["value"] for e in curr_elements], "n": n, "i": i, "j": j},
                "stack": ["bubble_sort"],
                "visuals": [{
                    "type": "array",
                    "name": "arr",
                    "elements": json.loads(json.dumps(curr_elements)),
                    "pointers": {"i": i, "j": j}
                }]
            })
            
            if curr_elements[j]["value"] > curr_elements[j+1]["value"]:
                curr_elements[j]["state"] = "swapped"
                curr_elements[j+1]["state"] = "swapped"
                curr_elements[j]["value"], curr_elements[j+1]["value"] = curr_elements[j+1]["value"], curr_elements[j]["value"]
                
                steps.append({
                    "line": 4,
                    "explanation": f"Swap index {j} and {j+1}.",
                    "variables": {"arr": [e["value"] for e in curr_elements], "n": n, "i": i, "j": j},
                    "stack": ["bubble_sort"],
                    "visuals": [{
                        "type": "array",
                        "name": "arr",
                        "elements": json.loads(json.dumps(curr_elements)),
                        "pointers": {"i": i, "j": j}
                    }]
                })
                
    final_elements = [{"id": str(idx), "value": val, "state": "sorted"} for idx, val in enumerate([e["value"] for e in curr_elements])]
    steps.append({
        "line": 5,
        "explanation": "Sorting completes. Array is fully sorted.",
        "variables": {"arr": [e["value"] for e in final_elements], "n": n, "i": n},
        "stack": ["bubble_sort"],
        "visuals": [{
            "type": "array",
            "name": "arr",
            "elements": final_elements,
            "pointers": {}
        }]
    })
    
    return {
        "metadata": {
            "algorithm_name": "Bubble Sort (Local Engine)",
            "time_complexity": "O(N^2)",
            "space_complexity": "O(1)",
            "summary": "Generated locally using the visual code compiling engine for 0ms latency."
        },
        "steps": steps
    }

def get_local_fibonacci_trace(n: int) -> Dict[str, Any]:
    """Generates recursive fibonacci call tree visual frames locally."""
    steps = []
    nodes = []
    node_id_counter = 0
    
    def run_fib(val, parent_id=None):
        nonlocal node_id_counter
        curr_id = str(node_id_counter)
        node_id_counter += 1
        
        call_label = f"fib({val})"
        nodes.append({
            "id": curr_id,
            "label": call_label,
            "parentId": parent_id,
            "state": "active",
            "val": None
        })
        
        stack = []
        temp_pid = parent_id
        while temp_pid is not None:
            parent_node = next(x for x in nodes if x["id"] == temp_pid)
            stack.append(parent_node["label"])
            temp_pid = parent_node["parentId"]
        stack.reverse()
        stack.append(call_label)
        
        steps.append({
            "line": 1,
            "explanation": f"Call {call_label}.",
            "variables": {"n": val},
            "stack": list(stack),
            "visuals": [{
                "type": "recursion_tree",
                "nodes": json.loads(json.dumps(nodes))
            }]
        })
        
        if val <= 1:
            node_idx = next(i for i, x in enumerate(nodes) if x["id"] == curr_id)
            nodes[node_idx]["state"] = "done"
            nodes[node_idx]["val"] = val
            
            steps.append({
                "line": 3,
                "explanation": f"fib({val}) base case. Return {val}.",
                "variables": {"n": val},
                "stack": list(stack),
                "visuals": [{
                    "type": "recursion_tree",
                    "nodes": json.loads(json.dumps(nodes))
                }]
            })
            return val
            
        node_idx = next(i for i, x in enumerate(nodes) if x["id"] == curr_id)
        nodes[node_idx]["state"] = "waiting"
        
        steps.append({
            "line": 2,
            "explanation": f"fib({val}): Spawn sub-call fib({val-1}).",
            "variables": {"n": val},
            "stack": list(stack),
            "visuals": [{
                "type": "recursion_tree",
                "nodes": json.loads(json.dumps(nodes))
            }]
        })
        
        v1 = run_fib(val - 1, curr_id)
        
        stack = []
        temp_pid = parent_id
        while temp_pid is not None:
            parent_node = next(x for x in nodes if x["id"] == temp_pid)
            stack.append(parent_node["label"])
            temp_pid = parent_node["parentId"]
        stack.reverse()
        stack.append(call_label)
        
        steps.append({
            "line": 4,
            "explanation": f"fib({val}): Spawn sub-call fib({val-2}).",
            "variables": {"n": val, "fib(n-1)": v1},
            "stack": list(stack),
            "visuals": [{
                "type": "recursion_tree",
                "nodes": json.loads(json.dumps(nodes))
            }]
        })
        
        v2 = run_fib(val - 2, curr_id)
        
        stack = []
        temp_pid = parent_id
        while temp_pid is not None:
            parent_node = next(x for x in nodes if x["id"] == temp_pid)
            stack.append(parent_node["label"])
            temp_pid = parent_node["parentId"]
        stack.reverse()
        stack.append(call_label)
        
        res = v1 + v2
        
        node_idx = next(i for i, x in enumerate(nodes) if x["id"] == curr_id)
        nodes[node_idx]["state"] = "done"
        nodes[node_idx]["val"] = res
        
        steps.append({
            "line": 5,
            "explanation": f"fib({val}) returns {v1} + {v2} = {res}.",
            "variables": {"n": val, "result": res},
            "stack": list(stack),
            "visuals": [{
                "type": "recursion_tree",
                "nodes": json.loads(json.dumps(nodes))
            }]
        })
        return res
        
    run_fib(n)
    
    return {
        "metadata": {
            "algorithm_name": "Fibonacci (Local Engine)",
            "time_complexity": "O(2^N)",
            "space_complexity": "O(N)",
            "summary": "Generated locally using the visual code compiling engine for 0ms latency."
        },
        "steps": steps
    }

def compile_visual_trace(code: str, language: str) -> Dict[str, Any]:
    """
    Agent orchestrator that executes the code locally, performs RAG retrieval,
    and calls Groq LLM to formulate step-by-step visual frames.
    Supports offline fallback traces if GROQ_API_KEY is not configured.
    """
    # 0. Check caching system
    code_hash = get_code_hash(code, language)
    if code_hash in trace_cache:
        cached_res = trace_cache[code_hash].copy()
        cached_res["cache_hit"] = True
        return cached_res

    # 0.1 Check for local Bubble Sort Visual Compiler
    code_normalized = re.sub(r'\s+', '', code.lower())
    if "bubble" in code_normalized:
        match_list = re.search(r'\[\s*([0-9\s,]+)\s*\]', code)
        match_java_list = re.search(r'\{\s*([0-9\s,]+)\s*\}', code)
        arr = None
        if match_list:
            try:
                arr = [int(x.strip()) for x in match_list.group(1).split(",") if x.strip()]
            except Exception:
                pass
        elif match_java_list:
            try:
                arr = [int(x.strip()) for x in match_java_list.group(1).split(",") if x.strip()]
            except Exception:
                pass
                
        if arr and 2 <= len(arr) <= 8:
            local_trace = get_local_bubble_sort_trace(arr)
            res = {
                "success": True,
                "offline_mode": True,
                "stdout": "Compiled locally (Local Sort Engine)",
                "stderr": "",
                "execution_time_ms": 0,
                "trace": local_trace,
                "cache_hit": False
            }
            trace_cache[code_hash] = res
            return res

    # 0.2 Check for local Fibonacci Recursion Visual Compiler
    if "fib" in code_normalized:
        match_fib = re.search(r'fib\(\s*(\d+)\s*\)', code_normalized)
        n = None
        if match_fib:
            try:
                n = int(match_fib.group(1))
            except Exception:
                pass
                
        if n is not None and 1 <= n <= 5:
            local_trace = get_local_fibonacci_trace(n)
            res = {
                "success": True,
                "offline_mode": True,
                "stdout": "Compiled locally (Local Recursion Engine)",
                "stderr": "",
                "execution_time_ms": 0,
                "trace": local_trace,
                "cache_hit": False
            }
            trace_cache[code_hash] = res
            return res

    # 1. Check offline fallback trace first
    fallback = get_offline_fallback_trace(code, language)
    if fallback and not os.getenv("GROQ_API_KEY"):
        return {
            "success": True,
            "offline_mode": True,
            "stdout": "Compiled locally (Offline Demo Cache)",
            "stderr": "",
            "execution_time_ms": 1,
            "trace": fallback
        }

    # 2. Run code locally to check syntax and get stdout/stderr
    run_info = execute_code(code, language)
    
    # If compilation fails or execution error occurs, return error immediately
    if not run_info["success"] and run_info["status"] in ["compile_error", "timeout", "error"]:
        return {
            "success": False,
            "offline_mode": False,
            "stdout": run_info["stdout"],
            "stderr": run_info["stderr"],
            "execution_time_ms": run_info["execution_time_ms"],
            "trace": None
        }

    # 3. Retrieve concepts via RAG
    search_query = analyze_code_for_keywords(code)
    try:
        rag_engine = get_rag_engine()
        retrieved_docs = rag_engine.retrieve(search_query, top_k=2)
        rag_context = "\n\n".join([f"Source: {d['title']} - {d['section']}\n{d['content']}" for d in retrieved_docs])
    except Exception as e:
        print(f"RAG search error: {e}")
        rag_context = "No specific RAG guidelines available."

    # 4. Check for Groq API Key
    client = get_groq_client()
    if not client:
        # Fallback basic tracing if no key but execution was custom
        # Produce a basic single step tracing showing output
        basic_trace = {
            "metadata": {
                "algorithm_name": "Custom Execution",
                "time_complexity": "N/A",
                "space_complexity": "N/A",
                "summary": "Code ran successfully on your machine. Configure GROQ_API_KEY to unlock advanced step-by-step visualizations."
            },
            "steps": [
                {
                    "line": 1,
                    "explanation": "Code executed successfully. Output is captured in the console below.",
                    "variables": {"status": "success"},
                    "stack": ["main"],
                    "visuals": [
                        {
                            "type": "console",
                            "output": run_info["stdout"] if run_info["stdout"] else "[No stdout output]"
                        }
                    ]
                }
            ]
        }
        return {
            "success": True,
            "offline_mode": True,
            "stdout": run_info["stdout"],
            "stderr": run_info["stderr"],
            "execution_time_ms": run_info["execution_time_ms"],
            "trace": basic_trace
        }

    # 5. Compile prompt for Groq
    system_prompt = """
You are the Agentic AI Code Visualizer compiler. Your job is to compile a detailed, step-by-step visual execution trace of the user's Python, Java, C++, or JavaScript program.
The code ran successfully on the server.

You MUST return a JSON object with:
1. "metadata": containing "algorithm_name" (str), "time_complexity" (str), "space_complexity" (str), and "summary" (str).
2. "steps": a list of trace steps. Keep total steps <= 12. Only include crucial steps (variable changes or pointer swaps). Each step contains:
   - "line" (int): current line number executing (1-indexed).
   - "explanation" (str): friendly description of what happens at this execution step (keep under 12 words).
   - "variables" (dict): dictionary of variable names mapped to their values at this step.
   - "stack" (list): array of function signatures on the stack.
   - "visuals" (list): visual component payloads. Supported components are:
     - Array component: {"type": "array", "name": "arr", "elements": [{"id": "0", "value": val, "state": "normal"|"comparing"|"swapped"|"sorted"|"visiting"}], "pointers": {"pointer_name": index_int}}
     - Linked list node pointers: {"type": "linked_list", "nodes": [{"id": "node_1", "value": val, "nextId": "node_2"|null, "state": "normal"|"active"|"modified"}], "pointers": {"head": "node_1", "curr": "node_2"}}
     - Recursion tree component: {"type": "recursion_tree", "nodes": [{"id": "id", "label": "func(val)", "parentId": parentId|null, "state": "active"|"done"|"waiting", "val": returnVal|null}]}
     - Scalar variables component (MUST use this to visualize variables and loop conditions for code that has no array/list/tree data structures): {"type": "variables", "vars": [{"name": "varName_or_checkCondition", "value": val, "state": "normal"|"checking"|"updated"}]}
     - Stack & Queue component: {"type": "stack_queue", "variant": "stack"|"queue", "name": "varName", "items": [{"id": "0", "value": val, "state": "normal"|"pushing"|"popping"|"top"}]}

Make sure to construct trace steps that cover crucial updates: loop bounds, variable assignments, comparison changes, and pointer updates. Do not create steps for empty lines.
"""

    prompt_body = f"""
Language: {language}
User Code:
---
{code}
---
Actual execution stdout output:
---
{run_info["stdout"]}
---

RAG VISUAL SPECIFICATION & CONTEXTS:
---
{rag_context}
---

Compile the JSON trace:
"""

    try:
        response = client.chat.completions.create(
            model='llama-3.1-8b-instant',
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt_body}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=1000
        )
        
        trace_data = json.loads(response.choices[0].message.content)
        
        # Save to memory cache
        res = {
            "success": True,
            "offline_mode": False,
            "stdout": run_info["stdout"],
            "stderr": run_info["stderr"],
            "execution_time_ms": run_info["execution_time_ms"],
            "trace": trace_data,
            "cache_hit": False
        }
        trace_cache[code_hash] = res
        return res
        
    except Exception as e:
        print(f"Error calling Groq for visualizer compilation: {e}")
        # Return fallback run output trace
        error_trace = {
            "metadata": {
                "algorithm_name": "Execution Success",
                "time_complexity": "Unknown",
                "space_complexity": "Unknown",
                "summary": "Ran successfully, but could not compile AI step-by-step visuals due to LLM request error."
            },
            "steps": [
                {
                    "line": 1,
                    "explanation": f"Execution ran successfully but LLM failed to generate visual steps: {str(e)}",
                    "variables": {"status": "LLM_error"},
                    "stack": ["main"],
                    "visuals": [{"type": "console", "output": run_info["stdout"]}]
                }
            ]
        }
        return {
            "success": True,
            "offline_mode": False,
            "stdout": run_info["stdout"],
            "stderr": run_info["stderr"],
            "execution_time_ms": run_info["execution_time_ms"],
            "trace": error_trace
        }

def chat_with_explainer(code: str, language: str, user_message: str, chat_history: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Answers questions about the code, recursion states, and visualization.
    Uses RAG retrieval context and Groq LLM.
    """
    client = get_groq_client()
    if not client:
        return {
            "answer": "RAG Chat is offline because no `GROQ_API_KEY` was found. Configure the key to converse with the programming assistant agent.",
            "sources": []
        }

    search_query = analyze_code_for_keywords(code) + " " + user_message
    try:
        rag_engine = get_rag_engine()
        retrieved_docs = rag_engine.retrieve(search_query, top_k=2)
        rag_context = "\n\n".join([f"Source: {d['title']} - {d['section']}\n{d['content']}" for d in retrieved_docs])
        sources = [f"{d['title']} ({d['section']})" for d in retrieved_docs]
    except Exception as e:
        print(f"RAG search error in chat: {e}")
        rag_context = "No RAG context loaded."
        sources = []

    system_instruction = f"""
You are the Agentic AI Programming Coach, an assistant designed to clarify code execution, visual structures, recursion states, and variable bindings.
The user is working on the following {language} code:

=== CODE ===
{code}
=== END OF CODE ===

Use the following RAG documentation context to frame your response if applicable:
---
{rag_context}
---

Guidelines:
- Explain things step-by-step using clear, simple programming concepts.
- Refer back to specific lines of code.
- If the user asks about the visualization components (Arrays, Trees, Lists), explain how the visual representations correspond to memory addresses or indexing states.
"""

    messages = [{"role": "system", "content": system_instruction}]
    
    # Append history
    for msg in chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    # Append current message
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model='llama-3.1-8b-instant',
            messages=messages,
            temperature=0.4
        )
        return {
            "answer": response.choices[0].message.content,
            "sources": sources
        }
    except Exception as e:
        return {
            "answer": f"Error communicating with agent: {str(e)}",
            "sources": []
        }
