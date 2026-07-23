import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { checkAuth } from '@/lib/auth';

export async function GET() {
  try {
    // const user = await checkAuth();
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const media = await prisma.mediaAttachment.findMany({
      orderBy: { id: 'desc' },
    });
    
    return NextResponse.json(media);
  } catch (error) {
    console.error('Fetch Media Error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}