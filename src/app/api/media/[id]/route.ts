import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deletePrivateMedia } from '@/lib/storage';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;
    const cleanId = id.split('.')[0];

    const media = await prisma.mediaAttachment.findUnique({
      where: { id: cleanId },
      include: { entry: true },
    });

    if (!media || media.entry.accountId !== session.accountId) {
      return new NextResponse('Media not found', { status: 404 });
    }

    const blobResponse = await fetch(media.url, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });

    if (!blobResponse.ok) {
      return new NextResponse('Failed to retrieve media from storage', { status: 500 });
    }

    return new NextResponse(blobResponse.body, {
      headers: {
        'Content-Type': blobResponse.headers.get('Content-Type') || 'audio/mpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Media Delivery Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;
    const cleanId = id.split('.')[0];

    const media = await prisma.mediaAttachment.findUnique({
      where: { id: cleanId },
      include: { entry: true },
    });

    if (!media || media.entry.accountId !== session.accountId) {
      return new NextResponse('Media not found', { status: 404 });
    }

    await deletePrivateMedia(media.url);
    await prisma.mediaAttachment.delete({ where: { id: cleanId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete Media Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}