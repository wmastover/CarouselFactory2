import { useRef } from 'react';

export default function ComposeView({
  title, body, photo, injectedPhoto,
  onTitleChange, onBodyChange, onPhotoChange, onPreview,
}) {
  const fileInputRef = useRef(null);
  const displayPhoto = photo || injectedPhoto || null;

  function readAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await readAsDataURL(file);
    onPhotoChange(dataUrl);
  }

  async function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await readAsDataURL(file);
    onPhotoChange(dataUrl);
  }

  function handleRemovePhoto() {
    onPhotoChange(null);
  }

  return (
    <div className="compose-view">
      <div
        className={`photo-drop-zone ${displayPhoto ? 'has-photo' : ''}`}
        onClick={() => !displayPhoto && fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {displayPhoto ? (
          <>
            <img src={displayPhoto} alt="Entry" className="photo-preview" />
            <button
              className="photo-remove"
              onClick={(e) => { e.stopPropagation(); handleRemovePhoto(); }}
              aria-label="Remove photo"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="photo-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 22" fill="none">
              <rect x="1" y="1" width="22" height="20" rx="3" stroke="#bbb" strokeWidth="1.5"/>
              <circle cx="7.5" cy="7" r="2" stroke="#bbb" strokeWidth="1.5"/>
              <path d="M1 15l5-5 4 4 4-5 6 7" stroke="#bbb" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span>Add a photo</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden-input"
          onChange={handleFileChange}
        />
      </div>

      <div className="compose-fields">
        <input
          className="compose-title"
          type="text"
          placeholder="Entry title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        <textarea
          className="compose-body"
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={6}
        />
      </div>

      <button
        className="preview-btn"
        onClick={onPreview}
        disabled={!body.trim() && !title.trim()}
      >
        Preview Entry
      </button>
    </div>
  );
}
