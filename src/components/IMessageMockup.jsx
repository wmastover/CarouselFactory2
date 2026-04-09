import { useState, useEffect, useRef } from 'react';
import StatusBar from './StatusBar';
import { regenerateMessage } from '../lib/textGenApi';


// ── Redaction helpers (mirrors PreviewView) ──────────────────────────────────

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
    const end   = Math.min(ranges[i].end,   text.length);
    if (start > lastIdx) parts.push(<span key={`t-${lastIdx}`}>{text.slice(lastIdx, start)}</span>);
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
  if (lastIdx < text.length) parts.push(<span key={`t-${lastIdx}`}>{text.slice(lastIdx)}</span>);
  return parts;
}

// ── Single bubble row ────────────────────────────────────────────────────────

function BubbleRow({ msg, showTail, redactMode, redactions, onUnredact, onSenderToggle, onTextChange, onDelete, onRegenerate, isRegenerating }) {
  const [editing, setEditing] = useState(false);
  const editRef = useRef(null);
  const isMe    = msg.sender === 'me';
  const fieldId = `msg-${msg.id}`;

  useEffect(() => {
    if (!editing || !editRef.current) return;
    const el = editRef.current;
    el.focus();
    const lastChild = el.lastChild;
    if (lastChild) {
      const range = document.createRange();
      range.setStart(lastChild, lastChild.textContent?.length ?? 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editing]);

  function handleBubbleClick(e) {
    if (redactMode || editing) return;
    e.stopPropagation();
    setEditing(true);
  }

  function handleBlur() {
    const newText = editRef.current?.innerText?.trim();
    if (newText) onTextChange(msg.id, newText);
    setEditing(false);
  }

  function handleKeyDown(e) {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editRef.current?.blur(); }
  }

  const controls = !redactMode && (
    <div className="imessage-bubble-controls no-screenshot">
      <button
        className="imessage-toggle-btn"
        onClick={(e) => { e.stopPropagation(); onSenderToggle(msg.id); }}
        title="Toggle sent / received"
      >
        ⇄
      </button>
      <button
        className="imessage-regen-btn"
        onClick={(e) => { e.stopPropagation(); onRegenerate(msg.id); }}
        title="Regenerate message"
        disabled={isRegenerating}
      >
        ↺
      </button>
      <button
        className="imessage-delete-btn"
        onClick={(e) => { e.stopPropagation(); onDelete(msg.id); }}
        title="Delete message"
      >
        ✕
      </button>
    </div>
  );

  return (
    <div className={`imessage-row ${isMe ? 'imessage-row-me' : 'imessage-row-them'}`}>
      <div className="imessage-bubble-wrapper">
        <div
          className={`imessage-bubble ${isMe ? 'imessage-bubble-me' : 'imessage-bubble-them'}${editing ? ' imessage-bubble-editing' : ''}${isRegenerating ? ' imessage-bubble-regenerating' : ''}`}
          data-field-id={editing ? undefined : fieldId}
          onClick={isRegenerating ? undefined : handleBubbleClick}
        >
          {isRegenerating ? (
            <span className="imessage-regen-spinner" />
          ) : editing ? (
            <span
              ref={editRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={{ outline: 'none', display: 'block', minWidth: '1ch' }}
            >
              {msg.text}
            </span>
          ) : (
            renderWithRedactions(msg.text, fieldId, redactions, onUnredact, redactMode)
          )}
          {showTail && (
            <svg className="imessage-tail" viewBox="0 0 17 21" fill="none">
              <path d="M16.8869 20.1846C11.6869 20.9846 6.55352 18.1212 4.88685 16.2879C6.60472 12.1914 -4.00107 2.24186 2.99893 2.24148C4.61754 2.24148 6 -1.9986 11.8869 1.1846C11.9081 2.47144 11.8869 6.92582 11.8869 7.6842C11.8869 18.1842 17.8869 19.5813 16.8869 20.1846Z" fill="currentColor"/>
            </svg>
          )}
        </div>
        {controls}
      </div>
    </div>
  );
}

// ── Editable contact name ────────────────────────────────────────────────────

function NameField({ name, redactMode, redactions, onUnredact, onNameChange }) {
  const [editing, setEditing] = useState(false);
  const editRef = useRef(null);

  useEffect(() => {
    if (!editing || !editRef.current) return;
    const el = editRef.current;
    el.focus();
    const lastChild = el.lastChild;
    if (lastChild) {
      const range = document.createRange();
      range.setStart(lastChild, lastChild.textContent?.length ?? 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editing]);

  function handleClick(e) {
    if (redactMode || editing) return;
    e.stopPropagation();
    setEditing(true);
  }

  function handleBlur() {
    const newName = editRef.current?.innerText?.trim();
    if (newName) onNameChange(newName);
    setEditing(false);
  }

  function handleKeyDown(e) {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); editRef.current?.blur(); }
  }

  return (
    <div className="imessage-contact-name-row">
      <span
        className={`imessage-contact-name${editing ? ' imessage-name-editing' : ''}`}
        data-field-id={editing ? undefined : 'contact-name'}
        onClick={handleClick}
      >
        {editing ? (
          <span
            ref={editRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{ outline: 'none' }}
          >
            {name}
          </span>
        ) : (
          renderWithRedactions(name, 'contact-name', redactions, onUnredact, redactMode)
        )}
      </span>
      {!editing && (
        <svg className="imessage-name-chevron" width="6" height="10" viewBox="0 0 6 10" fill="none">
          <path d="M1 1l4 4-4 4" stroke="#8e8e93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function IMessageMockup({ messages = [], redactMode, redactions, onRedact, onUnredact }) {
  const [localMessages, setLocalMessages] = useState(() =>
    messages.map((m, i) => ({ ...m, id: i }))
  );
  const [contactName, setContactName] = useState('them');
  const [draft, setDraft] = useState('');
  const [draftSender, setDraftSender] = useState('me');
  const [regeneratingId, setRegeneratingId] = useState(null);
  const nextId = useRef(messages.length);

  useEffect(() => {
    setLocalMessages(messages.map((m, i) => ({ ...m, id: i })));
  }, [messages]);

  function handleTextChange(id, newText) {
    setLocalMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText } : m));
  }

  function handleSenderToggle(id) {
    setLocalMessages(prev =>
      prev.map(m => m.id === id ? { ...m, sender: m.sender === 'me' ? 'them' : 'me' } : m)
    );
  }

  function handleDelete(id) {
    setLocalMessages(prev => prev.filter(m => m.id !== id));
  }

  async function handleRegenerate(id) {
    if (regeneratingId !== null) return;
    setRegeneratingId(id);
    try {
      const idx = localMessages.findIndex(m => m.id === id);
      const newText = await regenerateMessage(localMessages, idx);
      setLocalMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText } : m));
    } catch {
      // silently fail — leave original text intact
    } finally {
      setRegeneratingId(null);
    }
  }

  function handleAddMessage() {
    const text = draft.trim();
    if (!text) return;
    setLocalMessages(prev => [...prev, { id: nextId.current++, text, sender: draftSender }]);
    setDraft('');
  }

  function handleDraftKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddMessage();
    }
  }

  function handlePointerUp() {
    if (!redactMode) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const { startContainer, endContainer, startOffset, endOffset } = range;

    function findFieldEl(node) {
      let el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      while (el && !el.dataset?.fieldId) el = el.parentElement;
      return el;
    }

    const startField = findFieldEl(startContainer);
    const endField   = findFieldEl(endContainer);
    if (!startField || startField !== endField) return;

    const fieldId = startField.dataset.fieldId;
    if (!fieldId) return;

    const start = getOffsetInContainer(startField, startContainer, startOffset);
    const end   = getOffsetInContainer(startField, endContainer,   endOffset);
    if (start === -1 || end === -1 || start >= end) return;

    onRedact(fieldId, start, end);
    sel.removeAllRanges();
  }

  const avatarLetter = contactName.trim()[0]?.toUpperCase() || '?';

  return (
    <div
      className="imessage-phone"
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
    >
      <StatusBar />

      {/* Contact header */}
      <div className="imessage-header">
        <div className="imessage-header-back">
          <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
            <path d="M9.5 1.5L2 9l7.5 7.5" stroke="#007AFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="imessage-header-center">
          <div className="imessage-avatar">
            <span className="imessage-avatar-letter">{avatarLetter}</span>
          </div>
          <NameField
            name={contactName}
            redactMode={redactMode}
            redactions={redactions}
            onUnredact={onUnredact}
            onNameChange={setContactName}
          />
        </div>
        <div className="imessage-header-action">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <rect x="1" y="1" width="13" height="14" rx="2.5" stroke="#007AFF" strokeWidth="1.8"/>
            <path d="M14 5.5l6-3.5v11l-6-3.5" stroke="#007AFF" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Messages */}
      <div className={`imessage-messages${redactMode ? ' imessage-messages-redact' : ''}`}>
        {redactMode && (
          <div className="imessage-redact-banner no-screenshot">
            <span style={{ opacity: 0.7 }}>▮</span> Select text to redact — tap to remove
          </div>
        )}
        <div className="imessage-date-stamp">Today</div>
        {localMessages.map((msg, i) => {
          const next = localMessages[i + 1];
          const showTail = !next || next.sender !== msg.sender;
          return (
            <BubbleRow
              key={msg.id}
              msg={msg}
              showTail={showTail}
              redactMode={redactMode}
              redactions={redactions}
              onUnredact={onUnredact}
              onSenderToggle={handleSenderToggle}
              onTextChange={handleTextChange}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
              isRegenerating={regeneratingId === msg.id}
            />
          );
        })}
      </div>

      {/* Input bar */}
      <div className="imessage-input-bar no-screenshot">
        <button
          className="imessage-sender-toggle-btn"
          onClick={() => setDraftSender(s => s === 'me' ? 'them' : 'me')}
          title={`Sending as: ${draftSender === 'me' ? 'Me (blue)' : 'Them (grey)'}`}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#d1d1d6"/>
            <path d="M18 10v16M10 18h16" stroke="#636366" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="imessage-input-field">
          <input
            className="imessage-input-real"
            type="text"
            placeholder="iMessage"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleDraftKeyDown}
          />
          {draft.trim() ? (
            <button className="imessage-send-btn" onClick={handleAddMessage}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="9" fill="#007AFF"/>
                <path d="M9 13V6M6 9l3-3 3 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <div className="imessage-mic-btn">
              <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                <rect x="4" y="1" width="6" height="10" rx="3" fill="#8e8e93"/>
                <path d="M1 9c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#8e8e93" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                <path d="M7 15v2" stroke="#8e8e93" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Home indicator */}
      <div className="imessage-home-indicator" />
    </div>
  );
}
