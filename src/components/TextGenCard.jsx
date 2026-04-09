import { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { generateConversation } from '../lib/textGenApi';
import { generateTextMetaPrompt } from '../lib/promptGen';
import IMessageMockup from './IMessageMockup';
import { Button } from './ui/button';

function mergeRanges(ranges) {
  if (!ranges.length) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const result = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      result.push({ ...sorted[i] });
    }
  }
  return result;
}

export default function TextGenCard({ onSelect, isSelected, textPromptConfig }) {
  const [messages, setMessages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redactMode, setRedactMode] = useState(false);
  const [redactions, setRedactions] = useState({});
  const cardRef = useRef(null);

  // Use a ref so generate() always picks up the latest config without re-triggering useEffect
  const textPromptConfigRef = useRef(textPromptConfig);
  textPromptConfigRef.current = textPromptConfig;

  const generate = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);
    setMessages(null);
    setRedactMode(false);
    setRedactions({});
    try {
      const prompt = generateTextMetaPrompt(textPromptConfigRef.current);
      const msgs = await generateConversation(prompt, { signal });
      setMessages(msgs);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    generate(controller.signal);
    return () => controller.abort();
  }, [generate]);

  function handleRedact(fieldId, start, end) {
    setRedactions((prev) => {
      const existing = prev[fieldId] || [];
      return { ...prev, [fieldId]: mergeRanges([...existing, { start, end }]) };
    });
  }

  function handleUnredact(fieldId, rangeIdx) {
    setRedactions((prev) => {
      const existing = [...(prev[fieldId] || [])];
      existing.splice(rangeIdx, 1);
      return { ...prev, [fieldId]: existing };
    });
  }

  async function handleClick() {
    if (!messages || isLoading || !cardRef.current) return;
    try {
      const filter = (node) => !node.classList?.contains('no-screenshot');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, filter });
      onSelect(dataUrl, messages);
    } catch {
      onSelect(null, messages);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`gen-card gen-card-clickable ${isSelected ? 'gen-card-selected' : ''}`}
        onClick={handleClick}
        ref={cardRef}
        title={messages ? 'Click to use in your entry' : undefined}
      >
        {isLoading && (
          <div className="gen-card-skeleton">
            <div className="gen-card-spinner" />
          </div>
        )}
        {error && !isLoading && (
          <div className="gen-card-error">
            <span>{error}</span>
          </div>
        )}
        {messages && !isLoading && (
          <IMessageMockup
            messages={messages}
            redactMode={redactMode}
            redactions={redactions}
            onRedact={handleRedact}
            onUnredact={handleUnredact}
          />
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); generate(); }}
          disabled={isLoading}
        >
          ↺ Regenerate
        </Button>
        {messages && !isLoading && (
          <Button
            variant={redactMode ? 'active' : 'outline'}
            size="sm"
            onClick={(e) => { e.stopPropagation(); setRedactMode(m => !m); }}
          >
            {redactMode ? '✓ Done' : '▮ Redact'}
          </Button>
        )}
      </div>
    </div>
  );
}
