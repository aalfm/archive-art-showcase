'use client';

import { useActionState, useRef, useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/admin.actions';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Toast, useToast } from '@/components/ui/Toast';

export default function CategoryManager({ categories }) {
  const createFormRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  const [createState, createAction, isCreating] = useActionState(async (prevState, formData) => {
    const res = await createCategory(prevState, formData);
    if (res?.success) {
      createFormRef.current?.reset();
    }
    return res;
  }, null);
  const [updateState, updateAction, isUpdating] = useActionState(async (prevState, formData) => {
    const res = await updateCategory(prevState, formData);
    if (res?.success) {
      setEditingId(null);
    }
    return res;
  }, null);

  const requestDelete = (id, name, artworkCount) => {
    if (artworkCount > 0) {
      showToast(`Category "${name}" is still used by ${artworkCount} artworks.`, 'error');
      return;
    }
    setConfirmTarget({ id, name });
  };

  const executeDelete = async () => {
    if (!confirmTarget) return;
    setLoading(true);
    const res = await deleteCategory(confirmTarget.id);
    if (res?.error) {
      showToast(res.error, 'error');
    } else {
      showToast(`Category "${confirmTarget.name}" deleted.`);
    }
    setConfirmTarget(null);
    setLoading(false);
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  return (
    <div>
      {/* Create Category Form */}
      <div style={{ maxWidth: 540, background: 'var(--bg-elevated)', border: '1px solid var(--bg-secondary)', borderRadius: 'var(--radius-xs)', padding: 24, marginBottom: 32 }}>
        <h2 className="dash-section-title" style={{ marginBottom: 14 }}>
          Add Category
        </h2>

        {createState?.error && (
          <div className="form-alert form-alert-error" role="alert">
            {createState.error}
          </div>
        )}
        {createState?.success && (
          <div className="form-alert form-alert-success" role="alert">
            Category added successfully!
          </div>
        )}

        <form ref={createFormRef} action={createAction} style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            name="name"
            placeholder="Category name, e.g., Surrealism..."
            className="form-input"
            required
            minLength={2}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={isCreating}
            style={{ whiteSpace: 'nowrap' }}
          >
            {isCreating ? 'Saving...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Edit Form Feedback if editing */}
      {updateState?.error && (
        <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: 16 }}>
          {updateState.error}
        </div>
      )}

      {/* Category List */}
      <h2 className="dash-section-title" style={{ marginBottom: 14 }}>
        Categories ({categories.length})
      </h2>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Category Name</th>
              <th>Artworks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--surface)' }}>#{cat.id}</td>
                <td>
                  {editingId === cat.id ? (
                    <form action={updateAction} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <input type="hidden" name="category_id" value={cat.id} />
                      <input
                        type="text"
                        name="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="form-input"
                        style={{ padding: '4px 10px', fontSize: '0.85rem', width: 220 }}
                        required
                        minLength={2}
                      />
                      <button type="submit" className="btn-primary" disabled={isUpdating} style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                        Save
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{cat.name}</span>
                  )}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  {cat.artwork_count} artworks
                </td>
                <td>
                  {editingId !== cat.id && (
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        onClick={() => startEdit(cat)}
                        className="btn-secondary"
                        style={{ padding: '5px 12px', fontSize: '0.74rem' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(cat.id, cat.name, parseInt(cat.artwork_count))}
                        disabled={loading}
                        className="btn-danger"
                        style={{ padding: '5px 12px', fontSize: '0.74rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={executeDelete}
        title="Delete Category"
        message={confirmTarget ? `Delete category "${confirmTarget.name}"?` : ''}
        confirmLabel="Delete"
      />
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
}
