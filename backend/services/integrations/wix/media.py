from typing import Any, Dict
import requests


class WixMediaService:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def import_image(self, access_token: str, image_url: str, display_name: str) -> Dict[str, Any]:
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
        payload = {
            'url': image_url,
            'mediaType': 'IMAGE',
            'displayName': display_name,
        }
        response = requests.post(f"{self.base_url}/media/v1/files/import", headers=headers, json=payload)
        response.raise_for_status()
        return response.json()


