import { NextResponse } from 'next/server';
import { uploadPrivateMedia } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { MediaType } from '@/app/generated/prisma/client';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entryId = formData.get('entryId') as string | null;
    const mediaTypeStr = formData.get('mediaType') as string | null;
    const keyword = formData.get('keyword') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Confirm the entry actually belongs to this account before attaching
    // anything to it — without this, anyone with a valid session could
    // attach media to another account's entry just by guessing its ID.
    const entry = await prisma.entry.findUnique({ where: { id: entryId } });
    if (!entry || entry.accountId !== session.accountId) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const blob = await uploadPrivateMedia(file, file.name);

    const type = mediaTypeStr === 'MUSIC' ? MediaType.MUSIC : MediaType.SOUND;

    const mediaAttachment = await prisma.mediaAttachment.create({
      data: {
        url: blob.url,
        type: type,
        label: file.name,
        keyword: keyword || null,
        entry: {
          connect: { id: entryId },
        },
      },
    });

    return NextResponse.json(mediaAttachment, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}