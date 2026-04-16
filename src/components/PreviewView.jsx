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

/** Tap to edit; same typography as read-only (iMessage-style contentEditable). */
function ClickToEditText({ tag, className, value, onCommit, multiline }) {
  const Tag = tag;
  const [editing, setEditing] = useState(false);
  const editRef = useRef(null);

  useEffect(() => {
    if (!editing || !editRef.current) return;
    const el = editRef.current;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, [editing]);

  function handleStart(e) {
    e.stopPropagation();
    setEditing(true);
  }

  function handleBlur() {
    let raw = editRef.current?.innerText ?? '';
    if (!multiline) raw = raw.trim();
    else raw = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    onCommit?.(raw);
    setEditing(false);
  }

  function handleKeyDown(e) {
    e.stopPropagation();
    if (e.key === 'Enter' && (!multiline || !e.shiftKey)) {
      e.preventDefault();
      editRef.current?.blur();
    }
  }

  if (editing) {
    return (
      <Tag className={`${className} preview-field-editing`}>
        <span
          ref={editRef}
          className="preview-editable-inner"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(ev) => ev.stopPropagation()}
          style={{
            outline: 'none',
            display: 'block',
            minWidth: '1ch',
            whiteSpace: multiline ? 'pre-wrap' : 'normal',
          }}
        >
          {value}
        </span>
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      onClick={handleStart}
      style={{ cursor: 'text' }}
      title="Tap to edit"
    >
      {value || '\u00a0'}
    </Tag>
  );
}

export default function PreviewView({
  title, body, photo, aiResponses, isLoading, aiError,
  redactMode, redactions, onRedact, onUnredact,
  onTitleChange, onBodyChange, onLatestAiChange,
}) {
  const latestResponse = aiResponses[aiResponses.length - 1];
  const latestResponseIdx = aiResponses.length - 1;
  const allowEdit = aiResponses.length > 0 && !redactMode;

  function commitAiParagraph(displayIdx, newText) {
    const chunks = (latestResponse ?? '').split('\n');
    const nonEmptyLineIndices = chunks
      .map((c, i) => (c.length > 0 ? i : -1))
      .filter((i) => i >= 0);
    const lineIndex = nonEmptyLineIndices[displayIdx];
    if (lineIndex === undefined) {
      onLatestAiChange?.(newText);
      return;
    }
    const next = [...chunks];
    next[lineIndex] = newText;
    onLatestAiChange?.(next.join('\n'));
  }

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
          <span className="redact-banner-icon">&#9646;</span>
          Select text to redact &mdash; tap redacted text to remove
        </div>
      )}

      {photo && <DraggablePhoto key={photo} src={photo} />}

      <div className="preview-content">
        {allowEdit ? (
          <>
            {title ? (
              <>
                <ClickToEditText
                  tag="h2"
                  className="preview-title"
                  value={title}
                  onCommit={onTitleChange}
                  multiline={false}
                />
                <hr className="preview-divider" />
              </>
            ) : null}
            <ClickToEditText
              tag="p"
              className="preview-body"
              value={body}
              onCommit={onBodyChange}
              multiline
            />
            <div className="preview-ai-block">
              {aiError ? (
                <p className="preview-ai preview-ai-error">{aiError}</p>
              ) : latestResponse ? (
                latestResponse.split('\n').filter(Boolean).map((para, pIdx) => (
                  <ClickToEditText
                    key={`ai-edit-${latestResponseIdx}-${pIdx}`}
                    tag="p"
                    className="preview-ai"
                    value={para}
                    onCommit={(t) => commitAiParagraph(pIdx, t)}
                    multiline={false}
                  />
                ))
              ) : null}
              {isLoading && <TypingIndicator />}
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
