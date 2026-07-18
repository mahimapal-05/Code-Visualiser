import React from 'react';

// Helpers to render arrows/links
function SVGArrow({ fromX, fromY, toX, toY }) {
  const headLength = 10; // length of head in pixels
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  
  // Back off the arrow tip so it doesn't overlap the node borders
  const offX = toX - 35 * Math.cos(angle);
  const offY = toY - 35 * Math.sin(angle);
  
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 2 L 10 5 L 0 8 z" fill="var(--color-accent)" />
        </marker>
      </defs>
      <line
        x1={fromX}
        y1={fromY}
        x2={offX}
        y2={offY}
        stroke="var(--color-accent)"
        strokeWidth="2"
        markerEnd="url(#arrow)"
        strokeDasharray="4 2"
      />
    </svg>
  );
}

export default function VisualizerCanvas({ stepData }) {
  if (!stepData) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-secondary)',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ fontSize: '40px' }}>🎨</div>
        <p>Write or select some code, and click "Compile & Visualize".</p>
      </div>
    );
  }

  const { visuals = [], explanation = "", variables = {}, stack = [] } = stepData;

  // Render arrays
  const renderArray = (viz) => {
    const { elements = [], name = "arr", pointers = {} } = viz;
    
    // Find active pointers at each index
    const indexPointers = {};
    Object.entries(pointers).forEach(([pName, pIdx]) => {
      const idxInt = parseInt(pIdx);
      if (!isNaN(idxInt)) {
        if (!indexPointers[idxInt]) indexPointers[idxInt] = [];
        indexPointers[idxInt].push(pName);
      }
    });

    return (
      <div key={viz.name || 'arr'} style={{ marginBottom: '24px', width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Array: {name}</h4>
        
        <div style={{ display: 'flex', gap: '8px', padding: '20px 0', overflowX: 'auto', alignItems: 'flex-start' }}>
          {elements.map((el, idx) => {
            let stateClass = '';
            let style = {
              width: '50px',
              height: '50px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              position: 'relative',
              transition: 'all 0.3s ease',
              flexShrink: 0
            };

            if (el.state === 'comparing') {
              style.borderColor = 'var(--color-compare)';
              style.boxShadow = '0 0 10px var(--color-compare-glow)';
              style.animation = 'pulse-glow 1s infinite';
            } else if (el.state === 'swapped') {
              style.borderColor = 'var(--color-swap)';
              style.boxShadow = '0 0 15px var(--color-swap-glow)';
              style.animation = 'pulse-swap 0.5s ease-in-out';
            } else if (el.state === 'sorted') {
              style.borderColor = 'var(--color-success)';
              style.background = 'rgba(16, 185, 129, 0.1)';
            }

            return (
              <div key={el.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '50px' }}>
                {/* Element Block */}
                <div style={style}>
                  {el.value}
                </div>
                {/* Index label */}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{idx}</span>
                {/* Pointer tags */}
                {indexPointers[idx] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                    {indexPointers[idx].map(pName => (
                      <span 
                        key={pName} 
                        style={{
                          background: 'var(--color-accent)',
                          color: 'var(--bg-deep)',
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ▲ {pName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render linked lists
  const renderLinkedList = (viz) => {
    const { nodes = [], pointers = {} } = viz;
    
    // Node pointing references
    const nodePointers = {};
    Object.entries(pointers).forEach(([pName, pNodeId]) => {
      if (pNodeId) {
        if (!nodePointers[pNodeId]) nodePointers[pNodeId] = [];
        nodePointers[pNodeId].push(pName);
      }
    });

    return (
      <div key="linkedlist" style={{ marginBottom: '24px', width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Singly Linked List</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', padding: '30px 10px', overflowX: 'auto' }}>
          {nodes.map((node, idx) => {
            let borderStyle = '1px solid var(--border-subtle)';
            let bgStyle = 'var(--bg-surface)';
            
            if (node.state === 'active') {
              borderStyle = '2px solid var(--color-compare)';
              bgStyle = 'rgba(56, 189, 248, 0.1)';
            } else if (node.state === 'modified') {
              borderStyle = '2px solid var(--color-swap)';
              bgStyle = 'rgba(236, 72, 153, 0.1)';
            }

            return (
              <div key={node.id || idx} style={{ display: 'flex', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
                {/* Pointer Indicators above node */}
                {nodePointers[node.id] && (
                  <div style={{
                    position: 'absolute',
                    top: '-32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '4px',
                    zIndex: 2
                  }}>
                    {nodePointers[node.id].map(pName => (
                      <span 
                        key={pName}
                        style={{
                          background: 'var(--color-compare)',
                          color: 'var(--bg-deep)',
                          fontSize: '9px',
                          fontWeight: '600',
                          padding: '2px 5px',
                          borderRadius: '4px'
                        }}
                      >
                        {pName}
                      </span>
                    ))}
                  </div>
                )}

                {/* Node Box */}
                <div 
                  className="node-enter"
                  style={{
                    display: 'flex',
                    border: borderStyle,
                    borderRadius: '8px',
                    background: bgStyle,
                    height: '50px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    borderRight: '1px solid var(--border-subtle)',
                    fontWeight: '600',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {node.value}
                  </div>
                  <div style={{
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'rgba(0,0,0,0.1)'
                  }}>
                    next
                  </div>
                </div>

                {/* Arrow Pointer */}
                {idx < nodes.length - 1 && (
                  <div style={{
                    width: '40px',
                    height: '2px',
                    background: 'var(--color-accent)',
                    position: 'absolute',
                    right: '-40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    zIndex: 0
                  }}>
                    <div style={{
                      width: '0',
                      height: '0',
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderLeft: '7px solid var(--color-accent)',
                      marginRight: '-1px'
                    }} />
                  </div>
                )}
                
                {/* NULL tail visual */}
                {idx === nodes.length - 1 && node.nextId === null && (
                  <div style={{
                    position: 'absolute',
                    right: '-32px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px'
                  }}>
                    Ø
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render recursion trees
  const renderRecursionTree = (viz) => {
    const { nodes = [] } = viz;
    if (nodes.length === 0) return null;

    // Build levels dynamically
    // Map node.id to index and parent references
    const nodeMap = {};
    nodes.forEach(n => {
      nodeMap[n.id] = { ...n, children: [], x: 0, y: 0, level: 0 };
    });

    // Compute tree relationships
    const roots = [];
    nodes.forEach(n => {
      if (n.parentId && nodeMap[n.parentId]) {
        nodeMap[n.parentId].children.push(n.id);
      } else {
        roots.push(n.id);
      }
    });

    // Compute levels (BFS from roots)
    const queue = roots.map(rid => ({ id: rid, level: 0 }));
    let maxLevel = 0;
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      if (nodeMap[id]) {
        nodeMap[id].level = level;
        maxLevel = Math.max(maxLevel, level);
        nodeMap[id].children.forEach(cid => {
          queue.push({ id: cid, level: level + 1 });
        });
      }
    }

    // Grid coordinate planning for tree
    const canvasWidth = 600;
    const canvasHeight = 350;
    const rowHeight = 70;
    
    // Group node mapping lists by levels
    const levelsGroup = Array.from({ length: maxLevel + 1 }, () => []);
    Object.values(nodeMap).forEach(mNode => {
      levelsGroup[mNode.level].push(mNode.id);
    });

    // Layout positions: space evenly at each level
    levelsGroup.forEach((lvlNodeIds, lvl) => {
      const nodeCount = lvlNodeIds.length;
      const step = canvasWidth / (nodeCount + 1);
      lvlNodeIds.forEach((nid, i) => {
        nodeMap[nid].x = step * (i + 1);
        nodeMap[nid].y = 40 + lvl * rowHeight;
      });
    });

    return (
      <div key="recursiontree" style={{ marginBottom: '24px', position: 'relative', width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Recursion Call Tree</h4>
        
        <div style={{
          width: '100%',
          height: `${canvasHeight}px`,
          position: 'relative',
          background: 'rgba(10, 12, 16, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          {/* Render lines first so they are behind circles */}
          {Object.values(nodeMap).map(mNode => {
            if (mNode.parentId && nodeMap[mNode.parentId]) {
              const parent = nodeMap[mNode.parentId];
              return (
                <SVGArrow
                  key={`line-${mNode.id}`}
                  fromX={parent.x}
                  fromY={parent.y}
                  toX={mNode.x}
                  toY={mNode.y}
                />
              );
            }
            return null;
          })}

          {/* Render circular nodes */}
          {Object.values(nodeMap).map(mNode => {
            let borderColor = 'var(--border-subtle)';
            let shadow = 'none';
            let bg = 'var(--bg-surface)';

            if (mNode.state === 'active') {
              borderColor = 'var(--color-accent)';
              shadow = '0 0 12px var(--color-accent-glow)';
              bg = 'rgba(139, 92, 246, 0.15)';
            } else if (mNode.state === 'done') {
              borderColor = 'var(--color-success)';
              bg = 'rgba(16, 185, 129, 0.1)';
            } else if (mNode.state === 'waiting') {
              borderColor = 'var(--color-compare)';
              bg = 'rgba(56, 189, 248, 0.05)';
            }

            return (
              <div
                key={mNode.id}
                className="node-enter"
                style={{
                  position: 'absolute',
                  top: `${mNode.y - 25}px`,
                  left: `${mNode.x - 35}px`,
                  width: '70px',
                  height: '50px',
                  borderRadius: '10px',
                  border: `1px solid ${borderColor}`,
                  boxShadow: shadow,
                  background: bg,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  zIndex: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{mNode.label}</div>
                {mNode.val !== undefined && mNode.val !== null && (
                  <div style={{ color: 'var(--color-success)', fontSize: '10px', marginTop: '2px', fontWeight: 'bold' }}>
                    ret: {mNode.val}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render general outputs
  const renderConsoleLog = (viz) => {
    return (
      <div key="console" style={{ marginBottom: '24px', width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Console Buffer</h4>
        <pre style={{
          background: '#05070a',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#34d399',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: '1.5',
          overflowX: 'auto',
          maxHeight: '150px'
        }}>
          {viz.output}
        </pre>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Explanation banner */}
      {explanation && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(167, 139, 250, 0.08)',
          borderBottom: '1px solid rgba(167, 139, 250, 0.15)',
          fontSize: '13.5px',
          lineHeight: '1.5',
          color: 'var(--text-primary)',
          flexShrink: 0
        }}>
          ℹ️ {explanation}
        </div>
      )}

      {/* Visual Canvas Area */}
      <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
        {visuals.map((viz, idx) => {
          if (viz.type === 'array') return renderArray(viz);
          if (viz.type === 'linked_list') return renderLinkedList(viz);
          if (viz.type === 'recursion_tree') return renderRecursionTree(viz);
          if (viz.type === 'console') return renderConsoleLog(viz);
          return null;
        })}
      </div>

      {/* Variables & Call Stack Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 12, 16, 0.3)',
        maxHeight: '160px',
        flexShrink: 0
      }}>
        {/* Variables Panel */}
        <div style={{ padding: '12px 16px', borderRight: '1px solid var(--border-subtle)', overflowY: 'auto' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            LOCAL VARIABLES
          </span>
          {Object.keys(variables).length === 0 ? (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No variables declared.</span>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <tbody>
                {Object.entries(variables).map(([name, val]) => (
                  <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-compare)', padding: '4px 0', width: '40%' }}>
                      {name}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', padding: '4px 0' }}>
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Call Stack Panel */}
        <div style={{ padding: '12px 16px', overflowY: 'auto' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            CALL STACK
          </span>
          {stack.length === 0 ? (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Global execution scope</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '4px' }}>
              {stack.map((frame, idx) => (
                <div 
                  key={idx}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    background: idx === stack.length - 1 ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-surface)',
                    borderLeft: idx === stack.length - 1 ? '3px solid var(--color-accent)' : '3px solid var(--border-subtle)',
                    padding: '4px 8px',
                    borderRadius: '0 4px 4px 0'
                  }}
                >
                  {frame}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
