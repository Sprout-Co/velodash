import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryService } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vehicleId = formData.get('vehicleId') as string;
    const type = formData.get('type') as 'photos' | 'videos' | 'documents';

    if (!file || !vehicleId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: file, vehicleId, type' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = cloudinaryService.validateFile(file, type);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload file
    const result = await cloudinaryService.uploadFile(file, vehicleId, type);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
