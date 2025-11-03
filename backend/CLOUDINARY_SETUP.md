# Cloudinary Setup Guide

## 📸 Image Upload with Cloudinary

This project uses **Cloudinary** for image storage and **Multer** for file handling.

## 🔧 Setup Steps

### 1. Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. After signup, you'll be taken to the Dashboard

### 2. Get Your Cloudinary Credentials

From your Cloudinary Dashboard, you'll find:
- **Cloud Name** (e.g., `zxjqkvqh`)
- **API Key** (e.g., `742278638364494`)
- **API Secret** (e.g., `wzzsaVhGdfSj_j8AbHI69L7xidk`)

### 3. Configure Environment Variables

Add these to your `.env` file in the `backend` directory:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Install Packages

Run in the `backend` directory:

```bash
npm install multer cloudinary
```

### 5. Start the Server

```bash
npm start
# or for development
npm run dev
```

## 🚀 How It Works

### Frontend → Backend → Cloudinary → MongoDB

1. **User selects images** on the Sell Product page
2. **Frontend sends files** to `/api/upload/images`
3. **Multer middleware** handles file uploads in memory
4. **Backend uploads** files to Cloudinary
5. **Cloudinary returns** secure URLs
6. **URLs are saved** to MongoDB with product data

## 📋 API Endpoints

### Upload Multiple Images
```
POST /api/upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- images: File[] (multiple files)
```

**Response:**
```json
{
  "success": true,
  "message": "2 image(s) uploaded successfully",
  "data": {
    "images": [
      {
        "url": "https://res.cloudinary.com/...",
        "public_id": "uon_marketplace/products/...",
        "isPrimary": true,
        "width": 1920,
        "height": 1080,
        "format": "jpg"
      }
    ]
  }
}
```

### Upload Single Image
```
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- images: File (single file)
```

## 🎯 Features

✅ **Automatic Optimization** - Cloudinary optimizes images automatically  
✅ **CDN Delivery** - Fast image delivery via Cloudinary's CDN  
✅ **Secure URLs** - Uses HTTPS for all image URLs  
✅ **Multiple Formats** - Supports JPG, PNG, GIF, WebP  
✅ **File Size Limit** - 5MB per image (configurable)  
✅ **Max Images** - 10 images per product (configurable)

## 📝 File Structure

```
backend/
├── config/
│   └── cloudinary.js      # Cloudinary configuration
├── middleware/
│   └── upload.js          # Multer upload middleware
└── routes/
    └── upload.js          # Upload API routes
```

## 🔒 Security

- **Authentication Required** - All upload routes require JWT token
- **File Type Validation** - Only images allowed
- **Size Limits** - 5MB per file
- **Secure Storage** - Images stored in Cloudinary (not on server)

## 💡 Free Tier Limits

Cloudinary Free Tier includes:
- ✅ 25GB storage
- ✅ 25GB monthly bandwidth
- ✅ Unlimited transformations
- ✅ Multiple image formats

## 🛠️ Troubleshooting

### Error: "Cloudinary config missing"
- Check your `.env` file has all three Cloudinary variables
- Restart your server after adding environment variables

### Error: "File too large"
- Default limit is 5MB per file
- Can be changed in `middleware/upload.js`

### Error: "Invalid file type"
- Only image files are allowed (JPG, PNG, GIF, WebP)
- Check file extension matches image format

## 📚 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Cloudinary Dashboard](https://cloudinary.com/console)

