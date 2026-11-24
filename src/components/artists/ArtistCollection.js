import ArtistArtworkCard from './ArtistArtworkCard';

export default function ArtistCollection({ artist, artworks = [], isLoading = false }) {
  if (!artist) return null;

  return (
    <section
      className="artist-collection-section"
      aria-label={`Published artworks by ${artist.name}`}
    >
      <div className="artist-collection-header">
        <div>
          <span className="editorial-eyebrow">PUBLISHED COLLECTION</span>
          <h3 className="artist-collection-heading">
            Works by {artist.name}
          </h3>
        </div>
        <span className="artist-collection-count">
          {artworks.length} {artworks.length === 1 ? 'Work' : 'Works'}
        </span>
      </div>

      {isLoading ? (
        <div className="artist-collection-empty" aria-live="polite">
          <p>Loading artist collection...</p>
        </div>
      ) : artworks.length === 0 ? (
        <div className="artist-collection-empty">
          <p>No published artworks available for this artist yet.</p>
        </div>
      ) : (
        <div className="artist-collection-grid">
          {artworks.map((artwork, idx) => (
            <ArtistArtworkCard
              key={artwork.id}
              artwork={artwork}
              priority={idx < 3}
            />
          ))}
        </div>
      )}
    </section>
  );
}
