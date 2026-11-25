import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCuratorCvMimeType, getStoredCuratorCvPath } from '@/lib/curator-cv';
import { getFileExtension } from '@/lib/curator';
import { toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Secure CV retrieval endpoint for Curator applications.
 *
 * Authorization:
 * - Strictly restricted to authenticated Admins and the applicant themselves.
 * - Unauthenticated requests receive 401; unauthorized roles/users receive 403.
 *
 * Supports:
 * - Inline viewing in browser (default for PDF): GET /api/curator-applications/[id]/cv
 * - Explicit file download: GET /api/curator-applications/[id]/cv?download=1
 */
export async function GET(request, context) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const params = await context.params;
  const applicationId = toId(params?.id);
  if (!applicationId) {
    return NextResponse.json({ error: 'Invalid application ID.' }, { status: 400 });
  }

  try {
    const res = await query(
      `SELECT id, user_id, cv_file_path, cv_file_name
       FROM curator_applications
       WHERE id = $1`,
      [applicationId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    const app = res.rows[0];
    const isAdmin = session.user.role === 'admin';
    const isOwner = Number(session.user.id) === Number(app.user_id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'You are not authorized to access this CV document.' },
        { status: 403 }
      );
    }

    if (!app.cv_file_path) {
      return NextResponse.json({ error: 'No CV file attached to this application.' }, { status: 404 });
    }

    const diskPath = getStoredCuratorCvPath(app.cv_file_path);
    if (!diskPath) {
      return NextResponse.json({ error: 'Stored CV file reference is invalid.' }, { status: 404 });
    }

    let fileBuffer;
    try {
      fileBuffer = await readFile(diskPath);
    } catch {
      return NextResponse.json({ error: 'CV file could not be found on server storage.' }, { status: 404 });
    }

    const mimeType = getCuratorCvMimeType(app.cv_file_path);
    const ext = getFileExtension(app.cv_file_path);
    const displayName = (app.cv_file_name || `curator-cv${ext}`).replace(/["\r\n]/g, '');
    const forceDownload = new URL(request.url).searchParams.get('download') === '1';
    const disposition = forceDownload || ext !== '.pdf' ? 'attachment' : 'inline';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `${disposition}; filename="${displayName}"`,
        'Content-Length': String(fileBuffer.length),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[Curator CV] Download error:', err);
    return NextResponse.json({ error: 'Failed to retrieve CV document.' }, { status: 500 });
  }
}
