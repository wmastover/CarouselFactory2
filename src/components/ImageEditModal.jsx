import { useState, useRef, useEffect, useCallback } from 'react';
import { inpaintImage } from '../lib/imageEditApi';

const BRUSH_SIZES = { small: 10, medium: 24, large: 44 };
const MAX_UNDO = 20;

export default function ImageEditModal({ imageUrl, onAccept, onClose }) {
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState('medium');
  const [prompt, setPrompt] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [hasUndo, setHasUndo] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const abortRef = useRef(null);
  const undoStackRef = useRef([]);

  // Keep refs in sync so event handlers always read latest state
  const brushSizeRef = useRef(brushSize);
  const toolRef = useRef(tool);
  brushSizeRef.current = brushSize;
  toolRef.current = tool;

  // Size canvas whenever it mounts (on open, and again after "Back to mask" re-mounts it)
  useEffect(() => {
    if (showResult) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) {
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      setCanvasReady(true);
    }
  }, [showResult]);

  // Abort in-flight API call on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleUndo = useCallback(() => {
    const stack = undoStackRef.current;
    const canvas = canvasRef.current;
    if (!canvas || stack.length === 0) return;

    const urlToRestore = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    setHasUndo(undoStackRef.current.length > 0);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = urlToRestore;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.key === '[') {
        setBrushSize(s => s === 'large' ? 'medium' : 'small');
        return;
      }
      if (e.key === ']') {
        setBrushSize(s => s === 'small' ? 'medium' : 'large');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, handleUndo]);

  // ── Drawing helpers ─────────────────────────────────────────────

  function saveUndo() {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const dataUrl = canvas.toDataURL();
    undoStackRef.current = [...undoStackRef.current.slice(-(MAX_UNDO - 1)), dataUrl];
    setHasUndo(true);
  }

  function getCanvasPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function applyCtxSettings(ctx) {
    if (toolRef.current === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
    }
  }

  function dot(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function strokeLine(ctx, from, to, r) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(dist / Math.max(1, r / 4)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      dot(ctx, from.x + dx * t, from.y + dy * t, r);
    }
  }

  // ── Pointer event handlers ──────────────────────────────────────

  function onPointerDown(e) {
    if (showResult) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e, canvas);

    saveUndo();
    isDrawingRef.current = true;
    lastPosRef.current = pos;

    applyCtxSettings(ctx);
    dot(ctx, pos.x, pos.y, BRUSH_SIZES[brushSizeRef.current]);
  }

  function onPointerMove(e) {
    if (showResult) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setCursorPos({ x: clientX - rect.left, y: clientY - rect.top });

    if (!isDrawingRef.current) return;
    e.preventDefault();

    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e, canvas);

    applyCtxSettings(ctx);
    if (lastPosRef.current) {
      strokeLine(ctx, lastPosRef.current, pos, BRUSH_SIZES[brushSizeRef.current]);
    }
    lastPosRef.current = pos;
  }

  function onPointerUp() {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }

  function onPointerLeave() {
    isDrawingRef.current = false;
    lastPosRef.current = null;
    setCursorPos(null);
  }

  // ── Actions ─────────────────────────────────────────────────────

  function handleClear() {
    saveUndo();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  async function handleApply() {
    const canvas = canvasRef.current;
    if (!prompt.trim() || !canvas || isApplying) return;

    setIsApplying(true);
    setApplyError(null);

    let annotatedUrl;
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext('2d');

      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
          offCtx.drawImage(canvas, 0, 0);
          resolve();
        };
        img.onerror = reject;
        img.src = imageUrl;
      });

      annotatedUrl = offscreen.toDataURL('image/png');
    } catch {
      setApplyError('Could not prepare image for editing.');
      setIsApplying(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const edited = await inpaintImage(imageUrl, annotatedUrl, prompt.trim(), { signal: controller.signal });
      setResultUrl(edited);
      setShowResult(true);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setApplyError(err.message || 'Edit failed. Try again.');
      }
    } finally {
      setIsApplying(false);
    }
  }

  function handleRetry() {
    setShowResult(false);
    setResultUrl(null);
    setApplyError(null);
    // Defer so state updates commit before handleApply reads canvas
    setTimeout(handleApply, 0);
  }

  function handleAccept() {
    onAccept(resultUrl);
    onClose();
  }

  function handleBackToMask() {
    setShowResult(false);
    setResultUrl(null);
    setApplyError(null);
  }

  const brushDisplayRadius = BRUSH_SIZES[brushSize];

  return (
    <div className="ie-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ie-panel">

        {/* Header */}
        <div className="ie-header">
          <span className="ie-title">Edit Image</span>
          <button className="ie-close" onClick={onClose} title="Close (Esc)">✕</button>
        </div>

        {/* Main: canvas + sidebar */}
        <div className="ie-main">

          {/* Canvas area */}
          <div className="ie-canvas-area">
            <div
              ref={containerRef}
              className="ie-canvas-container"
              style={{ cursor: showResult ? 'default' : 'none' }}
            >
              <img
                src={showResult ? resultUrl : imageUrl}
                alt="Edit"
                className="ie-canvas-img"
                draggable={false}
              />

              {!showResult && (
                <canvas
                  ref={canvasRef}
                  className="ie-canvas"
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={onPointerLeave}
                  onTouchStart={onPointerDown}
                  onTouchMove={onPointerMove}
                  onTouchEnd={onPointerUp}
                />
              )}

              {/* Custom brush cursor */}
              {!showResult && cursorPos && canvasReady && (
                <div
                  className={`ie-cursor${tool === 'eraser' ? ' ie-cursor-eraser' : ''}`}
                  style={{
                    left: cursorPos.x,
                    top: cursorPos.y,
                    width: brushDisplayRadius * 2,
                    height: brushDisplayRadius * 2,
                  }}
                />
              )}

              {/* Loading overlay */}
              {isApplying && (
                <div className="ie-loading-overlay">
                  <div className="ie-loading-spinner" />
                  <span className="ie-loading-text">Applying edit…</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — hidden when viewing result */}
          {!showResult && (
            <div className="ie-sidebar">
              <div className="ie-sidebar-section">
                <span className="ie-sidebar-label">Tool</span>
                <div className="ie-tool-group">
                  <button
                    className={`ie-tool-btn${tool === 'brush' ? ' ie-tool-btn-active' : ''}`}
                    onClick={() => setTool('brush')}
                    title="Paint brush"
                  >
                    Paint
                  </button>
                  <button
                    className={`ie-tool-btn${tool === 'eraser' ? ' ie-tool-btn-active' : ''}`}
                    onClick={() => setTool('eraser')}
                    title="Erase painted areas"
                  >
                    Erase
                  </button>
                </div>
              </div>

              <div className="ie-sidebar-section">
                <span className="ie-sidebar-label">Brush size</span>
                <div className="ie-brush-sizes">
                  {['small', 'medium', 'large'].map((s) => (
                    <button
                      key={s}
                      className={`ie-size-btn${brushSize === s ? ' ie-size-btn-active' : ''}`}
                      onClick={() => setBrushSize(s)}
                      title={s}
                    >
                      <span className={`ie-size-dot ie-size-dot-${s}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="ie-sidebar-section">
                <button
                  className="ie-action-btn"
                  onClick={handleUndo}
                  disabled={!hasUndo}
                  title="Undo (⌘Z)"
                >
                  ↩ Undo
                </button>
                <button
                  className="ie-action-btn ie-action-btn-clear"
                  onClick={handleClear}
                  title="Clear all mask"
                >
                  ✕ Clear
                </button>
              </div>

              <div className="ie-sidebar-hint">
                <p>Paint the areas you want to change</p>
                <p>[ / ] to resize brush</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ie-footer">
          {!showResult ? (
            <>
              <div className="ie-prompt-row">
                <input
                  className="ie-prompt-input"
                  type="text"
                  placeholder="Describe the change in the painted area…"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isApplying) handleApply(); }}
                  disabled={isApplying}
                  autoFocus
                />
                <button
                  className="ie-apply-btn"
                  onClick={handleApply}
                  disabled={isApplying || !prompt.trim()}
                >
                  {isApplying ? 'Applying…' : 'Apply'}
                </button>
              </div>
              {applyError && <p className="ie-error-text">{applyError}</p>}
            </>
          ) : (
            <div className="ie-result-actions">
              <button className="ie-result-btn ie-result-btn-ghost" onClick={handleBackToMask}>
                ← Back to mask
              </button>
              <button
                className="ie-result-btn ie-result-btn-ghost"
                onClick={handleRetry}
                disabled={isApplying}
              >
                {isApplying ? 'Applying…' : '↺ Try again'}
              </button>
              <button className="ie-result-btn ie-result-btn-primary" onClick={handleAccept}>
                ✓ Accept edit
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
