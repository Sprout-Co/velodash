import CloudinaryUploadTest from '@/components/test/CloudinaryUploadTest';

export default function TestCloudinaryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Cloudinary Integration Test</h1>
            <p className="mt-2 text-lg text-gray-600">
              Test the Cloudinary file upload and storage functionality
            </p>
          </div>
          
          <CloudinaryUploadTest />
        </div>
      </div>
    </div>
  );
}
