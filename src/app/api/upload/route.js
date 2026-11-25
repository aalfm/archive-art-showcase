import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_SHARP_FORMATS = new Set(['jpeg', 'png', 'webp']);

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }

    const canUpload =
      session.user.role === 'member' ||
      (session.user.role === 'curator' && session.user.curator_status === 'approved');
    if (!canUpload) {
      return NextResponse.json(
        { error: 'You do not have permission to upload files.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file selected.' }, { status: 400 });
    }

    const ext = MIME_TO_EXT[file.type];
    const originalExt = path.extname(file.name || '').toLowerCase();
    if (!ext || (originalExt && !ALLOWED_EXTENSIONS.has(originalExt))) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a JPG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: 'Selected file is empty.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size is too large. Maximum allowed size is 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Verify actual image binary format with sharp and normalize dimensions/orientation
    let outputBuffer;
    try {
      const metadata = await sharp(rawBuffer).metadata();
      if (!metadata.format || !ALLOWED_SHARP_FORMATS.has(metadata.format)) {
        return NextResponse.json(
          { error: 'Unsupported or invalid image format. Please upload a valid JPG, PNG, or WebP file.' },
          { status: 400 }
        );
      }
      outputBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .toBuffer();
    } catch {
      return NextResponse.json(
        { error: 'Corrupted or invalid image file. Please choose another JPG, PNG, or WebP file.' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, outputBuffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: outputBuffer.length,
      success: true,
    });
  } catch (err) {
    console.error('[Upload] Error:', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
