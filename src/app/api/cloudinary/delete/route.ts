import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary for server-side use
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicId, resourceType = 'image' } = body;

    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing required parameter: publicId' },
        { status: 400 }
      );
    }

    // Delete file
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    console.log('Cloudinary delete result:', result);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return NextResponse.json(
        { error: `Failed to delete file: ${result.result}` },
        { status: 500 }
      );
    }

    // Handle case where file is already deleted or doesn't exist
    if (result.result === 'not found') {
      console.log('File not found in Cloudinary, but treating as successful deletion');
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
