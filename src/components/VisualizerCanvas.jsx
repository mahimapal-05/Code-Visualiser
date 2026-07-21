import React, { useEffect, useRef } from 'react';

// Custom hook to track previous variables for flashing changes
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// Helpers to render arrows/links
function SVGArrow({ fromX, fromY, toX, toY }) {
  const headLength = 10;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  
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
  const prevVariables = usePrevious(stepData?.variables) || {};

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
                <div style={style}>
                  {el.value}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{idx}</span>
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

    const nodeMap = {};
    nodes.forEach(n => {
      nodeMap[n.id] = { ...n, children: [], x: 0, y: 0, level: 0 };
    });

    const roots = [];
    nodes.forEach(n => {
      if (n.parentId && nodeMap[n.parentId]) {
        nodeMap[n.parentId].children.push(n.id);
      } else {
        roots.push(n.id);
      }
    });

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

    const canvasWidth = 600;
    const canvasHeight = 350;
    const rowHeight = 70;
    
    const levelsGroup = Array.from({ length: maxLevel + 1 }, () => []);
    Object.values(nodeMap).forEach(mNode => {
      levelsGroup[mNode.level].push(mNode.id);
    });

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

  // Render Grid / Matrix Traversals
  const renderGrid = (viz) => {
    const { rows = 1, cols = 1, cells = [], name = "grid" } = viz;
    
    const gridMap = {};
    cells.forEach(cell => {
      gridMap[`${cell.r},${cell.c}`] = cell;
    });

    const gridItems = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = gridMap[`${r},${c}`] || { value: '', state: 'unvisited' };
        gridItems.push({ r, c, ...cell });
      }
    }

    return (
      <div key={viz.name || 'grid'} style={{ marginBottom: '24px', width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Grid Matrix: {name}</h4>
        
        <div 
          className="grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 32px)`,
            gridTemplateRows: `repeat(${rows}, 32px)`
          }}
        >
          {gridItems.map((cell, idx) => {
            let stateClass = "grid-cell-unvisited";
            if (cell.state === 'visiting') stateClass = "grid-cell-visiting";
            else if (cell.state === 'visited') stateClass = "grid-cell-visited";
            else if (cell.state === 'path') stateClass = "grid-cell-path";

            return (
              <div 
                key={`${cell.r}-${cell.c}-${idx}`}
                className={`grid-cell ${stateClass} node-enter`}
                title={`(${cell.r}, ${cell.c})`}
              >
                {cell.value}
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

  // Render general scalar variables as floating cards
  const renderVariables = (viz) => {
    const { vars = [] } = viz;
    return (
      <div key="variables-canvas" style={{ marginBottom: '24px', width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>State Variables</h4>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '10px 0' }}>
          {vars.map((v, idx) => {
            let borderColor = 'var(--border-subtle)';
            let glow = 'none';
            let bg = 'rgba(255, 255, 255, 0.02)';

            if (v.state === 'checking') {
              borderColor = 'var(--color-compare)';
              glow = '0 0 10px var(--color-compare-glow)';
              bg = 'rgba(56, 189, 248, 0.05)';
            } else if (v.state === 'updated') {
              borderColor = 'var(--color-swap)';
              glow = '0 0 12px var(--color-swap-glow)';
              bg = 'rgba(236, 72, 153, 0.05)';
            }

            return (
              <div 
                key={`${v.name}-${v.value}-${idx}`}
                className="node-enter"
                style={{
                  minWidth: '110px',
                  height: '75px',
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  boxShadow: glow,
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: v.state === 'checking' ? 'var(--color-compare)' : (v.state === 'updated' ? 'var(--color-swap)' : 'var(--text-secondary)'),
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {v.name}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  textAlign: 'right',
                  lineHeight: '1.2'
                }}>
                  {typeof v.value === 'object' ? JSON.stringify(v.value) : String(v.value)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Stack & Queue Container
  const renderStackQueue = (viz) => {
    const { variant = 'stack', name = 'container', items = [] } = viz;
    const isStack = variant === 'stack';

    return (
      <div key={name} style={{ marginBottom: '24px', width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
          {isStack ? '🪣 Stack Bucket' : '🚇 Queue Tube'}: {name}
        </h4>
        
        <div style={{
          display: 'flex',
          flexDirection: isStack ? 'column-reverse' : 'row',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          background: 'rgba(10, 12, 16, 0.4)',
          border: isStack ? '2px solid var(--border-subtle)' : '2px dashed var(--border-subtle)',
          borderTop: isStack ? 'none' : '2px dashed var(--border-subtle)',
          borderRadius: isStack ? '0 0 12px 12px' : '12px',
          maxWidth: isStack ? '180px' : '100%',
          minHeight: isStack ? '160px' : '70px',
          overflowX: isStack ? 'hidden' : 'auto',
          justifyContent: isStack ? 'flex-start' : 'flex-start'
        }}>
          {items.length === 0 ? (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 'auto' }}>Empty</span>
          ) : (
            items.map((item, idx) => {
              let border = '1px solid var(--border-subtle)';
              let bg = 'var(--bg-surface)';
              let glow = 'none';

              if (item.state === 'pushing') {
                border = '2px solid var(--color-success)';
                bg = 'rgba(16, 185, 129, 0.15)';
                glow = '0 0 10px rgba(16, 185, 129, 0.4)';
              } else if (item.state === 'popping') {
                border = '2px solid var(--color-swap)';
                bg = 'rgba(236, 72, 153, 0.15)';
                glow = '0 0 10px rgba(236, 72, 153, 0.4)';
              } else if (item.state === 'top' || idx === items.length - 1) {
                border = '2px solid var(--color-accent)';
                bg = 'rgba(139, 92, 246, 0.15)';
              }

              return (
                <div 
                  key={item.id || idx}
                  className="node-enter"
                  style={{
                    width: isStack ? '140px' : '55px',
                    height: '45px',
                    borderRadius: '8px',
                    border,
                    background: bg,
                    boxShadow: glow,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.value}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
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

      <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
        {visuals.map((viz, idx) => {
          if (viz.type === 'array') return renderArray(viz);
          if (viz.type === 'linked_list') return renderLinkedList(viz);
          if (viz.type === 'recursion_tree') return renderRecursionTree(viz);
          if (viz.type === 'grid') return renderGrid(viz);
          if (viz.type === 'variables') return renderVariables(viz);
          if (viz.type === 'stack_queue') return renderStackQueue(viz);
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
                {Object.entries(variables).map(([name, val]) => {
                  const hasChanged = prevVariables[name] !== undefined && prevVariables[name] !== val;
                  // Key is name + stringified value to force recreation and trigger CSS flash
                  return (
                    <tr 
                      key={`${name}-${JSON.stringify(val)}`} 
                      className={hasChanged ? "flash-update" : ""}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-compare)', padding: '4px 0', width: '40%' }}>
                        {name}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', padding: '4px 0' }}>
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    </tr>
                  );
                })}
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
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Global scope</span>
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
