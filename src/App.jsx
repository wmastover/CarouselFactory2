import { useState, useRef, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import JSZip from 'jszip';
import ImageGenCard from './components/ImageGenCard';
import TextGenCard from './components/TextGenCard';
import SinglePhone from './components/SinglePhone';
import EditPromptsModal from './components/EditPromptsModal';
import ApiKeyModal from './components/ApiKeyModal';
import { Button } from './components/ui/button';
import { generateEntrySuggestions } from './lib/entryGenApi';
import { getOpenRouterApiKey } from './lib/openrouterKey';
import {
  DEFAULT_STATIC_STYLE,
  DEFAULT_SUBJECT,
  DEFAULT_HAIR,
  DEFAULT_OUTFIT,
  DEFAULT_SETTING,
  DEFAULT_LIGHTING,
  DEFAULT_CAMERA,
  DEFAULT_EXTRAS,
  DEFAULT_STATIC_INSTRUCTION,
  DEFAULT_STATIC_EXAMPLES,
  DEFAULT_DYNAMIC,
  DEFAULT_TWIST,
  DEFAULT_TONE,
  DEFAULT_OPENER_STYLE,
} from './lib/promptGen';
import entriesLogo from './assets/entries-logo.png';
import './App.css';

const LS_PROMPT_CONFIG = 'cf_promptConfig';
const LS_TEXT_OVERLAY = 'cf_textOverlay';
const LS_TEXT_PROMPT_CONFIG = 'cf_textPromptConfig';

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored);
  } catch { /* corrupt data — use defaults */ }
  return typeof fallback === 'function' ? fallback() : fallback;
}

function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

async function urlToBlob(url) {
  if (url.startsWith('data:')) return dataUrlToBlob(url);
  const res = await fetch(url);
  return res.blob();
}

