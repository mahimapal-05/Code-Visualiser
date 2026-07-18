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
  }
};

export default function CodeEditor({ code, setCode, language, setLanguage, onRun, onVisualize, isRunning, isCompiling }) {
  const [activeTemplate, setActiveTemplate] = useState('bubble');

  // Sync templates on language change
  useEffect(() => {
    setCode(EXAMPLES[language][activeTemplate]);
  }, [language, activeTemplate, setCode]);

  const handleTemplateChange = (e) => {
    setActiveTemplate(e.target.value);
    setCode(EXAMPLES[language][e.target.value]);
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
        background: 'rgba(10, 12, 16, 0.4)'
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
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Templates:</span>
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
            <option value="fibonacci">Fibonacci (Recursion)</option>
            <option value="linkedlist">Linked List Node</option>
          </select>
        </div>
      </div>

      {/* Editor Code Area */}
      <div style={{ display: 'flex', flexGrow: 1, position: 'relative', overflow: 'hidden', minHeight: '180px' }}>
        {/* Line Numbers */}
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
          minWidth: '40px'
        }}>
          {lineNumbers.map(n => <div key={n}>{n}</div>)}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
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
      </div>

      {/* Editor Footer Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 12, 16, 0.2)'
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
