import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deletePrivateMedia } from '@/lib/storage';
// import { getSession } from '@/lib/auth'; 

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params and strip the dummy extension (.mp3) so Prisma can find the real ID
    const { id } = await params;
    const cleanId = id.split('.')[0]; 

    // 2. Fetch the media record from the database to get the Vercel Blob URL
    const media = await prisma.mediaAttachment.findUnique({
      where: { id: cleanId },
    });

    if (!media) {
      return new NextResponse('Media not found', { status: 404 });
    }

    // 3. Fetch the actual file from Vercel Blob using your secure token
    const blobResponse = await fetch(media.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!blobResponse.ok) {
      console.error("Vercel Blob Fetch Error:", blobResponse.status, blobResponse.statusText);
      return new NextResponse('Failed to retrieve media from storage', { status: 500 });
    }

    // 4. Stream the response directly to the client
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getSession();
    // if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;
    // Strip the dummy extension (.mp3) for deletions too
    const cleanId = id.split('.')[0];

    const media = await prisma.mediaAttachment.findUnique({
      where: { id: cleanId },
    });

    if (!media) {
      return new NextResponse('Media not found', { status: 404 });
    }

    // 1. Delete the physical file from Vercel Blob
    await deletePrivateMedia(media.url);

    // 2. Delete the record from the database
    await prisma.mediaAttachment.delete({
      where: { id: cleanId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete Media Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}