export default function App() {
  // Image prompt config + overlay (hydrated from localStorage)
  const [promptConfig, setPromptConfig] = useState(() =>
    loadFromStorage(LS_PROMPT_CONFIG, () => ({
      staticStyle: DEFAULT_STATIC_STYLE,
      subject: [...DEFAULT_SUBJECT],
      hair: [...DEFAULT_HAIR],
      outfit: [...DEFAULT_OUTFIT],
      setting: [...DEFAULT_SETTING],
      lighting: [...DEFAULT_LIGHTING],
      camera: [...DEFAULT_CAMERA],
      extras: [...DEFAULT_EXTRAS],
    }))
  );
  const [textOverlay, setTextOverlay] = useState(() =>
    loadFromStorage(LS_TEXT_OVERLAY, "Sometimes you just gotta read a man's text and go about your day")
  );
  const [textPromptConfig, setTextPromptConfig] = useState(() =>
    loadFromStorage(LS_TEXT_PROMPT_CONFIG, () => ({
      staticInstruction: DEFAULT_STATIC_INSTRUCTION,
      staticExamples: DEFAULT_STATIC_EXAMPLES,
      dynamic: [...DEFAULT_DYNAMIC],
      twist: [...DEFAULT_TWIST],
      tone: [...DEFAULT_TONE],
      openerStyle: [...DEFAULT_OPENER_STYLE],
    }))
  );

  useEffect(() => {
    localStorage.setItem(LS_PROMPT_CONFIG, JSON.stringify(promptConfig));
  }, [promptConfig]);

  useEffect(() => {
    localStorage.setItem(LS_TEXT_OVERLAY, JSON.stringify(textOverlay));
  }, [textOverlay]);

  useEffect(() => {
    localStorage.setItem(LS_TEXT_PROMPT_CONFIG, JSON.stringify(textPromptConfig));
  }, [textPromptConfig]);

  const [editPromptsOpen, setEditPromptsOpen] = useState(false);
  const [editPromptsTab, setEditPromptsTab] = useState('images');
  const [editPromptsMountKey, setEditPromptsMountKey] = useState(0);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyModalContentKey, setApiKeyModalContentKey] = useState(0);
  const apiKeyModalWasOpenRef = useRef(false);

  function openApiKeyModal() {
    if (!apiKeyModalWasOpenRef.current) {
      setApiKeyModalContentKey((k) => k + 1);
    }
    apiKeyModalWasOpenRef.current = true;
    setApiKeyModalOpen(true);
  }

  function closeApiKeyModal() {
    apiKeyModalWasOpenRef.current = false;
    setApiKeyModalOpen(false);
  }

  useEffect(() => {
    if (!getOpenRouterApiKey()) {
      if (!apiKeyModalWasOpenRef.current) {
        setApiKeyModalContentKey((k) => k + 1);
      }
      apiKeyModalWasOpenRef.current = true;
      setApiKeyModalOpen(true);
    }
  }, []);

  // Image row
  const [selectedImgUrl, setSelectedImgUrl] = useState(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(null);
  const [imageRowKey, setImageRowKey] = useState(0);

  // Conversation row
  const [selectedConvImage, setSelectedConvImage] = useState(null);
  const [selectedConvIndex, setSelectedConvIndex] = useState(null);
  const [convRowKey, setConvRowKey] = useState(0);

  // Entry suggestions
  const [entrySuggestions, setEntrySuggestions] = useState(null);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);

  // Entry phones (3 windows)
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
  const phoneRefs = useRef([]);

  // Download state
  const [downloading, setDownloading] = useState(false);

  function handleImgSelect(url, index) {
    setSelectedImgUrl(url);
    setSelectedImgIndex(index);
  }

  async function handleConvSelect(dataUrl, index, messages) {
    setSelectedConvImage(dataUrl);
    setSelectedConvIndex(index);
    setEntrySuggestions(null);
    setSuggestionsError(null);
    setSelectedEntryIndex(null);

    if (messages && messages.length > 0) {
      setIsSuggestionsLoading(true);
      try {
        const suggestions = await generateEntrySuggestions(messages);
        setEntrySuggestions(suggestions);
      } catch (err) {
        setSuggestionsError(err.message || 'Could not generate entry suggestions.');
      } finally {
        setIsSuggestionsLoading(false);
      }
    }
  }


  function openEditPrompts(tab) {
    setEditPromptsTab(tab);
    setEditPromptsMountKey((k) => k + 1);
    setEditPromptsOpen(true);
  }

  function applyPromptPack({ promptConfig: nextPc, textOverlay: nextOverlay, textPromptConfig: nextTpc }) {
    setPromptConfig(nextPc);
    setTextOverlay(nextOverlay);
    setTextPromptConfig(nextTpc);
  }

  function regenerateImageRow() {
    setImageRowKey((k) => k + 1);
    setSelectedImgUrl(null);
    setSelectedImgIndex(null);
  }

  function regenerateConvRow() {
    setConvRowKey((k) => k + 1);
    setSelectedConvImage(null);
    setSelectedConvIndex(null);
    setEntrySuggestions(null);
    setSuggestionsError(null);
    setIsSuggestionsLoading(false);
    setSelectedEntryIndex(null);
  }

  const canDownload = !!(selectedImgUrl && selectedConvImage && selectedEntryIndex !== null);

  async function handleDownloadCarousel() {
    if (!canDownload || !phoneRefs.current[selectedEntryIndex]) return;
    setDownloading(true);
    try {
      const n = parseInt(localStorage.getItem('carousel_count') || '0') + 1;

      const phoneScreenshot = await phoneRefs.current[selectedEntryIndex].captureScreenshot();
      if (!phoneScreenshot) throw new Error('Could not capture entry screenshot');

      const zip = new JSZip();
      const folder = zip.folder(`Carousel ${n}`);

      const imgBlob = await urlToBlob(selectedImgUrl);
      folder.file('1-image.png', imgBlob);

      folder.file('2-conversation.png', dataUrlToBlob(selectedConvImage));
      folder.file('3-entry.png', dataUrlToBlob(phoneScreenshot));

      const selectedEntry = entrySuggestions?.[selectedEntryIndex];
      const detailsLines = [
        `Hook: ${textOverlay}`,
        '',
        `Entry Title: ${selectedEntry?.title ?? ''}`,
        '',
        'Entry Body:',
        selectedEntry?.body ?? '',
      ];
      folder.file('details.txt', detailsLines.join('\n'));

      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Carousel ${n}.zip`;
      link.click();
      URL.revokeObjectURL(blobUrl);

      localStorage.setItem('carousel_count', String(n));
    } catch (err) {
      console.error('Carousel download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  const steps = [
    { label: 'Image selected', done: !!selectedImgUrl },
    { label: 'Conversation selected', done: !!selectedConvImage },
    { label: 'Entry selected', done: selectedEntryIndex !== null },
  ];

  return (
    <div className="min-h-screen bg-[#e8e5e0] flex flex-col">
      {/* Page header */}
      <header className="flex items-center justify-center py-8 flex-shrink-0 px-8 relative min-h-[56px]">
        <button
          type="button"
          className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-lg text-[#1a1a1a] hover:bg-black/5 transition-colors"
          onClick={openApiKeyModal}
          aria-label="OpenRouter API key"
        >
          <KeyRound size={22} strokeWidth={2} aria-hidden />
        </button>
        <img src={entriesLogo} alt="Entries" className="h-10 w-auto" />
      </header>

      <main className="flex flex-col gap-12 pb-16 px-8">
        {/* Row 1 — Image generation */}
        <section>
          <div className="row-header">
            <h2 className="row-label">
              Images
              <span className="row-label-hint">click one to use in your carousel</span>
            </h2>
            <div className="row-header-actions">
              <button className="row-regen-btn" onClick={() => openEditPrompts('images')}>
                ✎ Edit prompts
              </button>
              <button className="row-regen-btn" onClick={regenerateImageRow}>
                ↺ Regenerate row
              </button>
            </div>
          </div>
          <div className="gen-row">
            {[0, 1, 2].map((i) => (
              <ImageGenCard
                key={`${imageRowKey}-${i}`}
                isSelected={selectedImgIndex === i}
                onSelect={(url) => handleImgSelect(url, i)}
                promptConfig={promptConfig}
                textOverlay={textOverlay}
              />
            ))}
          </div>
        </section>

        {/* Row 2 — Text / conversation generation */}
        <section>
          <div className="row-header">
            <h2 className="row-label">
              Conversations
              <span className="row-label-hint">click one to use as your photo</span>
            </h2>
            <div className="row-header-actions">
              <button className="row-regen-btn" onClick={() => openEditPrompts('conversations')}>
                ✎ Edit prompts
              </button>
              <button className="row-regen-btn" onClick={regenerateConvRow}>
                ↺ Regenerate row
              </button>
            </div>
          </div>
          <div className="gen-row">
            {[0, 1, 2].map((i) => (
              <TextGenCard
                key={`${convRowKey}-${i}`}
                isSelected={selectedConvIndex === i}
                onSelect={(dataUrl, messages) => handleConvSelect(dataUrl, i, messages)}
                textPromptConfig={textPromptConfig}
              />
            ))}
          </div>
        </section>

        {/* Row 3 — Entry phones, one per AI suggestion */}
        <section>
          <div className="row-header">
            <h2 className="row-label">
              Entries
              {!isSuggestionsLoading && entrySuggestions && (
                <span className="row-label-hint">click one to use in your carousel</span>
              )}
              {isSuggestionsLoading && (
                <span className="row-label-hint">generating entry ideas…</span>
              )}
              {suggestionsError && (
                <span className="row-label-hint text-red-700">{suggestionsError}</span>
              )}
            </h2>
          </div>
          <div className="gen-row">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`gen-card-wrapper${selectedEntryIndex === i ? ' gen-card-wrapper-selected' : ''}`}
                onClick={() => entrySuggestions?.[i] && setSelectedEntryIndex(i)}
              >
                <SinglePhone
                  ref={(el) => { phoneRefs.current[i] = el; }}
                  injectedPhoto={selectedConvImage}
                  injectedTitle={entrySuggestions?.[i]?.title ?? null}
                  injectedBody={entrySuggestions?.[i]?.body ?? null}
                  onOpenApiKey={openApiKeyModal}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Download carousel */}
        <section className="flex justify-center">
          <div className="carousel-download">
            <div className="carousel-steps">
              {steps.map((s) => (
                <span key={s.label} className={`carousel-step ${s.done ? 'carousel-step-done' : ''}`}>
                  <span className="carousel-step-dot">{s.done ? '✓' : '○'}</span>
                  {s.label}
                </span>
              ))}
            </div>
            <Button
              size="lg"
              onClick={handleDownloadCarousel}
              disabled={!canDownload || downloading}
              className="carousel-download-btn"
            >
              {downloading ? 'Creating carousel…' : '↓ Download Carousel'}
            </Button>
          </div>
        </section>
      </main>

      <EditPromptsModal
        key={editPromptsMountKey}
        open={editPromptsOpen}
        onClose={() => setEditPromptsOpen(false)}
        activeTab={editPromptsTab}
        onTabChange={setEditPromptsTab}
        promptConfig={promptConfig}
        setPromptConfig={setPromptConfig}
        textOverlay={textOverlay}
        setTextOverlay={setTextOverlay}
        textPromptConfig={textPromptConfig}
        setTextPromptConfig={setTextPromptConfig}
        onApplyPromptPack={applyPromptPack}
      />

      <ApiKeyModal
        open={apiKeyModalOpen}
        onClose={closeApiKeyModal}
        contentKey={apiKeyModalContentKey}
      />
    </div>
  );
}
