# Image Upload Guide

This guide explains how to use the image upload functionality in VelocityDash.

## 🚀 **Quick Start**

1. **Navigate to a vehicle detail page**: `http://localhost:3000/vehicles/[vehicle-id]`
2. **Scroll to the Media Hub section**
3. **Drag & drop images** or **click to browse** for files
4. **Images will be uploaded** to Firebase Storage automatically
5. **Click the X button** on any image to delete it

## 📋 **Features**

### ✅ **What's Implemented**

- **Drag & Drop Upload**: Drag images directly onto the upload area
- **File Browser**: Click to select files from your device
- **Multiple File Upload**: Upload multiple images at once
- **Progress Indicators**: Visual feedback during upload
- **Image Preview**: See uploaded images immediately
- **Delete Functionality**: Remove images with one click
- **File Validation**: Automatic validation of file types and sizes
- **Error Handling**: Clear error messages for failed uploads
- **Real-time Updates**: Changes sync immediately with the database

### 🎯 **Supported File Types**

**Images:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

**Videos:**
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

### 📏 **File Size Limits**

- **Maximum file size**: 10MB per file
- **No limit on number of files** (within reason)

## 🔧 **Technical Implementation**

### **Firebase Storage Integration**

The upload functionality uses Firebase Storage with the following structure:

```
vehicles/
├── photos/
│   ├── {vehicleId}_{timestamp}.jpg
│   ├── {vehicleId}_{timestamp}.png
│   └── ...
├── videos/
│   ├── {vehicleId}_{timestamp}.mp4
│   └── ...
└── documents/
    └── ...
```

### **Key Components**

1. **`storageService`** (`src/lib/storage.ts`)
   - Handles all Firebase Storage operations
   - File validation and upload
   - URL generation and file deletion

2. **`VehicleMediaHub`** (`src/components/vehicles/VehicleMediaHub.tsx`)
   - UI component for media management
   - Drag & drop functionality
   - Image/video display and management

3. **`vehicleService.updateVehicleMedia()`** (`src/lib/firestore.ts`)
   - Updates vehicle media in Firestore
   - Syncs changes across the application

## 🧪 **Testing**

### **Test Page**

Navigate to `/test-upload` to test the upload functionality independently:

```
http://localhost:3000/test-upload
```

This page allows you to:
- Test file uploads without affecting vehicle data
- Verify file validation
- Test delete functionality
- See upload progress and error handling

### **Manual Testing Steps**

1. **Basic Upload Test**:
   - Go to a vehicle detail page
   - Try uploading a single image
   - Verify it appears in the media grid

2. **Multiple File Upload**:
   - Select multiple images at once
   - Verify all images upload successfully
   - Check that progress indicators work

3. **File Validation**:
   - Try uploading an unsupported file type
   - Try uploading a file larger than 10MB
   - Verify appropriate error messages appear

4. **Delete Functionality**:
   - Upload some images
   - Click the X button on an image
   - Verify it's removed from both UI and storage

5. **Drag & Drop**:
   - Drag images from your file explorer
   - Drop them onto the upload area
   - Verify they upload correctly

## 🎨 **UI/UX Features**

### **Visual Feedback**

- **Drag State**: Upload area highlights when dragging files over it
- **Upload Progress**: Progress bar shows upload status
- **Loading States**: Spinner and disabled state during upload
- **Error Messages**: Clear, dismissible error notifications
- **Hover Effects**: Delete buttons appear on hover

### **Responsive Design**

- **Mobile**: 2-column grid for images
- **Tablet**: 3-column grid for images
- **Desktop**: 4-column grid for images
- **Videos**: 1-2 column layout depending on screen size

## 🔒 **Security & Validation**

### **File Validation**

- **Type Checking**: Only allowed file types are accepted
- **Size Limits**: Files over 10MB are rejected
- **Extension Validation**: File extensions are verified
- **MIME Type Checking**: Actual file content is validated

### **Firebase Security**

- **Storage Rules**: Configured to allow authenticated uploads
- **Path Structure**: Organized by vehicle ID for easy management
- **Access Control**: Files are linked to specific vehicles

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Upload failed" error**:
   - Check Firebase Storage configuration
   - Verify file size is under 10MB
   - Ensure file type is supported

2. **Images not displaying**:
   - Check browser console for errors
   - Verify Firebase Storage rules allow read access
   - Ensure images are properly uploaded

3. **Delete not working**:
   - Check Firebase Storage rules allow delete access
   - Verify the file URL is valid
   - Check browser console for errors

4. **Slow uploads**:
   - Check internet connection
   - Try smaller file sizes
   - Check Firebase Storage performance

### **Debug Information**

Enable debug logging by opening browser console and looking for:
- Upload progress messages
- File validation results
- Firebase Storage errors
- Network request details

## 📚 **API Reference**

### **Storage Service Methods**

```typescript
// Upload a single file
await storageService.uploadFile(file, vehicleId, 'photos', onProgress);

// Upload multiple files
await storageService.uploadMultipleFiles(files, vehicleId, 'photos', onProgress);

// Delete a file
await storageService.deleteFile(downloadURL);

// Validate a file
const validation = storageService.validateFile(file, 'photos');
```

### **Vehicle Service Methods**

```typescript
// Update vehicle media
await vehicleService.updateVehicleMedia(vehicleId, mediaObject);
```

## 🔄 **Data Flow**

1. **User selects files** → File validation
2. **Files upload to Firebase Storage** → Progress tracking
3. **Download URLs generated** → URLs added to vehicle media
4. **Vehicle updated in Firestore** → Database sync
5. **UI updates** → Real-time display
6. **Activity logged** → Audit trail

## 🎯 **Next Steps**

### **Planned Enhancements**

- **Image Compression**: Automatic image optimization before upload
- **Thumbnail Generation**: Create thumbnails for faster loading
- **Bulk Operations**: Select and delete multiple images
- **Image Editing**: Basic crop/rotate functionality
- **Video Thumbnails**: Generate thumbnails for video files
- **Cloud CDN**: Use CloudFlare or similar for faster delivery

### **Advanced Features**

- **Image Metadata**: Extract and store EXIF data
- **Duplicate Detection**: Prevent uploading duplicate images
- **Image Recognition**: Auto-tag images with vehicle parts
- **Batch Upload**: Upload entire folders at once

## 📞 **Support**

If you encounter issues with image uploads:

1. Check the browser console for error messages
2. Verify Firebase Storage is properly configured
3. Test with the `/test-upload` page
4. Check file size and type requirements
5. Ensure Firebase Storage rules allow uploads

The image upload functionality provides a robust, user-friendly way to manage vehicle media with real-time updates and comprehensive error handling! 🎉
