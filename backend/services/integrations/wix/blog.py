from typing import Any, Dict, List, Optional
import requests
from loguru import logger


class WixBlogService:
    def __init__(self, base_url: str, client_id: Optional[str]):
        self.base_url = base_url
        self.client_id = client_id

    def headers(self, access_token: str, extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        h: Dict[str, str] = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
        if self.client_id:
            h['wix-client-id'] = self.client_id
        if extra:
            h.update(extra)
        return h

    def create_draft_post(self, access_token: str, payload: Dict[str, Any], extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        response = requests.post(f"{self.base_url}/blog/v3/draft-posts", headers=self.headers(access_token, extra_headers), json=payload)
        response.raise_for_status()
        return response.json()

    def publish_draft(self, access_token: str, draft_post_id: str, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        response = requests.post(f"{self.base_url}/blog/v3/draft-posts/{draft_post_id}/publish", headers=self.headers(access_token, extra_headers))
        response.raise_for_status()
        return response.json()

    def list_categories(self, access_token: str, extra_headers: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        response = requests.get(f"{self.base_url}/blog/v3/categories", headers=self.headers(access_token, extra_headers))
        response.raise_for_status()
        return response.json().get('categories', [])

    def create_category(self, access_token: str, label: str, description: Optional[str] = None, language: Optional[str] = None, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        payload: Dict[str, Any] = {'category': {'label': label}, 'fieldsets': ['URL']}
        if description:
            payload['category']['description'] = description
        if language:
            payload['category']['language'] = language
        response = requests.post(f"{self.base_url}/blog/v3/categories", headers=self.headers(access_token, extra_headers), json=payload)
        response.raise_for_status()
        return response.json()

    def list_tags(self, access_token: str, extra_headers: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        response = requests.get(f"{self.base_url}/blog/v3/tags", headers=self.headers(access_token, extra_headers))
        response.raise_for_status()
        return response.json().get('tags', [])

    def create_tag(self, access_token: str, label: str, language: Optional[str] = None, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        payload: Dict[str, Any] = {'label': label, 'fieldsets': ['URL']}
        if language:
            payload['language'] = language
        response = requests.post(f"{self.base_url}/blog/v3/tags", headers=self.headers(access_token, extra_headers), json=payload)
        response.raise_for_status()
        return response.json()


