'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createArtwork } from '@/lib/actions/artwork.actions';
import ImageUpload from '@/components/ui/ImageUpload';

export default function CreateArtworkForm({ categories }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await createArtwork(prevState, formData);
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

      <form action={formAction} className="dashboard-form member-profile-form">
        <div className="form-group">
          <label className="form-label">Artwork image *</label>
          <ImageUpload
            currentImage={imageUrl}
            onUpload={(url) => setImageUrl(url)}
            name="image_url"
            label="artwork image"
          />
        </div>

        <div className="dashboard-form-grid-2">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Artwork title *</label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. Echoes of Neo-Kyoto"
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id" className="form-label">Category *</label>
            <select id="category_id" name="category_id" className="form-select" required>
              <option value="">Select a category...</option>
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
            placeholder="Describe the concept, creative process, or philosophy behind this artwork..."
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
            placeholder="cyberpunk, 3d, blender, octane"
            required
          />
          <span className="member-field-hint">
            Example: digital art, surrealism, concept art
          </span>
        </div>

        <div className="dashboard-form-actions">
          <button
            type="submit"
            className="btn-primary dashboard-submit-btn"
            disabled={isPending || !imageUrl}
          >
            {isPending ? 'Publishing artwork...' : 'Publish artwork'}
          </button>
        </div>
      </form>
    </div>
  );
}
