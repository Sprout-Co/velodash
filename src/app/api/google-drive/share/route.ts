import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/googleDrive';

export async function POST(request: NextRequest) {
  try {
    const { fileId, permission = 'reader' } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Generate shareable link
    const shareableLink = await googleDriveService.generateShareableLink(fileId, permission);

    return NextResponse.json({ success: true, shareableLink });
  } catch (error) {
    console.error('Google Drive share error:', error);
    return NextResponse.json(
      { error: 'Failed to generate shareable link', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
