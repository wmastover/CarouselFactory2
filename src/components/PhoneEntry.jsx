import { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import Header from './Header';
import StatusBar from './StatusBar';
import BottomBar from './BottomBar';
import PreviewView from './PreviewView';
import { getAIResponse } from '../lib/openrouter';
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

async function urlToDataUrl(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

export default function PhoneEntry({ seed }) {
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [aiResponses, setAiResponses] = useState([]);
  const [conversationText, setConversationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [redactMode, setRedactMode] = useState(false);
  const [redactions, setRedactions] = useState({});
  const [downloading, setDownloading] = useState(false);
  const appRef = useRef(null);

  // Preload seed image as data URL for screenshot compatibility
  useEffect(() => {
    if (!seed.imageUrl) return;
    let cancelled = false;
    urlToDataUrl(seed.imageUrl).then((dataUrl) => {
      if (!cancelled) setImageDataUrl(dataUrl);
    });
    return () => { cancelled = true; };
  }, [seed.imageUrl]);

  const callAI = useCallback(async (text) => {
    setIsLoading(true);
    setAiError(null);
    try {
      const response = await getAIResponse(text);
      setAiResponses((prev) => [...prev, response]);
      setConversationText(text + `\n\nAssistant: ${response}`);
    } catch (err) {
      setAiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-generate on mount
  useEffect(() => {
    const entryText = [seed.title && `Title: ${seed.title}`, seed.body]
      .filter(Boolean)
      .join('\n');
    const initialText = `User: ${entryText}`;
    setConversationText(initialText);
    callAI(initialText);
  }, []);

  function handleGoDeeper() {
    if (isLoading || aiResponses.length === 0) return;
    callAI(conversationText);
  }

  function handleRegenerate() {
    const entryText = [seed.title && `Title: ${seed.title}`, seed.body]
      .filter(Boolean)
      .join('\n');
    const initialText = `User: ${entryText}`;
    setAiResponses([]);
    setConversationText(initialText);
    setAiError(null);
    setRedactions({});
    callAI(initialText);
  }

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

  async function handleDownload() {
    if (!appRef.current) return;
    setDownloading(true);
    const filter = (node) => !node.classList?.contains('no-screenshot');
    try {
      await toPng(appRef.current, { pixelRatio: 3, filter });
      const dataUrl = await toPng(appRef.current, { pixelRatio: 3, filter });
      const link = document.createElement('a');
      link.download = `entries-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="phone-frame">
        <div className="app" ref={appRef}>
          <StatusBar />
          <Header />
          <main className="app-main">
            <PreviewView
              title={seed.title}
              body={seed.body}
              photo={imageDataUrl || seed.imageUrl}
              aiResponses={aiResponses}
              isLoading={isLoading}
              aiError={aiError}
              redactMode={redactMode}
              redactions={redactions}
              onRedact={handleRedact}
              onUnredact={handleUnredact}
            />
          </main>
          <BottomBar
            onGoDeeper={handleGoDeeper}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={isLoading}
        >
          ↺ Regenerate
        </Button>
        <Button
          variant={redactMode ? 'active' : 'outline'}
          size="sm"
          onClick={() => setRedactMode((m) => !m)}
        >
          {redactMode ? '✓ Done' : '▮ Redact'}
        </Button>
        <Button
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Saving…' : '↓ Save'}
        </Button>
      </div>
    </div>
  );
}
