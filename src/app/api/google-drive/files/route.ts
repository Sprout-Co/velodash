import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/googleDrive';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const type = searchParams.get('type') as 'photos' | 'videos' | 'documents';

    if (!vehicleId || !type) {
      return NextResponse.json({ error: 'Missing vehicleId or type' }, { status: 400 });
    }

    // Get files from Google Drive
    const files = await googleDriveService.getVehicleFiles(vehicleId, type);

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('Google Drive get files error:', error);
    return NextResponse.json(
      { error: 'Failed to get files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
