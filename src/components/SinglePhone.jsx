import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toPng } from 'html-to-image';
import Header from './Header';
import StatusBar from './StatusBar';
import BottomBar from './BottomBar';
import ComposeView from './ComposeView';
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

/**
 * A single interactive phone mockup with compose → preview flow.
 * @param {{ injectedPhoto: string|null, injectedTitle: string|null, injectedBody: string|null, onModeChange: function }} props
 */
const SinglePhone = forwardRef(function SinglePhone({ injectedPhoto, injectedTitle, injectedBody, onModeChange }, ref) {
  const [mode, setMode] = useState('compose');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photo, setPhoto] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [aiResponses, setAiResponses] = useState([]);
  const [conversationText, setConversationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [redactMode, setRedactMode] = useState(false);
  const [redactions, setRedactions] = useState({});
  const appRef = useRef(null);

  useImperativeHandle(ref, () => ({
    async captureScreenshot() {
      if (!appRef.current) return null;
      const filter = (node) => !node.classList?.contains('no-screenshot');
      await toPng(appRef.current, { pixelRatio: 3, filter });
      return toPng(appRef.current, { pixelRatio: 3, filter });
    },
    isReady() {
      return mode === 'preview' && aiResponses.length > 0;
    },
  }), [mode, aiResponses]);

  // Notify parent when preview readiness changes
  useEffect(() => {
    onModeChange?.(mode, aiResponses.length > 0);
  }, [mode, aiResponses.length, onModeChange]);

  // When a text card is selected outside, inject its screenshot as the photo
  useEffect(() => {
    if (injectedPhoto) {
      setPhoto(injectedPhoto);
      setMode('compose');
    }
  }, [injectedPhoto]);

  // When a suggestion is selected, inject the title and body
  useEffect(() => {
    if (injectedTitle != null) setTitle(injectedTitle);
  }, [injectedTitle]);

  useEffect(() => {
    if (injectedBody != null) setBody(injectedBody);
  }, [injectedBody]);

  const callAI = useCallback(async (text, imageDataUrl = null) => {
    setIsLoading(true);
    setAiError(null);
    try {
      const response = await getAIResponse(text, imageDataUrl);
      setAiResponses((prev) => [...prev, response]);
      setConversationText(text + `\n\nAssistant: ${response}`);
    } catch (err) {
      setAiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handlePreview() {
    const entryText = [title && `Title: ${title}`, body].filter(Boolean).join('\n');
    const initialText = `User: ${entryText}`;
    setAiResponses([]);
    setConversationText(initialText);
    setAiError(null);
    setRedactions({});
    setRedactMode(false);
    setMode('preview');
    callAI(initialText, photo);
  }

  function handleBack() {
    setMode('compose');
    setRedactMode(false);
  }

  function handleGoDeeper() {
    if (isLoading || aiResponses.length === 0) return;
    callAI(conversationText);
  }

  function handleRegenerate() {
    const entryText = [title && `Title: ${title}`, body].filter(Boolean).join('\n');
    const initialText = `User: ${entryText}`;
    setAiResponses([]);
    setConversationText(initialText);
    setAiError(null);
    setRedactions({});
    callAI(initialText, photo);
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
          <Header onBack={mode === 'preview' ? handleBack : undefined} />
          <main className="app-main">
            {mode === 'compose' ? (
              <ComposeView
                title={title}
                body={body}
                photo={photo}
                injectedPhoto={injectedPhoto}
                onTitleChange={setTitle}
                onBodyChange={setBody}
                onPhotoChange={setPhoto}
                onPreview={handlePreview}
              />
            ) : (
              <PreviewView
                title={title}
                body={body}
                photo={photo}
                aiResponses={aiResponses}
                isLoading={isLoading}
                aiError={aiError}
                redactMode={redactMode}
                redactions={redactions}
                onRedact={handleRedact}
                onUnredact={handleUnredact}
              />
            )}
          </main>
          <BottomBar
            onGoDeeper={mode === 'preview' ? handleGoDeeper : undefined}
            isLoading={isLoading}
          />
        </div>
      </div>

      {mode === 'preview' && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isLoading}>
            ↺ Regenerate
          </Button>
          <Button
            variant={redactMode ? 'active' : 'outline'}
            size="sm"
            onClick={() => setRedactMode((m) => !m)}
          >
            {redactMode ? '✓ Done' : '▮ Redact'}
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Saving…' : '↓ Save'}
          </Button>
        </div>
      )}
    </div>
  );
});

export default SinglePhone;
