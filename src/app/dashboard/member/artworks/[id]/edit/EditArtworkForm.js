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
    <div className="member-form-panel">
      {state?.error && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}

      {/* Non-editable image display as per PRD */}
      <div className="form-group">
        <label className="form-label">Artwork image (cannot be changed)</label>
        <div className="member-readonly-artwork-preview">
          <Image src={artwork.image_url} alt={artwork.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 960px" />
        </div>
        <span className="member-field-hint">
          ARCHIVE policy: Original artwork files cannot be replaced after publication.
        </span>
      </div>

      <form action={formAction} className="dashboard-form member-profile-form">
        <input type="hidden" name="artwork_id" value={artwork.id} />

        <div className="dashboard-form-grid-2">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Artwork title *</label>
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
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Artwork description *</label>
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
          <label htmlFor="tags" className="form-label">Tags (comma-separated) *</label>
          <input
            id="tags"
            name="tags"
            type="text"
            className="form-input"
            defaultValue={artwork.tags}
            required
          />
        </div>

        <div className="dashboard-form-actions">
          <button
            type="submit"
            className="btn-primary dashboard-submit-btn"
            disabled={isPending}
          >
            {isPending ? 'Saving changes...' : 'Save changes'}
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
