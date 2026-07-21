import React, { useState, useEffect } from 'react';

const EXAMPLES = {
  python: {
    bubble: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

print(bubble_sort([5, 3, 8, 2]))`,
    fibonacci: `def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(3))`,
    linkedlist: `# Singly Linked List Insertion
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

# head (10) -> (20)
head = Node(10)
head.next = Node(20)

# insert new node (15) after head
new_node = Node(15)
new_node.next = head.next
head.next = new_node`,
    stack: `# Stack Push & Pop Operations
stack = []
stack.append(10)
stack.append(20)
stack.append(30)

popped = stack.pop()
print("Popped element:", popped)
print("Current stack:", stack)`,
    binarysearch: `# Binary Search Algorithm
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

arr = [2, 5, 8, 12, 16, 23, 38, 56]
target = 23
result = binary_search(arr, target)
print(f"Target {target} found at index:", result)`,
    prime: `# Prime Number Verification
def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

num = 29
print(f"Is {num} prime?:", is_prime(num))`,
    grid: `# 2D Grid Matrix Path Traversal
grid = [
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 1]
]

rows, cols = 3, 3
path_cells = 0

for r in range(rows):
    for c in range(cols):
        if grid[r][c] == 1:
            path_cells += 1

print("Total path cells visited:", path_cells)`
  },
  java: {
    bubble: `import java.util.Arrays;

public class Main {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {5, 3, 8, 2};
        bubbleSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`,
    fibonacci: `public class Main {
    public static int fib(int n) {
        if (n <= 1) {
            return n;
        }
        return fib(n-1) + fib(n-2);
    }

    public static void main(String[] args) {
        System.out.println(fib(3));
    }
}`,
    linkedlist: `public class Main {
    static class Node {
        int value;
        Node next;
        Node(int value) {
            this.value = value;
            this.next = null;
        }
    }

    public static void main(String[] args) {
        Node head = new Node(10);
        head.next = new Node(20);

        Node newNode = new Node(15);
        newNode.next = head.next;
        head.next = newNode;
    }
}`,
    stack: `import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Stack<Integer> st = new Stack<>();
        st.push(10);
        st.push(20);
        st.push(30);

        int popped = st.pop();
        System.out.println("Popped element: " + popped);
        System.out.println("Current stack: " + st);
    }
}`,
    binarysearch: `public class Main {
    public static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = (low + high) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
        int target = 23;
        System.out.println("Target found at index: " + binarySearch(arr, target));
    }
}`,
    prime: `public class Main {
    public static boolean isPrime(int n) {
        if (n <= 1) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        int num = 29;
        System.out.println("Is " + num + " prime?: " + isPrime(num));
    }
}`,
    grid: `public class Main {
    public static void main(String[] args) {
        int[][] grid = {
            {1, 0, 0},
            {1, 1, 0},
            {0, 1, 1}
        };
        int count = 0;
        for (int r = 0; r < 3; r++) {
            for (int c = 0; c < 3; c++) {
                if (grid[r][c] == 1) count++;
            }
        }
        System.out.println("Total path cells visited: " + count);
    }
}`
  },
  cpp: {
    bubble: `#include <iostream>
#include <vector>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                std::swap(arr[j], arr[j+1]);
            }
        }
    }
}

int main() {
    std::vector<int> arr = {5, 3, 8, 2};
    bubbleSort(arr);
    for (int x : arr) std::cout << x << " ";
    return 0;
}`,
    fibonacci: `#include <iostream>

int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}

int main() {
    std::cout << fib(3) << std::endl;
    return 0;
}`,
    linkedlist: `#include <iostream>

struct Node {
    int value;
    Node* next;
    Node(int val) : value(val), next(nullptr) {}
};

int main() {
    Node* head = new Node(10);
    head->next = new Node(20);

    Node* newNode = new Node(15);
    newNode->next = head->next;
    head->next = newNode;
    return 0;
}`,
    stack: `#include <iostream>
#include <stack>

