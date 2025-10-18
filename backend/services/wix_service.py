"""
Wix Integration Service

Handles authentication, permission checking, and blog publishing to Wix websites.
"""

import os
import json
import requests
from typing import Dict, Any, Optional, List
from loguru import logger
from datetime import datetime, timedelta
import base64
from urllib.parse import urlencode, parse_qs
import jwt
import base64 as b64
from services.integrations.wix.blog import WixBlogService
from services.integrations.wix.media import WixMediaService
from services.integrations.wix.utils import extract_meta_from_token, normalize_token_string, extract_member_id_from_access_token as utils_extract_member
from services.integrations.wix.content import convert_content_to_ricos as ricos_builder
from services.integrations.wix.auth import WixAuthService

class WixService:
    """Service for interacting with Wix APIs"""
    
    def __init__(self):
        self.client_id = os.getenv('WIX_CLIENT_ID')
        self.redirect_uri = os.getenv('WIX_REDIRECT_URI', 'https://alwrity-ai.vercel.app/wix/callback')
        self.base_url = 'https://www.wixapis.com'
        self.oauth_url = 'https://www.wix.com/oauth/authorize'
        # Modular services
        self.blog_service = WixBlogService(self.base_url, self.client_id)
        self.media_service = WixMediaService(self.base_url)
        self.auth_service = WixAuthService(self.client_id, self.redirect_uri, self.base_url)
        
        if not self.client_id:
            logger.warning("Wix client ID not configured. Set WIX_CLIENT_ID environment variable.")
    
    def get_authorization_url(self, state: str = None) -> str:
        """
        Generate Wix OAuth authorization URL for "on behalf of user" authentication
        
        This implements the "Authenticate on behalf of a Wix User" flow as described in:
        https://dev.wix.com/docs/build-apps/develop-your-app/access/authentication/authenticate-on-behalf-of-a-wix-user
        
        Args:
            state: Optional state parameter for security
            
        Returns:
            Authorization URL for user to visit
        """
        url, code_verifier = self.auth_service.generate_authorization_url(state)
        self._code_verifier = code_verifier
        return url
    
    def _create_redirect_session_for_auth(self, redirect_uri: str, client_id: str, code_challenge: str, state: str) -> str:
        """
        Create a redirect session for Wix Headless OAuth authentication using Redirects API
        
        Args:
            redirect_uri: The redirect URI for OAuth callback
            client_id: The OAuth client ID
            code_challenge: The PKCE code challenge
            state: The OAuth state parameter
            
        Returns:
            The redirect URL for OAuth authentication
        """
        try:
            # According to Wix documentation, we need to use the Redirects API
            # to create a redirect session for OAuth authentication
            # This is the correct approach for Wix Headless OAuth
            
            # For now, return the direct OAuth URL as a fallback
            # In production, this should call the Wix Redirects API
            redirect_url = f"https://www.wix.com/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=BLOG.CREATE-DRAFT,BLOG.PUBLISH,MEDIA.MANAGE&code_challenge={code_challenge}&code_challenge_method=S256&state={state}"
            
            logger.info(f"Generated Wix Headless OAuth redirect URL: {redirect_url}")
            logger.warning("Using direct OAuth URL - should implement Redirects API for production")
            return redirect_url
            
        except Exception as e:
            logger.error(f"Failed to create redirect session for auth: {e}")
            raise
    
    def exchange_code_for_tokens(self, code: str, code_verifier: str = None) -> Dict[str, Any]:
        """
        Exchange authorization code for access and refresh tokens using PKCE
        
        Args:
            code: Authorization code from Wix
            code_verifier: PKCE code verifier (uses stored one if not provided)
            
        Returns:
            Token response with access_token, refresh_token, etc.
        """
        if not self.client_id:
            raise ValueError("Wix client ID not configured")
        if not code_verifier:
            code_verifier = getattr(self, '_code_verifier', None)
            if not code_verifier:
                raise ValueError("Code verifier not found. Please provide code_verifier parameter.")
        try:
            return self.auth_service.exchange_code_for_tokens(code, code_verifier)
        except requests.RequestException as e:
            logger.error(f"Failed to exchange code for tokens: {e}")
            raise
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token (Wix Headless OAuth)
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            New token response
        """
        if not self.client_id:
            raise ValueError("Wix client ID not configured")
        try:
            return self.auth_service.refresh_access_token(refresh_token)
        except requests.RequestException as e:
            logger.error(f"Failed to refresh access token: {e}")
            raise
    
    def get_site_info(self, access_token: str) -> Dict[str, Any]:
        """
        Get information about the connected Wix site
        
        Args:
            access_token: Valid access token
            
        Returns:
            Site information
        """
        token_str = normalize_token_string(access_token)
        if not token_str:
            raise ValueError("Invalid access token format for create_blog_post")
        try:
            return self.auth_service.get_site_info(token_str)
        except requests.RequestException as e:
            logger.error(f"Failed to get site info: {e}")
            raise
    
    def get_current_member(self, access_token: str) -> Dict[str, Any]:
        """
        Get current member information (for third-party apps)
        
        Args:
            access_token: Valid access token
            
        Returns:
            Current member information
        """
        token_str = normalize_token_string(access_token)
        if not token_str:
            raise ValueError("Invalid access token format for get_current_member")
        try:
            return self.auth_service.get_current_member(token_str, self.client_id)
        except requests.RequestException as e:
            logger.error(f"Failed to get current member: {e}")
            raise

    def extract_member_id_from_access_token(self, access_token: Any) -> Optional[str]:
        return utils_extract_member(access_token)

    def _normalize_token_string(self, access_token: Any) -> Optional[str]:
        return normalize_token_string(access_token)
    
    def check_blog_permissions(self, access_token: str) -> Dict[str, Any]:
        """
        Check if the app has required blog permissions
        
        Args:
            access_token: Valid access token
            
        Returns:
            Permission status
        """
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'wix-client-id': self.client_id or ''
        }
        
        try:
            # Try to list blog categories to check permissions
            response = requests.get(
                f"{self.base_url}/blog/v1/categories",
                headers=headers
            )
            
            if response.status_code == 200:
                return {
                    'has_permissions': True,
                    'can_create_posts': True,
                    'can_publish': True
                }
            elif response.status_code == 403:
                return {
                    'has_permissions': False,
                    'can_create_posts': False,
                    'can_publish': False,
                    'error': 'Insufficient permissions'
                }
            else:
                response.raise_for_status()
                
        except requests.RequestException as e:
            logger.error(f"Failed to check blog permissions: {e}")
            return {
                'has_permissions': False,
                'error': str(e)
            }
    
    def import_image_to_wix(self, access_token: str, image_url: str, display_name: str = None) -> str:
        """
        Import external image to Wix Media Manager
        
        Args:
            access_token: Valid access token
            image_url: URL of the image to import
            display_name: Optional display name for the image
            
        Returns:
            Wix media ID
        """
        try:
            result = self.media_service.import_image(
                access_token,
                image_url,
                display_name or f'Imported Image {datetime.now().strftime("%Y%m%d_%H%M%S")}'
            )
            return result['file']['id']
        except requests.RequestException as e:
            logger.error(f"Failed to import image to Wix: {e}")
            raise
    
    def convert_content_to_ricos(self, content: str, images: List[str] = None) -> Dict[str, Any]:
        return ricos_builder(content, images)
    
    def create_blog_post(self, access_token: str, title: str, content: str, 
                        cover_image_url: str = None, category_ids: List[str] = None,
                        tag_ids: List[str] = None, publish: bool = True, 
                        member_id: str = None) -> Dict[str, Any]:
        """
        Create and optionally publish a blog post on Wix
        
        Args:
            access_token: Valid access token
            title: Blog post title
            content: Blog post content
            cover_image_url: Optional cover image URL
            category_ids: Optional list of category IDs
            tag_ids: Optional list of tag IDs
            publish: Whether to publish immediately or save as draft
            member_id: Required for third-party apps - the member ID of the post author
            
        Returns:
            Created blog post information
        """
        if not member_id:
            raise ValueError("memberId is required for third-party apps creating blog posts")
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Build valid Ricos rich content (minimum: one paragraph with text)
        ricos_content = self.convert_content_to_ricos(content or "This is a post from ALwrity.", None)

        # Minimal payload per Wix docs: title, memberId, and richContent
        blog_data = {
            'draftPost': {
                'title': title,
                'memberId': member_id,  # Required for third-party apps
                'richContent': ricos_content,
                'excerpt': (content or '').strip()[:200]
            },
            'publish': publish,
            'fieldsets': ['URL']  # Simplified fieldsets
        }
        
        # Add cover image if provided
        if cover_image_url:
            try:
                media_id = self.import_image_to_wix(access_token, cover_image_url, f'Cover: {title}')
                blog_data['draftPost']['media'] = {
                    'wixMedia': {
                        'image': {'id': media_id}
                    },
                    'displayed': True,
                    'custom': True
                }
            except Exception as e:
                logger.warning(f"Failed to import cover image: {e}")
        
        # Add categories if provided
        if category_ids:
            blog_data['draftPost']['categoryIds'] = category_ids
        
        # Add tags if provided
        if tag_ids:
            blog_data['draftPost']['tagIds'] = tag_ids
        
        try:
            # Check what permissions we have in the token
            logger.info("DEBUG: Checking token permissions...")
            try:
                import jwt
                # Extract token string manually since _normalize_access_token doesn't exist
                token_str = str(access_token)
                if token_str and token_str.startswith('OauthNG.JWS.'):
                    jwt_part = token_str[12:]
                    payload = jwt.decode(jwt_part, options={"verify_signature": False, "verify_aud": False})
                    logger.info(f"DEBUG: Full token payload: {payload}")
                    
                    # Check for permissions in various possible locations
                    data_payload = payload.get('data', {})
                    if isinstance(data_payload, str):
                        try:
                            data_payload = json.loads(data_payload)
                        except:
                            pass
                    
                    instance_data = data_payload.get('instance', {})
                    permissions = instance_data.get('permissions', '')
                    scopes = instance_data.get('scopes', [])
                    meta_site_id = instance_data.get('metaSiteId')
                    if isinstance(meta_site_id, str) and meta_site_id:
                        headers['wix-site-id'] = meta_site_id
                        logger.info(f"DEBUG: Added wix-site-id header: {meta_site_id}")
                    logger.info(f"DEBUG: Token permissions: {permissions}")
                    logger.info(f"DEBUG: Token scopes: {scopes}")
                else:
                    logger.info("DEBUG: Could not decode token for permission check")
            except Exception as perm_e:
                logger.warning(f"DEBUG: Failed to check permissions: {perm_e}")
            
            logger.info(f"DEBUG: Sending simplified blog data: {json.dumps(blog_data, indent=2)}")
            extra_headers = {}
            if 'wix-site-id' in headers:
                extra_headers['wix-site-id'] = headers['wix-site-id']
            result = self.blog_service.create_draft_post(access_token, blog_data, extra_headers or None)
            logger.info(f"DEBUG: Create draft result: {result}")
            return result
        except requests.RequestException as e:
            logger.error(f"Failed to create blog post: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response body: {e.response.text}")
            raise
    
    def get_blog_categories(self, access_token: str) -> List[Dict[str, Any]]:
        """
        Get available blog categories
        
        Args:
            access_token: Valid access token
            
        Returns:
            List of blog categories
        """
        try:
            return self.blog_service.list_categories(access_token)
        except requests.RequestException as e:
            logger.error(f"Failed to get blog categories: {e}")
            raise
    
    def get_blog_tags(self, access_token: str) -> List[Dict[str, Any]]:
        """
        Get available blog tags
        
        Args:
            access_token: Valid access token
            
        Returns:
            List of blog tags
        """
        try:
            return self.blog_service.list_tags(access_token)
        except requests.RequestException as e:
            logger.error(f"Failed to get blog tags: {e}")
            raise

    def publish_draft_post(self, access_token: str, draft_post_id: str) -> Dict[str, Any]:
        """
        Publish a draft post by ID.
        """
        try:
            result = self.blog_service.publish_draft(access_token, draft_post_id)
            logger.info(f"DEBUG: Publish result: {result}")
            return result
        except requests.RequestException as e:
            logger.error(f"Failed to publish draft post: {e}")
            raise

    def create_category(self, access_token: str, label: str, description: Optional[str] = None,
                         language: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a blog category.
        """
        try:
            return self.blog_service.create_category(access_token, label, description, language)
        except requests.RequestException as e:
            logger.error(f"Failed to create category: {e}")
            raise

    def create_tag(self, access_token: str, label: str, language: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a blog tag.
        """
        try:
            return self.blog_service.create_tag(access_token, label, language)
        except requests.RequestException as e:
            logger.error(f"Failed to create tag: {e}")
            raise
