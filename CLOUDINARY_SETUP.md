# Cloudinary Setup Guide

This guide will help you set up Cloudinary for storing documents and images in your VelocityDash application.

## 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. Verify your email address
3. Log in to your Cloudinary dashboard

## 2. Get Your Cloudinary Credentials

1. In your Cloudinary dashboard, go to the **Dashboard** section
2. Copy the following values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## 3. Configure Environment Variables

1. Copy your `.env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update the Cloudinary configuration in `.env.local`:
   ```env
   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
   CLOUDINARY_API_KEY=your_cloudinary_api_key_here
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
   ```

   Replace the placeholder values with your actual Cloudinary credentials.

## 4. Set Up Upload Presets

1. In your Cloudinary dashboard, go to **Settings** > **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `velocity_dash_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `velocity-dash` (this will be the root folder for all uploads)
   - **Resource Type**: `Auto`
   - **Access Mode**: `Public`
   - **Use filename**: `Use original filename`
   - **Unique filename**: `Add random characters to filename`

5. Click **Save**

## 5. Configure Security Settings (Optional but Recommended)

1. In your Cloudinary dashboard, go to **Settings** > **Security**
2. Configure the following:
   - **Restricted media types**: Add any file types you want to restrict
   - **File size limit**: Set appropriate limits (e.g., 10MB for images, 100MB for videos)
   - **Allowed file formats**: Specify allowed formats for better security

## 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to a vehicle page and try uploading an image or document
3. Check your Cloudinary dashboard to verify files are being uploaded correctly

## 7. Folder Structure

Your files will be organized in Cloudinary with the following structure:
```
velocity-dash/
├── vehicles/
│   ├── vehicle-id-1/
│   │   ├── photos/
│   │   ├── videos/
│   │   └── documents/
│   └── vehicle-id-2/
│       ├── photos/
│       ├── videos/
│       └── documents/
```

## 8. Features Included

The Cloudinary integration includes:

- **Automatic image optimization**: Images are automatically optimized for web delivery
- **Responsive images**: Multiple sizes are generated automatically
- **Video support**: Full video upload and streaming support
- **Document storage**: PDF and other document types supported
- **Thumbnail generation**: Automatic thumbnail generation for images
- **Secure URLs**: All URLs are secure (HTTPS)
- **Progress tracking**: Upload progress is tracked and displayed
- **File validation**: File type and size validation before upload

## 9. Migration from Google Drive

If you're migrating from Google Drive:

1. The system supports both Google Drive and Cloudinary file references
2. Existing Google Drive files will continue to work
3. New uploads will use Cloudinary
4. You can gradually migrate existing files if needed

## 10. Troubleshooting

### Common Issues:

1. **Upload fails with "Invalid upload preset"**
   - Make sure the upload preset name matches exactly: `velocity_dash_unsigned`
   - Verify the preset is set to "Unsigned" mode

2. **Files not appearing in dashboard**
   - Check that the folder structure is correct
   - Verify your API credentials are correct

3. **Large file uploads failing**
   - Check your Cloudinary plan limits
   - Verify file size limits in security settings

4. **Images not displaying**
   - Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set correctly
   - Verify the cloud name matches your Cloudinary account

### Support:

- Check the [Cloudinary documentation](https://cloudinary.com/documentation)
- Review the [Next.js Cloudinary integration guide](https://cloudinary.com/documentation/nextjs_integration)

## 11. Cost Considerations

- **Free tier**: 25 GB storage, 25 GB bandwidth per month
- **Paid plans**: Start at $89/month for higher limits
- **Pay-as-you-go**: Additional usage beyond free tier is charged per GB

Monitor your usage in the Cloudinary dashboard to avoid unexpected charges.
