'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateArtwork } from '@/lib/actions/artwork.actions';

export default function EditArtworkForm({ artwork, categories }) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await updateArtwork(prevState, formData);
    if (res?.success) {
      router.push('/dashboard/member/artworks');
    }
    return res;
  }, null);

  return (
    <div style={{ maxWidth: 680 }}>
      {state?.error && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}

      {/* Non-editable image display as per PRD */}
      <div className="form-group">
        <label className="form-label">Artwork Image (Cannot Be Changed)</label>
        <div style={{ position: 'relative', width: '100%', height: 240, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--bg-secondary)' }}>
          <Image src={artwork.image_url} alt={artwork.title} fill style={{ objectFit: 'cover' }} sizes="680px" />
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>
          ARCHIVE Policy: Original artwork files cannot be replaced after publication.
        </span>
      </div>

      <form action={formAction} className="dashboard-form">
        <input type="hidden" name="artwork_id" value={artwork.id} />

        <div className="form-group">
          <label htmlFor="title" className="form-label">Artwork Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            className="form-input"
            defaultValue={artwork.title}
            required
            minLength={3}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category_id" className="form-label">Category *</label>
          <select id="category_id" name="category_id" className="form-select" defaultValue={artwork.category_id} required>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Artwork Description *</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className="form-textarea"
            defaultValue={artwork.description}
            required
            minLength={10}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags" className="form-label">Tags (Comma-separated) *</label>
          <input
            id="tags"
            name="tags"
            type="text"
            className="form-input"
            defaultValue={artwork.tags}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isPending}
            style={{ flex: 1 }}
          >
            {isPending ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
