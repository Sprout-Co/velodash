import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

// Configure Cloudinary for server-side use
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const resourceType = searchParams.get('resourceType') as 'image' | 'video' | 'raw' || 'image';

    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing required parameter: publicId' },
        { status: 400 }
      );
    }

    // Get file metadata
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting file metadata:', error);
    return NextResponse.json(
      { error: 'Failed to get file metadata' },
      { status: 500 }
    );
  }
}
