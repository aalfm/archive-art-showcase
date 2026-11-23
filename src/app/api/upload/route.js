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
  'image/gif': 'gif',
};

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file selected.' }, { status: 400 });
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Unsupported file format. Use JPEG, PNG, WebP, or GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size is too large. Maximum 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Verify actual image bytes with sharp and strip metadata/oversized dimensions
    let outputBuffer = rawBuffer;
    try {
      const metadata = await sharp(rawBuffer, { animated: ext === 'gif' }).metadata();
      if (!metadata.format) {
        return NextResponse.json({ error: 'File is not a valid image.' }, { status: 400 });
      }
      if (ext !== 'gif') {
        outputBuffer = await sharp(rawBuffer)
          .rotate()
          .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
          .toBuffer();
      }
    } catch {
      return NextResponse.json({ error: 'Corrupted or invalid image file.' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, outputBuffer);

    return NextResponse.json({ url: `/uploads/${filename}`, success: true });
  } catch (err) {
    console.error('[Upload] Error:', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
