import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies an image and returns it with Content-Disposition so the browser
 * uses the provided filename when saving (right-click Save image as, or open in new tab + save).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EWO-Image/1.0' },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get('content-type') || 'image/webp';
    const buffer = await res.arrayBuffer();

    const safeFilename =
      filename && typeof filename === 'string' && filename.length > 0 && filename.length < 256
        ? filename.replace(/[^\w.-]/g, '_')
        : 'image';

    const ext = safeFilename.includes('.') ? '' : '.webp';
    const downloadFilename = safeFilename.includes('.') ? safeFilename : `${safeFilename}${ext}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${downloadFilename}"`,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err) {
    console.error('Image proxy error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 502 }
    );
  }
}
