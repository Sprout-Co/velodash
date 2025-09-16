import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/googleDrive';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const vehicleId = formData.get('vehicleId') as string;
    const type = formData.get('type') as 'photos' | 'videos' | 'documents';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!vehicleId || !type) {
      return NextResponse.json({ error: 'Missing vehicleId or type' }, { status: 400 });
    }

    // Upload files to Google Drive
    const uploadedFiles = await googleDriveService.uploadMultipleFiles(files, vehicleId, type);

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Google Drive upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