int main() {
    std::stack<int> st;
    st.push(10);
    st.push(20);
    st.push(30);

    int popped = st.top();
    st.pop();
    std::cout << "Popped element: " << popped << std::endl;
    return 0;
}`,
    binarysearch: `#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    std::vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 56};
    std::cout << "Target found at index: " << binarySearch(arr, 23) << std::endl;
    return 0;
}`,
    prime: `#include <iostream>

bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    int num = 29;
    std::cout << "Is " << num << " prime?: " << (isPrime(num) ? "true" : "false") << std::endl;
    return 0;
}`,
    grid: `#include <iostream>
#include <vector>

int main() {
    std::vector<std::vector<int>> grid = {
        {1, 0, 0},
        {1, 1, 0},
        {0, 1, 1}
    };
    int count = 0;
    for (int r = 0; r < 3; r++) {
        for (int c = 0; c < 3; c++) {
            if (grid[r][c] == 1) count++;
        }
    }
    std::cout << "Total path cells visited: " << count << std::endl;
    return 0;
}`
  },
  javascript: {
    bubble: `function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
            }
        }
    }
    return arr;
}

console.log(bubbleSort([5, 3, 8, 2]));`,
    fibonacci: `function fib(n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}

console.log(fib(3));`,
    linkedlist: `class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

let head = new Node(10);
head.next = new Node(20);

let newNode = new Node(15);
newNode.next = head.next;
head.next = newNode;`,
    stack: `// Stack Push & Pop Example
let stack = [];
stack.push(10);
stack.push(20);
stack.push(30);

let popped = stack.pop();
console.log("Popped element:", popped);
console.log("Current stack:", stack);`,
    binarysearch: `function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

console.log("Target found at index:", binarySearch([2, 5, 8, 12, 16, 23, 38, 56], 23));`,
    prime: `function isPrime(n) {
    if (n <= 1) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
}

let num = 29;
console.log(\`Is \${num} prime?:\`, isPrime(num));`,
    grid: `let grid = [
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 1]
];

let count = 0;
for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
        if (grid[r][c] === 1) count++;
    }
}
console.log("Total path cells visited:", count);`
  }
};

