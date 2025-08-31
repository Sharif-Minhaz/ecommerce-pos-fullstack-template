# Shop Management Setup

This document explains how to set up the shop management functionality for vendors in the ecommerce POS template.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=ecommerce-shops

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# MongoDB
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
```

## Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from your dashboard
3. Set the upload folder name (default: "ecommerce-shops")

## Architecture

### Independent Cloudinary Service

The Cloudinary functionality has been separated into an independent service module (`src/lib/cloudinary.ts`) that can be reused throughout your application:

#### Core Service Class

-   **CloudinaryService**: Main service class with static methods
-   **Configuration Management**: Automatic configuration validation
-   **Error Handling**: Comprehensive error handling and logging

#### Utility Functions

-   **uploadShopImage()**: Optimized for shop images
-   **uploadProductImage()**: Optimized for product images
-   **uploadProfileImage()**: Optimized for profile images

#### Features

-   **File Upload**: Support for images, videos, and raw files
-   **Image Transformations**: Generate thumbnails and transformed URLs
-   **File Management**: Upload, delete, and get file information
-   **Configuration Validation**: Check if Cloudinary is properly configured

## Features

### Profile Page

-   **Simplified**: Removed shop information, now only shows basic user details
-   **Vendor Link**: Vendors see a "Go to My Shop" button
-   **Editable**: Name and phone number can be updated
-   **Read-only**: Email and user type cannot be changed

### My Shop Page (`/my-shop`)

-   **Vendor Only**: Only accessible to users with `userType: "vendor"`
-   **Shop Information**: Manage shop name, description, and registration number
-   **Image Management**: Upload and remove shop images using Cloudinary
-   **Auto-creation**: Automatically creates default shop info for new vendors

### Navigation

-   **Conditional Link**: "My Shop" appears in user dropdown only for vendors
-   **Access Control**: Non-vendors are redirected to profile page

## File Structure

```
src/
├── app/
│   ├── profile/
│   │   └── page.tsx          # Simplified profile page
│   ├── my-shop/
│   │   └── page.tsx          # Shop management page
│   └── actions/
│       ├── auth.ts           # Basic profile actions
│       └── shop.ts           # Shop management actions
├── lib/
│   ├── cloudinary.ts         # Independent Cloudinary service
│   └── cloudinary-examples.ts # Usage examples and patterns
└── components/
    └── shared/
        └── main-nav.tsx      # Updated with conditional shop link
```

## Cloudinary Service Usage

### Basic Usage

```typescript
import CloudinaryService from "@/lib/cloudinary";

// Upload any file
const result = await CloudinaryService.uploadFile(file, {
	folder: "uploads",
});

// Upload image specifically
const imageResult = await CloudinaryService.uploadImage(file, {
	folder: "products",
});
```

### Specialized Functions

```typescript
import { uploadShopImage, uploadProductImage } from "@/lib/cloudinary";

// Upload shop image
const shopImage = await uploadShopImage(file, "shop-123");

// Upload product image
const productImage = await uploadProductImage(file, "product-456");
```

### Configuration Validation

```typescript
// Check if Cloudinary is configured
if (!CloudinaryService.isConfigured()) {
	console.error("Cloudinary not configured");
}

// Get configuration status
const status = CloudinaryService.getConfigStatus();
console.log(status);
```

## Usage

### For Regular Users

-   Access profile at `/profile`
-   Can update name and phone number
-   Cannot access shop management

### For Vendors

-   Access profile at `/profile`
-   See "Go to My Shop" button
-   Access shop management at `/my-shop`
-   Can upload/remove shop images
-   Can update shop information

## Image Upload

-   **Format**: Supports all common image formats (JPEG, PNG, WebP, etc.)
-   **Storage**: Images are stored in Cloudinary with organized folder structure
-   **Management**: Vendors can remove individual images
-   **Validation**: File type and size validation handled by browser
-   **Optimization**: Automatic quality optimization and format conversion

## Security

-   **Authentication**: All shop operations require valid NextAuth session
-   **Authorization**: Only vendors can access shop management
-   **Validation**: Server-side validation for all updates
-   **Rate Limiting**: Consider implementing rate limiting for image uploads
-   **File Validation**: Built-in file type and size validation

## Dependencies

The following packages are required:

-   `cloudinary` (already installed)
-   `next-auth` (already installed)
-   `mongoose` (already installed)

## Troubleshooting

### Common Issues

1. **Cloudinary Upload Fails**

    - Check environment variables
    - Verify API credentials
    - Check file size and format
    - Use `CloudinaryService.getConfigStatus()` to debug

2. **Access Denied Errors**

    - Ensure user is authenticated
    - Verify user type is "vendor"
    - Check session validity

3. **Image Not Displaying**
    - Verify Cloudinary URL format
    - Check image permissions
    - Validate image format support

### Development Tips

-   Use `CloudinaryService.isConfigured()` to check configuration
-   Use `CloudinaryService.getConfigStatus()` for debugging
-   Check browser dev tools to monitor network requests
-   Check server logs for detailed error messages
-   Verify MongoDB connection and user data
-   Test with different user types (user, vendor, admin)

### Cloudinary Service Debugging

```typescript
// Check configuration status
const status = CloudinaryService.getConfigStatus();
console.log("Cloudinary Status:", status);

// Test upload with error handling
try {
	const result = await CloudinaryService.uploadImage(file);
	console.log("Upload successful:", result);
} catch (error) {
	console.error("Upload failed:", error);
}
```
