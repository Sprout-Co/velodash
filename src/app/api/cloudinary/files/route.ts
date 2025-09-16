import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary for server-side use
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const type = searchParams.get('type') as 'photos' | 'videos' | 'documents';

    if (!vehicleId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: vehicleId, type' },
        { status: 400 }
      );
    }

    // Get vehicle files
    const folder = `velocity-dash/vehicles/${vehicleId}/${type}`;
    
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .max_results(100)
      .execute();

    const files = result.resources.map((resource: any) => ({
      id: resource.public_id,
      publicId: resource.public_id,
      name: resource.original_filename || resource.public_id.split('/').pop(),
      url: resource.secure_url,
      format: resource.format,
      resourceType: resource.resource_type,
      size: resource.bytes,
      width: resource.width,
      height: resource.height,
      createdAt: resource.created_at,
      vehicleId,
      type,
      thumbnailUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_300,c_fill,g_auto,q_auto/${resource.public_id}`,
      downloadUrl: resource.secure_url
    }));

    return NextResponse.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('Error getting vehicle files:', error);
    return NextResponse.json(
      { error: 'Failed to get vehicle files' },
      { status: 500 }
    );
  }
}
