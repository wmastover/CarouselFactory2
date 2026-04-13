import { useState, useRef, useEffect } from 'react';

function TypingIndicator() {
  return (
    <span className="ai-typing-indicator" aria-hidden="true">
      <span className="ai-dot" />
      <span className="ai-dot" />
      <span className="ai-dot" />
    </span>
  );
}

function DraggablePhoto({ src }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef(null);
  const wrapRef = useRef(null);
  const imgRef = useRef(null);

  function getClient(e) {
    return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                     : { x: e.clientX, y: e.clientY };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function clampOffset(x, y) {
    if (!wrapRef.current || !imgRef.current) return { x: 0, y };
    const wrap = wrapRef.current.getBoundingClientRect();
    const img  = imgRef.current.getBoundingClientRect();
    const overflowY = Math.max(0, (img.height - wrap.height) / 2);
    return {
      x: 0,
      y: clamp(y, -overflowY, overflowY),
    };
  }

  function onPointerDown(e) {
    e.preventDefault();
    const { x, y } = getClient(e);
    dragOrigin.current = { startX: x, startY: y, offsetX: offset.x, offsetY: offset.y };
    setDragging(true);
  }

  useEffect(() => {
    if (!dragging) return;

    function onMove(e) {
      if (!dragOrigin.current) return;
      const { x, y } = getClient(e);
      const raw = {
        x: dragOrigin.current.offsetX + (x - dragOrigin.current.startX),
        y: dragOrigin.current.offsetY + (y - dragOrigin.current.startY),
      };
      setOffset(clampOffset(raw.x, raw.y));
    }

    function onUp() {
      setDragging(false);
      dragOrigin.current = null;
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);

  return (
    <div
      ref={wrapRef}
      className={`preview-photo-wrap ${dragging ? 'is-dragging' : ''}`}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Entry"
        className="preview-photo"
        style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` }}
        draggable={false}
      />
    </div>
  );
}

function getOffsetInContainer(container, targetNode, targetOffset) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let offset = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node === targetNode) return offset + targetOffset;
    offset += node.textContent.length;
  }
  return -1;
}

function renderWithRedactions(text, fieldId, redactions, onUnredact, redactMode) {
  const ranges = (redactions && redactions[fieldId]) || [];
  if (!ranges.length) return text;

  const parts = [];
  let lastIdx = 0;

  for (let i = 0; i < ranges.length; i++) {
    const start = Math.min(ranges[i].start, text.length);
    const end = Math.min(ranges[i].end, text.length);

    if (start > lastIdx) {
      parts.push(<span key={`t-${lastIdx}`}>{text.slice(lastIdx, start)}</span>);
    }

    if (start < end) {
      const idx = i;
      parts.push(
        <span
          key={`r-${start}`}
          className={redactMode ? 'redacted-text redacted-removable' : 'redacted-text'}
          onClick={redactMode ? (e) => { e.stopPropagation(); onUnredact(fieldId, idx); } : undefined}
          title={redactMode ? 'Click to remove redaction' : undefined}
        >
          {text.slice(start, end)}
        </span>
      );
    }

    lastIdx = end;
  }

  if (lastIdx < text.length) {
    parts.push(<span key={`t-${lastIdx}`}>{text.slice(lastIdx)}</span>);
  }

  return parts;
}

export default function PreviewView({
  title, body, photo, aiResponses, isLoading, aiError,
  redactMode, redactions, onRedact, onUnredact,
}) {
  const latestResponse = aiResponses[aiResponses.length - 1];
  const latestResponseIdx = aiResponses.length - 1;

  function handlePointerUp() {
    if (!redactMode) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const { startContainer, endContainer, startOffset, endOffset } = range;

    function findFieldEl(node) {
      let el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      while (el && !el.dataset?.fieldId) {
        el = el.parentElement;
      }
      return el;
    }

    const startField = findFieldEl(startContainer);
    const endField = findFieldEl(endContainer);

    if (!startField || startField !== endField) return;

    const fieldId = startField.dataset.fieldId;
    if (!fieldId) return;

    const start = getOffsetInContainer(startField, startContainer, startOffset);
    const end = getOffsetInContainer(startField, endContainer, endOffset);

    if (start === -1 || end === -1 || start >= end) return;

    onRedact(fieldId, start, end);
    sel.removeAllRanges();
  }

  return (
    <div
      className={`preview-view${redactMode ? ' preview-view-redact' : ''}`}
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
    >
      {redactMode && (
        <div className="redact-banner no-screenshot">
          <span className="redact-banner-icon">▮</span>
          Select text to redact &mdash; tap redacted text to remove
        </div>
      )}

      {photo && <DraggablePhoto key={photo} src={photo} />}

      <div className="preview-content">
        {title && (
          <>
            <h2 className="preview-title" data-field-id="title">
              {renderWithRedactions(title, 'title', redactions, onUnredact, redactMode)}
            </h2>
            <hr className="preview-divider" />
          </>
        )}

        {body && (
          <p className="preview-body" data-field-id="body">
            {renderWithRedactions(body, 'body', redactions, onUnredact, redactMode)}
          </p>
        )}

        <div className="preview-ai-block" key={aiResponses.length}>
          {aiError ? (
            <p className="preview-ai preview-ai-error">{aiError}</p>
          ) : latestResponse ? (
            latestResponse.split('\n').filter(Boolean).map((para, pIdx) => {
              const fieldId = `ai-${latestResponseIdx}-${pIdx}`;
              return (
                <p className="preview-ai" key={fieldId} data-field-id={fieldId}>
                  {renderWithRedactions(para, fieldId, redactions, onUnredact, redactMode)}
                </p>
              );
            })
          ) : null}

          {isLoading && <TypingIndicator />}
        </div>
      </div>
    </div>
  );
}
