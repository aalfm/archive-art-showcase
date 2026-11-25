'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateArtwork } from '@/lib/actions/artwork.actions';
import FilterDropdown from '@/components/ui/FilterDropdown';

export default function EditArtworkForm({ artwork, categories }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(
    artwork.category_id != null ? String(artwork.category_id) : String(categories[0]?.id ?? '')
  );
  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

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
        <label className="form-label">Artwork Image (Cannot Be Changed)</label>
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
            <input type="hidden" name="category_id" value={categoryId} />
            <FilterDropdown
              id="category_id"
              className="member-category-dropdown"
              ariaLabel="Category"
              value={categoryId}
              options={categoryOptions}
              placeholder="Select a category..."
              onSelect={(val) => setCategoryId(String(val))}
            />
          </div>
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
          <label htmlFor="tags" className="form-label">Tags (Comma-Separated) *</label>
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
