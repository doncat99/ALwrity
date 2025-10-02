# Wix Integration for ALwrity

This document describes the Wix integration feature that allows ALwrity users to publish their generated blogs directly to their Wix websites.

## Overview

The Wix integration provides a seamless way for ALwrity users to:
- Connect their Wix account to ALwrity
- Publish blog posts directly from ALwrity to their Wix website
- Manage blog categories and tags
- Import images to Wix Media Manager

## Architecture

### Backend Components

1. **WixService** (`services/wix_service.py`)
   - Handles OAuth 2.0 authentication with Wix
   - Manages token refresh and validation
   - Converts content to Wix Ricos JSON format
   - Imports images to Wix Media Manager
   - Creates and publishes blog posts

2. **Wix Routes** (`api/wix_routes.py`)
   - `/api/wix/auth/url` - Get OAuth authorization URL
   - `/api/wix/auth/callback` - Handle OAuth callback
   - `/api/wix/connection/status` - Check connection status
   - `/api/wix/publish` - Publish blog post to Wix
   - `/api/wix/categories` - Get blog categories
   - `/api/wix/tags` - Get blog tags
   - `/api/wix/disconnect` - Disconnect Wix account

### Frontend Components

1. **WixTestPage** (`frontend/src/components/WixTestPage/WixTestPage.tsx`)
   - Test page for Wix integration functionality
   - Connection status display
   - Blog post creation and publishing form
   - Category and tag management

2. **Enhanced Publisher** (`frontend/src/components/BlogWriter/Publisher.tsx`)
   - Integrated Wix publishing into existing blog writer
   - Connection status checking
   - Enhanced error handling and user feedback

## Setup Instructions

### 1. Wix App Configuration

