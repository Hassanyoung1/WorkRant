# File Upload Feature Documentation

## Overview
Added the ability for users to upload images and documents when sharing workplace experiences.

## Features Added

### 1. Supported File Types

#### Images
- JPEG/JPG
- PNG
- GIF
- WEBP

#### Documents
- PDF
- Microsoft Word (DOC, DOCX)
- Microsoft Excel (XLS, XLSX)

### 2. File Upload Specifications

- **Maximum File Size**: 10 MB
- **Validation**: Client-side validation for file type and size
- **UI**: Drag-and-drop or click-to-upload interface

### 3. User Experience

#### Upload Interface
- Modern drag-and-drop zone with hover effects
- Clear visual feedback
- File type and size indicators
- Orange accent colors matching the dark theme

#### File Preview
- Displays file name and size
- Different icons for images vs documents
- Remove button to delete attached file
- Green gradient background for uploaded files

#### Error Handling
- File size exceeded (>10MB)
- Unsupported file types
- Clear error messages in red gradient containers

### 4. Technical Implementation

#### Component: PostForm.tsx
- Added `image` field to form state
- `handleImageChange`: Validates and sets the file
- `removeFile`: Removes attached file
- Updated `handleSubmit`: Includes image in post creation

#### File Validation
```typescript
- Size limit: 10 MB (10 * 1024 * 1024 bytes)
- Type checking: MIME type validation
- Error messaging: User-friendly validation errors
```

### 5. UI Design

#### Upload Zone
- Dark gray background (gray-800/30)
- Dashed border (gray-700)
- Hover effects (orange-500 border)
- Upload icon with color transition
- Clear instructions and supported formats

#### File Preview Card
- Green gradient background
- File icon (image or document)
- File name (truncated if too long)
- File size in MB
- Remove button with hover effect

### 6. Integration

The file upload feature is integrated into:
- **Modal Form** (Homepage quick post)
- **Create Page** (Full experience sharing page)

Both use the same PostForm component, ensuring consistent functionality.

## Usage

1. **Click or drag** a file into the upload zone
2. **Preview** appears showing file details
3. **Remove** file if needed by clicking the X button
4. **Submit** form to upload file with post

## Backend Requirements

The backend should:
- Accept files in the request (multipart/form-data)
- Validate file types server-side
- Store files securely
- Return file URLs in post responses
- Implement file size limits
- Handle file deletion when posts are deleted

## Future Enhancements

Potential improvements:
- Multiple file uploads
- Image preview thumbnails
- File compression for large images
- Progress bar for uploads
- Additional document formats (PowerPoint, etc.)
- Video file support

## Date Added
October 6, 2025
