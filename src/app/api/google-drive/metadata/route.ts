import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/googleDrive';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Get file metadata from Google Drive
    const metadata = await googleDriveService.getFileMetadata(fileId);

    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    console.error('Google Drive get metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to get file metadata', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
