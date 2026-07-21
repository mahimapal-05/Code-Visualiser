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
head.next = new_node`
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
head.next = newNode;`
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
