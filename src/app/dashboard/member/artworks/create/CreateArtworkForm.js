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
    <div style={{ maxWidth: 680 }}>
      {state?.error && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="dashboard-form">
        <div className="form-group">
          <label className="form-label">Artwork Image *</label>
          <ImageUpload
            currentImage={imageUrl}
            onUpload={(url) => setImageUrl(url)}
            name="image_url"
          />
        </div>

        <div className="form-group">
          <label htmlFor="title" className="form-label">Artwork Title *</label>
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

        <div className="form-group">
          <label htmlFor="description" className="form-label">Artwork Description *</label>
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
          <label htmlFor="tags" className="form-label">Tags (Comma-separated) *</label>
          <input
            id="tags"
            name="tags"
            type="text"
            className="form-input"
            placeholder="cyberpunk, 3d, blender, octane"
            required
          />
          <span style={{ fontSize: '0.74rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>
            Example: digital art, surrealism, concept art
          </span>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isPending || !imageUrl}
          style={{ width: '100%', marginTop: 16 }}
        >
          {isPending ? 'Publishing Artwork...' : 'Publish Artwork'}
        </button>
      </form>
    </div>
  );
}
