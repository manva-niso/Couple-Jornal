import { NextResponse } from 'next/server';
import { uploadPrivateMedia } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { MediaType } from '@/app/generated/prisma/client'; 
// import { checkAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // const user = await checkAuth(request);
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entryId = formData.get('entryId') as string | null;
    // Allow the frontend to specify if it's MUSIC, otherwise default to SOUND
    const mediaTypeStr = formData.get('mediaType') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    const blob = await uploadPrivateMedia(file, file.name);

    // Determine the type strictly based on your schema's allowed values
    const type = mediaTypeStr === 'MUSIC' ? MediaType.MUSIC : MediaType.SOUND;

const keyword = formData.get('keyword') as string | null;

    // ... (your existing uploadPrivateMedia call)

    const mediaAttachment = await prisma.mediaAttachment.create({
      data: {
        url: blob.url,
        type: type,
        label: file.name, // Save the original filename
        keyword: keyword || null, // Save the highlighted keyword if it exists
        entry: {
          connect: { id: entryId }
        }
      },
    });

    return NextResponse.json(mediaAttachment, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}