1. Go to [Wix Developers](https://dev.wix.com/)
2. Create a new app or use an existing one
3. Configure OAuth settings:
   - Redirect URI: `http://localhost:3000/wix/callback` (for development)
   - Scopes: `BLOG.CREATE-DRAFT`, `BLOG.PUBLISH`, `MEDIA.MANAGE`
4. Note down your Client ID (no Client Secret required for Wix Headless OAuth)

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Wix Integration (Headless OAuth - Client ID only, no Client Secret required)
WIX_CLIENT_ID=your_wix_client_id_here
WIX_REDIRECT_URI=http://localhost:3000/wix/callback
```

**Important Note**: Wix Headless OAuth only requires a Client ID and does NOT use a Client Secret. This is different from traditional OAuth implementations and is designed for public clients like single-page applications.

### 3. Database Setup

The integration requires storing user tokens securely. You'll need to:

1. Create a table to store Wix tokens:
```sql
CREATE TABLE wix_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    member_id TEXT,  -- Store member ID for third-party app requirements
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. Implement token storage and retrieval functions in the WixService

### 4. Important: Third-Party App Requirements

**CRITICAL**: When creating blog posts as a third-party app, Wix requires a `memberId` field. This is mandatory and cannot be omitted. The integration will:

1. Automatically retrieve the current member ID during the OAuth flow
2. Store the member ID with the user's tokens
3. Use the member ID when creating blog posts

This requirement is enforced by Wix's API and cannot be bypassed.

## Usage

### 1. Testing the Integration

1. Navigate to `/wix-test` in your ALwrity application
2. Click "Connect to Wix" to authorize the integration
3. Complete the OAuth flow in the popup window
4. Once connected, you can:
   - Load categories and tags from your Wix blog
   - Create and publish test blog posts
   - Check connection status

### 2. Publishing from Blog Writer

1. Generate your blog content using ALwrity's AI tools
2. Use the CopilotKit action: "Publish to Wix"
3. The system will:
   - Check your Wix connection status
   - Convert your content to Wix format
   - Import any images to Wix Media Manager
   - Create and publish the blog post
   - Return the published post URL

## API Endpoints

### Authentication

#### Get Authorization URL
```http
GET /api/wix/auth/url?state=optional_state
```

#### Handle OAuth Callback
```http
POST /api/wix/auth/callback
Content-Type: application/json

{
  "code": "authorization_code",
  "state": "optional_state"
}
```

### Connection Management

#### Check Connection Status
```http
GET /api/wix/connection/status
```

#### Disconnect Account
```http
POST /api/wix/disconnect
```

### Publishing

#### Publish Blog Post
```http
POST /api/wix/publish
Content-Type: application/json

{
  "title": "Blog Post Title",
  "content": "Blog content in markdown",
  "cover_image_url": "https://example.com/image.jpg",
  "category_ids": ["category_id_1"],
  "tag_ids": ["tag_id_1", "tag_id_2"],
  "publish": true
}
```

### Content Management

#### Get Blog Categories
```http
GET /api/wix/categories
```

#### Get Blog Tags
```http
GET /api/wix/tags
```

## Content Format Conversion

The integration automatically converts ALwrity's markdown content to Wix's Ricos JSON format:

### Supported Elements

- **Headings**: `# Heading` → `HEADING` node
- **Paragraphs**: Regular text → `PARAGRAPH` node
- **Images**: External URLs → Imported to Wix Media Manager
- **Lists**: Markdown lists → `ORDERED_LIST`/`BULLETED_LIST` nodes

### Example Conversion

**Markdown Input:**
```markdown
# Welcome to My Blog

This is a paragraph with some content.

## Features

- Feature 1
- Feature 2
```

**Ricos JSON Output:**
```json
{
  "nodes": [
    {
      "type": "HEADING",
      "nodes": [{
        "type": "TEXT",
        "textData": {
          "text": "Welcome to My Blog",
          "decorations": []
        }
      }],
      "headingData": { "level": 1 }
    },
    {
      "type": "PARAGRAPH",
      "nodes": [{
        "type": "TEXT",
        "textData": {
          "text": "This is a paragraph with some content.",
          "decorations": []
        }
      }],
      "paragraphData": {}
    }
  ]
}
```

## Error Handling

The integration includes comprehensive error handling for:

- **Authentication Errors**: Invalid tokens, expired sessions
- **Permission Errors**: Insufficient Wix app permissions
- **Content Errors**: Invalid content format, missing required fields
- **Network Errors**: API timeouts, connection issues

## Security Considerations

1. **Token Storage**: Access and refresh tokens are stored securely
2. **HTTPS**: All API calls use HTTPS in production
3. **Scope Limitation**: Only requests necessary permissions
4. **Token Refresh**: Automatic token refresh when expired

## Troubleshooting

### Common Issues

1. **"Wix account not connected"**
   - Solution: Use the Wix Test Page to connect your account

2. **"Insufficient permissions"**
   - Solution: Reconnect your Wix account with proper permissions

3. **"Failed to import image"**
   - Solution: Check image URL accessibility and format

4. **"Content format error"**
   - Solution: Ensure content is valid markdown

### Debug Mode

Enable debug logging by setting the log level to DEBUG in your environment:

```bash
LOG_LEVEL=DEBUG
```

## Future Enhancements

1. **Scheduled Publishing**: Support for scheduled blog posts
2. **Bulk Publishing**: Publish multiple posts at once
3. **Content Templates**: Pre-defined content templates for Wix
4. **Analytics Integration**: Track published post performance
5. **Advanced Formatting**: Support for more Ricos node types

## Support

For issues or questions about the Wix integration:

1. Check the troubleshooting section above
2. Review the Wix API documentation
3. Check the application logs for detailed error messages
4. Contact the development team

## Related Documentation

- [Wix REST API Documentation](https://dev.wix.com/docs/rest)
- [Wix Blog API](https://dev.wix.com/docs/rest/business-solutions/blog)
- [Wix OAuth 2.0](https://dev.wix.com/docs/rest/app-management/oauth-2)
- [Ricos JSON Format](https://dev.wix.com/docs/ricos/api-reference/ricos-document)
