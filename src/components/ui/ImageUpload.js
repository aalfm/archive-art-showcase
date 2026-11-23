'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

function isRenderablePreview(src) {
  if (!src) return false;
  if (src.startsWith('/')) return true;
  try {
    const parsed = new URL(src);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function ImageUpload({ currentImage, onUpload, name = 'image_url' }) {
  const [preview, setPreview] = useState(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlMode, setUrlMode] = useState(Boolean(currentImage && currentImage.startsWith('http')));
  const [urlInput, setUrlInput] = useState(currentImage || '');
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Upload failed. Please try again.');
      } else {
        setPreview(data.url);
        setUrlInput(data.url);
        onUpload?.(data.url);
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInput = (e) => {
    const url = e.target.value;
    setError('');
    setUrlInput(url);
    setPreview(isRenderablePreview(url) ? url : '');
    onUpload?.(url);
  };

  const handleRemove = () => {
    setPreview('');
    setUrlInput('');
    setError('');
    if (fileRef.current) fileRef.current.value = '';
    onUpload?.('');
  };

  return (
    <div className="image-upload-wrapper">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={urlInput} />

      {/* Preview */}
      {isRenderablePreview(preview) && (
        <div className="image-preview-wrap">
          <Image
            src={preview}
            alt="Preview"
            fill
            unoptimized
            className="image-preview"
            style={{ objectFit: 'cover', borderRadius: 6 }}
            onError={() => setPreview('')}
          />
          <button
            type="button"
            className="image-preview-remove"
            onClick={handleRemove}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="upload-mode-toggle">
        <button
          type="button"
          className={`upload-mode-btn ${!urlMode ? 'active' : ''}`}
          onClick={() => setUrlMode(false)}
        >
          Upload File
        </button>
        <button
          type="button"
          className={`upload-mode-btn ${urlMode ? 'active' : ''}`}
          onClick={() => setUrlMode(true)}
        >
          Image URL
        </button>
      </div>

      {!urlMode ? (
        <button type="button" className="upload-file-area" onClick={() => fileRef.current?.click()} style={{ width: '100%', color: 'var(--text-primary)' }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Upload artwork image"
          />
          {uploading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Click to upload image</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--surface)' }}>JPEG, PNG, WebP, GIF · Max 10MB</span>
            </>
          )}
        </button>
      ) : (
        <input
          type="url"
          className="form-input"
          placeholder="https://example.com/image.jpg"
          value={urlInput}
          onChange={handleUrlInput}
          aria-label="Image URL"
        />
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
