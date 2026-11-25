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
          Add category
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

        <form ref={createFormRef} action={createAction} className="category-create-form">
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
        <table className="data-table dashboard-responsive-table admin-categories-table">
          <colgroup>
            <col className="admin-cat-col-id" />
            <col className="admin-cat-col-name" />
            <col className="admin-cat-col-artworks" />
            <col className="admin-cat-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category name</th>
              <th>Artworks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="data-table-empty-cell">
                  No categories available yet.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td data-label="ID" className="table-cell-meta">#{cat.id}</td>
                  <td data-label="Category name" data-cell="primary">
                    {editingId === cat.id ? (
                      <form action={updateAction} className="table-inline-edit-form">
                        <input type="hidden" name="category_id" value={cat.id} />
                        <input
                          type="text"
                          name="name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="form-input table-inline-edit-input"
                          required
                          minLength={2}
                        />
                        <div className="table-actions-group">
                          <button type="submit" className="btn-primary table-action-btn" disabled={isUpdating}>
                            Save
                          </button>
                          <button type="button" className="btn-secondary table-action-btn" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <span className="table-cell-title">{cat.name}</span>
                    )}
                  </td>
                  <td data-label="Artworks" className="table-cell-num">
                    {cat.artwork_count} artworks
                  </td>
                  <td data-label="Actions" data-cell="actions">
                    {editingId !== cat.id && (
                      <div className="table-actions-group">
                        <button
                          onClick={() => startEdit(cat)}
                          className="btn-secondary table-action-btn"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(cat.id, cat.name, parseInt(cat.artwork_count))}
                          disabled={loading}
                          className="btn-danger table-action-btn"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={executeDelete}
        title="Delete category"
        message={confirmTarget ? `Delete category "${confirmTarget.name}"?` : ''}
        confirmLabel="Delete"
      />
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
}
