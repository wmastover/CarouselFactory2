export default function EntrySuggestions({ suggestions, isLoading, error, selectedIndex, onSelect }) {
  if (!isLoading && !suggestions && !error) return null;

  return (
    <section>
      <div className="row-header">
        <h2 className="row-label">
          Suggested entries
          {!isLoading && suggestions && (
            <span className="row-label-hint">click one to use as your entry</span>
          )}
        </h2>
      </div>

      {isLoading && (
        <div className="entry-suggestions-loading">
          <div className="gen-card-spinner" />
          <span className="entry-suggestions-loading-text">Generating entry ideas…</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="entry-suggestions-error">{error}</div>
      )}

      {suggestions && !isLoading && (
        <div className="entry-suggestions-row">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className={`entry-suggestion-card ${selectedIndex === i ? 'entry-suggestion-card-selected' : ''}`}
              onClick={() => onSelect(i, s.title, s.body)}
            >
              <p className="entry-suggestion-title">{s.title}</p>
              <p className="entry-suggestion-body">{s.body}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