export default function CodeEditor({ 
  code, 
  setCode, 
  language, 
  setLanguage, 
  onRun, 
  onVisualize, 
  isRunning, 
  isCompiling,
  activeLine,
  syncStatus,
  isSimulationMode,
  setIsSimulationMode,
  breakpoints = [],
  onToggleBreakpoint = () => {}
}) {
  const [activeTemplate, setActiveTemplate] = useState('bubble');

  // Sync templates on language change
  useEffect(() => {
    if (EXAMPLES[language] && EXAMPLES[language][activeTemplate]) {
      setCode(EXAMPLES[language][activeTemplate]);
    }
    setIsSimulationMode(false);
  }, [language, activeTemplate, setCode, setIsSimulationMode]);

  const handleTemplateChange = (e) => {
    setActiveTemplate(e.target.value);
    if (EXAMPLES[language] && EXAMPLES[language][e.target.value]) {
      setCode(EXAMPLES[language][e.target.value]);
    }
    setIsSimulationMode(false);
  };

  const handleCodeChange = (val) => {
    setCode(val);
    setIsSimulationMode(false);
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Editor Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10, 12, 16, 0.4)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-accent)' }}>👩‍💻 PLAYGROUND</span>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        {/* Caching & Compilation Status Chip */}
        {syncStatus && syncStatus !== 'idle' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {syncStatus === 'syncing' && (
              <span className="status-chip status-syncing">
                ⚡ Live Compiling...
              </span>
            )}
            {syncStatus === 'compiled' && (
              <span className="status-chip status-compiled">
                ✓ Visuals Synced
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="status-chip status-error">
                ✗ Syntax Error
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={activeTemplate}
            onChange={handleTemplateChange}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="bubble">Bubble Sort</option>
            <option value="fibonacci">Fibonacci</option>
            <option value="linkedlist">Linked List</option>
            <option value="stack">Stack Operations</option>
            <option value="binarysearch">Binary Search</option>
            <option value="prime">Prime Verification</option>
            <option value="grid">2D Grid Traversal</option>
          </select>
        </div>
      </div>

      {/* Mode Control Bar */}
      {isSimulationMode && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.08)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '6px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          flexShrink: 0
        }}>
          <span>🤖 Simulation View (Showing step highlights)</span>
          <button 
            onClick={() => setIsSimulationMode(false)}
            className="btn-secondary" 
            style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}
          >
            ✏️ Edit Code
          </button>
        </div>
      )}

      {/* Editor Code Area */}
      <div style={{ display: 'flex', flexGrow: 1, position: 'relative', overflow: 'hidden', minHeight: '180px' }}>
        
        {isSimulationMode ? (
          /* Render simulation code lines with highlights */
          <div 
            onDoubleClick={() => setIsSimulationMode(false)}
            style={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '13px', 
              lineHeight: '20px', 
              padding: '16px 0',
              cursor: 'text'
            }}
          >
            {code.split('\n').map((lineText, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = lineNum === activeLine;
              const hasBreakpoint = breakpoints.includes(lineNum);
              return (
                <div 
                  key={idx} 
                  className={isHighlighted ? "line-highlight" : ""}
                  style={{
                    display: 'flex',
                    padding: '0 16px',
                    minHeight: '20px',
                    color: isHighlighted ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'background-color 0.25s ease'
                  }}
                >
                  <span 
                    onClick={() => onToggleBreakpoint(lineNum)}
                    title="Click to toggle breakpoint"
                    style={{ 
                      width: '35px', 
                      textAlign: 'right', 
                      marginRight: '16px', 
                      color: hasBreakpoint ? '#ef4444' : (isHighlighted ? 'var(--color-accent)' : 'var(--text-muted)'), 
                      userSelect: 'none',
                      fontWeight: isHighlighted || hasBreakpoint ? 'bold' : 'normal',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}
                  >
                    {hasBreakpoint && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />}
                    {lineNum}
                  </span>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {lineText || ' '}
                  </pre>
                </div>
              );
            })}
          </div>
        ) : (
          /* Render standard editable textarea */
          <>
            {/* Line Numbers with Breakpoints */}
            <div style={{
              padding: '16px 8px 16px 16px',
              background: 'rgba(10, 12, 16, 0.3)',
              borderRight: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '20px',
              userSelect: 'none',
              minWidth: '45px'
            }}>
              {lineNumbers.map(n => {
                const hasBp = breakpoints.includes(n);
                return (
                  <div 
                    key={n} 
                    onClick={() => onToggleBreakpoint(n)}
                    title="Click to toggle breakpoint"
                    style={{ 
                      cursor: 'pointer',
                      color: hasBp ? '#ef4444' : 'inherit',
                      fontWeight: hasBp ? 'bold' : 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}
                  >
                    {hasBp && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />}
                    {n}
                  </div>
                );
              })}
            </div>

            {/* Textarea Code Input */}
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              spellCheck="false"
              placeholder="Write your code here..."
              style={{
                flexGrow: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: '20px',
                padding: '16px',
                resize: 'none',
                overflowY: 'auto',
                tabSize: 4
              }}
            />
          </>
        )}
      </div>

      {/* Editor Footer Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 12, 16, 0.2)',
        flexShrink: 0
      }}>
        <button 
          onClick={onRun}
          disabled={isRunning || isCompiling}
          className="btn-secondary"
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isRunning ? (
            <span>Running...</span>
          ) : (
            <>
              <span>⚡</span> Run Output
            </>
          )}
        </button>

        <button 
          onClick={onVisualize}
          disabled={isCompiling || isRunning}
          className="btn-primary"
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isCompiling ? (
            <span>Visualizing...</span>
          ) : (
            <>
              <span>👁️</span> Compile & Visualize
            </>
          )}
        </button>
      </div>
    </div>
  );
}
