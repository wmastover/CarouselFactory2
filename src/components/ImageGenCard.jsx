import { useState, useEffect, useCallback, useRef } from 'react';
import { generateImage } from '../lib/imageGenApi';
import { generateImagePrompt } from '../lib/promptGen';
import { Button } from './ui/button';
import ImageEditModal from './ImageEditModal';

const SEGMENT_LABELS = {
  subject: 'Subject',
  hair: 'Hair',
  outfit: 'Outfit',
  setting: 'Setting',
  mood: 'Mood',
  lighting: 'Lighting',
  camera: 'Camera',
  extras: 'Extras',
  staticStyle: 'Static style',
};

export default function ImageGenCard({
  onSelect,
  isSelected,
  promptConfig,
  textOverlay,
  referenceImageUrl,
  promptGenerator,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [segments, setSegments] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const promptConfigRef = useRef(promptConfig);
  promptConfigRef.current = promptConfig;
  const referenceImageUrlRef = useRef(referenceImageUrl);
  referenceImageUrlRef.current = referenceImageUrl;
  const promptGeneratorRef = useRef(promptGenerator);
  promptGeneratorRef.current = promptGenerator;

  const generate = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setSegments(null);
    setShowPrompt(false);
    try {
      const generator = promptGeneratorRef.current ?? generateImagePrompt;
      const { prompt, segments: segs } = generator(promptConfigRef.current);
      const url = await generateImage(prompt, {
        signal,
        referenceImageUrl: referenceImageUrlRef.current,
      });
      setImageUrl(url);
      setSegments(segs);
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

  function handleClick() {
    if (!imageUrl || isLoading) return;
    onSelect?.(imageUrl);
  }

  function handleEditAccept(newUrl) {
    setImageUrl(newUrl);
    if (isSelected) onSelect?.(newUrl);
  }

  return (
    <>
    <div className="flex flex-col items-center gap-3">
      <div
        className={`gen-card ${onSelect ? 'gen-card-clickable' : ''} ${isSelected ? 'gen-card-selected' : ''}`}
        onClick={handleClick}
        title={imageUrl ? 'Click to use in your carousel' : undefined}
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
        {imageUrl && !isLoading && (
          <>
            <img src={imageUrl} alt="Generated" className="gen-card-img" />
            <div className="tiktok-text-overlay">
              {textOverlay ?? ''}
            </div>
            <button
              className="image-edit-btn"
              style={{ position: 'absolute', bottom: 52, right: 12, zIndex: 5 }}
              onClick={(e) => { e.stopPropagation(); setEditModalOpen(true); }}
              title="Edit image"
            >
              ✎ Edit
            </button>
            {segments && (
              <button
                className="prompt-info-btn"
                onClick={(e) => { e.stopPropagation(); setShowPrompt(true); }}
                title="Show prompt"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 7v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="4.75" r="0.85" fill="currentColor" />
                </svg>
              </button>
            )}
            {showPrompt && segments && (
              <div className="prompt-overlay" onClick={(e) => e.stopPropagation()}>
                <div className="prompt-overlay-header">
                  <span className="prompt-overlay-title">Prompt breakdown</span>
                  <button className="prompt-overlay-close" onClick={() => setShowPrompt(false)}>✕</button>
                </div>
                <div className="prompt-overlay-segments">
                  {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
                    segments[key] && (
                      <div key={key} className="prompt-segment">
                        <span className="prompt-segment-label">{label}</span>
                        <span className="prompt-segment-value">{segments[key]}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); generate(); }} disabled={isLoading}>
        ↺ Regenerate
      </Button>
    </div>

    {editModalOpen && imageUrl && (
      <ImageEditModal
        imageUrl={imageUrl}
        onAccept={handleEditAccept}
        onClose={() => setEditModalOpen(false)}
      />
    )}
    </>
  );
}
