// Test page for image upload functionality
// Navigate to /test-upload to test the upload feature

import ImageUploadTest from '@/components/test/ImageUploadTest';

export default function TestUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Upload Test</h1>
          <p className="text-gray-600">Test the Firebase Storage image upload functionality</p>
        </div>
        
        <ImageUploadTest />
        
        <div className="mt-8 text-center">
          <a 
            href="/vehicles" 
            className="text-primary hover:underline"
          >
            ← Back to Vehicles
          </a>
        </div>
      </div>
    </div>
  );
}
