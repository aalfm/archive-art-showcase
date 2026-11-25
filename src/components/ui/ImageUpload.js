'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

function isRenderablePreview(src) {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractDisplayName(src) {
  if (!src) return '';
  const clean = src.split('?')[0];
  const segment = clean.split('/').pop();
  return segment || 'Current image';
}

export default function ImageUpload({
  currentImage = '',
  onUpload,
  name = 'image_url',
  label = 'image',
}) {
  const [imageValue, setImageValue] = useState(currentImage || '');
  const [prevPropImage, setPrevPropImage] = useState(currentImage || '');
  const [fileMeta, setFileMeta] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileRef = useRef(null);

  if (prevPropImage !== (currentImage || '')) {
    const next = currentImage || '';
    setPrevPropImage(next);
    setImageValue(next);
    if (!next) {
      setFileMeta(null);
      setSuccessMessage('');
    }
  }

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    const hasValidType = ALLOWED_MIME_TYPES.has(file.type);
    const hasValidExt = ALLOWED_EXTENSIONS.test(file.name || '');
    if (!hasValidType || !hasValidExt) {
      return 'Unsupported file format. Please select a JPG, PNG, or WebP image.';
    }
    if (file.size <= 0) {
      return 'Selected file is empty.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum allowed size is 10MB.';
    }
    return '';
  };

  const uploadSelectedFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSuccessMessage('');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setError('');
    setSuccessMessage('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error || !data.url) {
        // Keep previously saved image intact on upload failure
        setError(data.error || 'Upload failed. Your previous image was kept unchanged.');
        setSuccessMessage('');
      } else {
        setImageValue(data.url);
        setPrevPropImage(data.url);
        setFileMeta({ name: file.name, size: file.size });
        setSuccessMessage(`Uploaded "${file.name}" successfully.`);
        onUpload?.(data.url);
      }
    } catch {
      setError('Upload failed due to a network error. Please try again.');
      setSuccessMessage('');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      uploadSelectedFile(file);
    }
  };

  const handleRemove = () => {
    setImageValue('');
    setPrevPropImage('');
    setFileMeta(null);
    setError('');
    setSuccessMessage('');
    if (fileRef.current) fileRef.current.value = '';
    onUpload?.('');
  };

  const hasPreview = isRenderablePreview(imageValue);

  return (
    <div className="image-upload-wrapper">
      {/* Hidden field carrying the server-uploaded image path */}
      <input type="hidden" name={name} value={imageValue} />

      {/* File-only input */}
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label={`Upload ${label} file`}
      />

      {hasPreview ? (
        <div
          className={`upload-preview-card${isDragging ? ' is-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="image-preview-wrap">
            <Image
              src={imageValue}
              alt="Selected image preview"
              fill
              unoptimized
              className="image-preview"
              style={{ objectFit: 'cover' }}
              onError={() => {
                setError('Unable to render image preview.');
              }}
            />
            {uploading && (
              <div className="upload-preview-overlay" role="status" aria-live="polite">
                <div className="spinner"></div>
                <span>Uploading replacement...</span>
              </div>
            )}
          </div>

          <div className="upload-file-meta-bar">
            <div className="upload-file-info">
              <span className="upload-file-name">
                {fileMeta?.name || extractDisplayName(imageValue)}
              </span>
              <span className="upload-file-sub">
                {fileMeta?.size
                  ? `${formatFileSize(fileMeta.size)} · Ready to save`
                  : 'Current image · Drop a new file or click Replace'}
              </span>
            </div>

            <div className="upload-file-actions">
              <button
                type="button"
                className="btn-secondary upload-action-btn"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Replace Image'}
              </button>
              <button
                type="button"
                className="btn-danger upload-action-btn"
                onClick={handleRemove}
                disabled={uploading}
                aria-label="Remove image"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className={`upload-file-area${isDragging ? ' is-dragging' : ''}`}
          onClick={() => !uploading && fileRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label={`Choose or drop ${label} file`}
        >
          {uploading ? (
            <div className="upload-loading" role="status" aria-live="polite">
              <div className="spinner"></div>
              <span>Uploading image...</span>
            </div>
          ) : (
            <>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span className="upload-drop-title">
                {isDragging ? 'Drop your image here' : 'Click to choose an image or drag and drop'}
              </span>
              <span className="upload-drop-hint">JPG, PNG, or WebP · Max 10MB</span>
            </>
          )}
        </div>
      )}

      {successMessage && !error && (
        <p className="upload-feedback is-success" role="status" aria-live="polite">
          {successMessage}
        </p>
      )}
      {error && (
        <p className="upload-feedback is-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
