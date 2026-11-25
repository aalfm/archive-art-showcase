'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createArtwork } from '@/lib/actions/artwork.actions';
import ImageUpload from '@/components/ui/ImageUpload';
import FilterDropdown from '@/components/ui/FilterDropdown';

export default function CreateArtworkForm({ categories }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await createArtwork(prevState, formData);
    if (res?.success) {
      router.push('/dashboard/member/artworks');
    }
    return res;
  }, null);

  const handleSubmit = (formData) => {
    if (!categoryId) {
      setCategoryError('Please select a category.');
      document.getElementById('category_id')?.focus();
      return;
    }
    formAction(formData);
  };

  return (
    <div className="member-form-panel">
      {state?.error && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}

      <form action={handleSubmit} className="dashboard-form member-profile-form">
        <div className="form-group">
          <label className="form-label">Artwork Image *</label>
          <ImageUpload
            currentImage={imageUrl}
            onUpload={(url) => setImageUrl(url)}
            name="image_url"
            label="artwork image"
          />
        </div>

        <div className="dashboard-form-grid-2">
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
            <input type="hidden" name="category_id" value={categoryId} />
            <FilterDropdown
              id="category_id"
              className={`member-category-dropdown${categoryError ? ' has-error' : ''}`}
              ariaLabel="Category"
              value={categoryId}
              options={categoryOptions}
              placeholder="Select a category..."
              onSelect={(val) => {
                setCategoryId(String(val));
                setCategoryError('');
              }}
            />
            {categoryError && <p className="form-error">{categoryError}</p>}
          </div>
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
          <label htmlFor="tags" className="form-label">Tags (Comma-Separated) *</label>
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
            {isPending ? 'Publishing Artwork...' : 'Publish Artwork'}
          </button>
        </div>
      </form>
    </div>
  );
}
