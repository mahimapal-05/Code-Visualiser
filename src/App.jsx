import React, { useState, useEffect, useRef } from 'react';
import CodeEditor from './components/CodeEditor';
import VisualizerCanvas from './components/VisualizerCanvas';

const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';

export default function App() {
  // App Environment Configuration
  const [hasGroqKey, setHasGroqKey] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('Checking backend status...');
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, healthy, offline

  // Code & Language State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');

  // Execution States
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  
  // Console log outputs
  const [consoleOutput, setConsoleOutput] = useState({ stdout: '', stderr: '', exit_code: null });
  const [activeTab, setActiveTab] = useState('visualizer'); // visualizer, console

  // Trace Player playback
  const [trace, setTrace] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // speed in ms
  const playTimerRef = useRef(null);

  // Coach Chat drawer
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: "Hi! I am your Agentic AI Programming Coach. Ask me how this code runs or how to visualize specific steps!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, compiled, error
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [breakpoints, setBreakpoints] = useState([]);
  const chatEndRef = useRef(null);

  // 1. Fetch Health Status and check Share URL parameters on Mount
  useEffect(() => {
    fetchHealthStatus();

    // Parse URL share parameters
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('code');
    const sharedLang = params.get('lang');
    if (sharedCode) {
      try {
        setCode(decodeURIComponent(sharedCode));
      } catch (e) {
        setCode(sharedCode);
      }
    }
    if (sharedLang) {
      setLanguage(sharedLang);
    }
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setHasGroqKey(data.has_groq_key);
        setConnectionStatus('healthy');
        setConnectionMessage(data.message);
      } else {
        setConnectionStatus('offline');
        setConnectionMessage('Failed to communicate with visualizer backend.');
      }
    } catch (e) {
      setConnectionStatus('offline');
      setConnectionMessage('Backend offline. Run npm run dev-all to start.');
    }
  };

  // Debounced Live Auto-Visualization Compile trigger
  useEffect(() => {
    if (!code || !code.trim()) {
      setSyncStatus('idle');
      return;
    }
    
    setSyncStatus('syncing');
    const delayDebounceFn = setTimeout(() => {
      triggerLiveVisualization();
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [code, language]);

  const triggerLiveVisualization = async () => {
    if (isRunning || isCompiling) return;
    try {
      const res = await fetch(`${API_BASE}/api/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.trace) {
          setTrace(data.trace);
          setIsSimulationMode(true);
          setSyncStatus('compiled');
          setConsoleOutput({
            stdout: data.stdout || '(no stdout output)',
            stderr: data.stderr || '',
            exit_code: data.success ? 0 : -1
          });
        } else {
          setSyncStatus('error');
          setConsoleOutput({
            stdout: data.stdout || '',
            stderr: data.stderr || 'Syntax error during execution compilation.',
            exit_code: -1
          });
        }
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      setSyncStatus('error');
    }
  };

  // 2. Playback player auto-advancer with Breakpoints check
  useEffect(() => {
    if (isPlaying && trace && trace.steps) {
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < trace.steps.length - 1) {
            const nextIdx = prev + 1;
            const nextStep = trace.steps[nextIdx];
            if (nextStep && breakpoints.includes(nextStep.line)) {
              setIsPlaying(false); // Pause on breakpoint
              clearInterval(playTimerRef.current);
            }
            return nextIdx;
          } else {
            setIsPlaying(false); // Stop playing at end
            clearInterval(playTimerRef.current);
            return prev;
          }
        });
      }, playbackSpeed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, trace, playbackSpeed, breakpoints]);

  // Voice AI Tutor Narration Effect
  useEffect(() => {
    if (isVoiceEnabled && trace && trace.steps && trace.steps[currentStepIndex]) {
      const explanation = trace.steps[currentStepIndex].explanation;
      if (explanation && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(explanation);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentStepIndex, isVoiceEnabled, trace]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tagName = e.target.tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (trace && trace.steps && currentStepIndex < trace.steps.length - 1) {
          setIsPlaying(false);
          setCurrentStepIndex(prev => prev + 1);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (trace && trace.steps && currentStepIndex > 0) {
          setIsPlaying(false);
          setCurrentStepIndex(prev => prev - 1);
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStepIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trace, currentStepIndex]);

  const handleToggleBreakpoint = (line) => {
    setBreakpoints(prev => 
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    );
  };

  const handleShareCode = () => {
    const url = `${window.location.origin}${window.location.pathname}?lang=${encodeURIComponent(language)}&code=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    alert('🔗 Shareable link copied to clipboard!');
  };

  // Autoscroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // 3. Execution handlers
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('console');
    setConsoleOutput({ stdout: 'Executing...', stderr: '', exit_code: null });

    try {
      const res = await fetch(`${API_BASE}/api/run-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      if (res.ok) {
        const data = await res.json();
        setConsoleOutput({
          stdout: data.stdout || '(no stdout output)',
          stderr: data.stderr || '',
          exit_code: data.exit_code
        });
      } else {
        const err = await res.json();
        setConsoleOutput({ stdout: '', stderr: err.detail || 'Execution request failed', exit_code: -1 });
      }
    } catch (e) {
      setConsoleOutput({ stdout: '', stderr: `Failed to connect to runner: ${e.message}`, exit_code: -1 });
    } finally {
      setIsRunning(false);
    }
  };

  const handleVisualizeCode = async () => {
    setIsCompiling(true);
    setIsPlaying(false);
    setActiveTab('visualizer');
    setSyncStatus('syncing');

    try {
      const res = await fetch(`${API_BASE}/api/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.trace) {
          setTrace(data.trace);
          setCurrentStepIndex(0);
          setIsSimulationMode(true);
          setSyncStatus('compiled');
          setConsoleOutput({
            stdout: data.stdout || '',
            stderr: data.stderr || '',
            exit_code: data.success ? 0 : -1
          });
        } else {
          setSyncStatus('error');
          setConsoleOutput({
            stdout: data.stdout || '',
            stderr: data.stderr || 'Syntax compile error',
            exit_code: -1
          });
          setActiveTab('console');
        }
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      setSyncStatus('error');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const activeHistory = chatHistory.map(h => ({ role: h.role, content: h.content }));
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          message: userMsg,
          history: activeHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error answering your question.' }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Connection timed out.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Player utility triggers
  const handlePlayPause = () => {
    if (!trace || !trace.steps) return;
    setIsPlaying(!isPlaying);
  };

  const handleNextStep = () => {
    if (!trace || !trace.steps) return;
    setIsPlaying(false);
    if (currentStepIndex < trace.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (!trace || !trace.steps) return;
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const currentStep = (trace && trace.steps && trace.steps[currentStepIndex]) || null;
  const totalSteps = (trace && trace.steps && trace.steps.length) || 0;

  return (
    <div className="app-container">
      {/* App Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10, 12, 16, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🛸</span>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Antigravity Visual Code Playground
          </h1>
        </div>

        {/* Connection status badge and Header Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setIsVoiceEnabled(prev => !prev)}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isVoiceEnabled ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              borderColor: isVoiceEnabled ? 'var(--color-success)' : 'var(--border-subtle)'
            }}
          >
            <span>{isVoiceEnabled ? '🔊' : '🔇'}</span> Voice Tutor: {isVoiceEnabled ? 'ON' : 'OFF'}
          </button>

          <button 
            onClick={handleShareCode}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔗</span> Share Link
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: connectionStatus === 'healthy' ? (hasGroqKey ? '#10b981' : '#f59e0b') : '#ef4444',
              boxShadow: connectionStatus === 'healthy' 
                ? (hasGroqKey ? '0 0 8px rgba(16, 185, 129, 0.6)' : '0 0 8px rgba(245, 158, 11, 0.6)') 
                : '0 0 8px rgba(239, 68, 68, 0.6)'
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {connectionMessage}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="workspace-grid">
        {/* Left Side: Code Editor */}
        <div style={{ height: '100%', overflow: 'hidden' }}>
          <CodeEditor 
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            onRun={handleRunCode}
            onVisualize={handleVisualizeCode}
            isRunning={isRunning}
            isCompiling={isCompiling}
            activeLine={currentStep ? currentStep.line : 0}
            syncStatus={syncStatus}
            isSimulationMode={isSimulationMode}
            setIsSimulationMode={setIsSimulationMode}
            breakpoints={breakpoints}
            onToggleBreakpoint={handleToggleBreakpoint}
          />
        </div>

        {/* Center: Visual Output Box */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            background: 'rgba(10, 12, 16, 0.4)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '8px 16px 0 16px',
            gap: '12px',
            flexShrink: 0
          }}>
            <button
              onClick={() => setActiveTab('visualizer')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'visualizer' ? '2px solid var(--color-accent)' : '2px solid transparent',
                color: activeTab === 'visualizer' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              👁️ Step Visualizer
            </button>
            <button
              onClick={() => setActiveTab('console')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'console' ? '2px solid var(--color-accent)' : '2px solid transparent',
                color: activeTab === 'console' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              🐚 Raw Console Output
            </button>

            {trace && trace.metadata && activeTab === 'visualizer' && (
              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.03)',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '8px'
              }}>
                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{trace.metadata.algorithm_name}</span>
                <span>•</span>
                <span>Time: {trace.metadata.time_complexity}</span>
                <span>•</span>
                <span>Space: {trace.metadata.space_complexity}</span>
              </div>
            )}
          </div>

          {/* Active Tab Screen */}
          <div style={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
            {activeTab === 'visualizer' ? (
              <VisualizerCanvas stepData={currentStep} />
            ) : (
              <div style={{ padding: '24px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Standard Output (stdout)</h4>
                  <pre style={{
                    background: '#05070a',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    overflowX: 'auto',
                    minHeight: '80px'
                  }}>{consoleOutput.stdout || '[No output printed]'}</pre>
                </div>

                {consoleOutput.stderr && (
                  <div>
                    <h4 style={{ color: 'var(--color-error)', fontSize: '13px', marginBottom: '8px' }}>Standard Error (stderr)</h4>
                    <pre style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      padding: '16px',
                      color: 'var(--color-error)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      overflowX: 'auto'
                    }}>{consoleOutput.stderr}</pre>
                  </div>
                )}

                {consoleOutput.exit_code !== null && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Process exited with code: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{consoleOutput.exit_code}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Visual Step Player Controls (Bottom of center panel) */}
          {activeTab === 'visualizer' && totalSteps > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(10, 12, 16, 0.5)',
              gap: '12px',
              flexShrink: 0
            }}>
              {/* Slider timeline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '30px' }}>
                  {currentStepIndex + 1}/{totalSteps}
                </span>
                <input 
                  type="range"
                  min="0"
                  max={totalSteps - 1}
                  value={currentStepIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentStepIndex(parseInt(e.target.value));
                  }}
                  style={{
                    flexGrow: 1,
                    height: '4px',
                    background: 'var(--border-subtle)',
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer',
                    accentColor: 'var(--color-accent)'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleReset} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                    ⏮️ Reset
                  </button>
                  <button onClick={handlePrevStep} disabled={currentStepIndex === 0} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                    ◀️ Back
                  </button>
                  <button 
                    onClick={handlePlayPause} 
                    className="btn-primary" 
                    style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </button>
                  <button onClick={handleNextStep} disabled={currentStepIndex === totalSteps - 1} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                    Next ▶️
                  </button>
                </div>

                {/* Speed Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Interval:</span>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                    style={{ width: '80px', height: '4px', accentColor: 'var(--color-accent)' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '45px', textAlign: 'right' }}>
                    {playbackSpeed}ms
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Panel: Coach Chat / RAG Explainer */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(10, 12, 16, 0.4)',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-accent)' }}>🤖 AI COACH (RAG)</span>
          </div>

          {/* Chat scrolling log */}
          <div style={{ flexGrow: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.role === 'user' ? 'var(--bg-surface)' : 'rgba(167,139,250,0.06)',
                  border: msg.role === 'user' ? '1px solid var(--border-subtle)' : '1px solid rgba(167,139,250,0.1)',
                  borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  padding: '10px 14px',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>

                {/* Retrieved Sources list */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.05)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    📚 Retrived: {msg.sources.join(', ')}
                  </div>
                )}
              </div>
            ))}
            
            {isChatLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(167,139,250,0.06)',
                border: '1px solid rgba(167,139,250,0.1)',
                borderRadius: '12px 12px 12px 0',
                padding: '10px 14px',
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}>
                Typing explanation...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input field */}
          <form 
            onSubmit={handleSendChatMessage}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(10, 12, 16, 0.4)',
              display: 'flex',
              gap: '8px',
              flexShrink: 0
            }}
          >
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={hasGroqKey ? "Ask about stack or variable steps..." : "RAG Chat is offline"}
              disabled={isChatLoading || !hasGroqKey}
              style={{
                flexGrow: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13px'
              }}
            />
            <button 
              type="submit"
              disabled={isChatLoading || !hasGroqKey || !chatInput.trim()}
              className="btn-primary"
              style={{
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px'
              }}
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
