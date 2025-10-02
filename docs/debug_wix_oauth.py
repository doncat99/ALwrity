#!/usr/bin/env python3
"""
Debug script for Wix OAuth issues
"""

import requests
import json

def test_oauth_url():
    """Test the OAuth URL and provide debugging information"""
    
    print("🔍 Debugging Wix OAuth Configuration")
    print("=" * 50)
    
    # Get the OAuth URL from our backend
    try:
        response = requests.get("http://localhost:8000/api/wix/test/auth/url")
        if response.status_code == 200:
            data = response.json()
            oauth_url = data['url']
            print(f"✅ OAuth URL generated successfully")
            print(f"📋 URL: {oauth_url}")
            print()
        else:
            print(f"❌ Failed to get OAuth URL: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error getting OAuth URL: {e}")
        return
    
    # Test the OAuth URL with a HEAD request to see if it's accessible
    print("🌐 Testing OAuth URL accessibility...")
    try:
        head_response = requests.head(oauth_url, timeout=10)
        print(f"📊 HEAD Response Status: {head_response.status_code}")
        print(f"📋 Response Headers: {dict(head_response.headers)}")
        print()
    except Exception as e:
        print(f"❌ Error testing OAuth URL: {e}")
        print()
    
    # Provide debugging steps
    print("🔧 Debugging Steps:")
    print("1. Copy this URL and test it directly in your browser:")
    print(f"   {oauth_url}")
    print()
    print("2. Check your Wix OAuth app configuration:")
    print("   - Go to Wix Dashboard → Settings → Development & integrations → Headless Settings")
    print("   - Find your OAuth app with Client ID: 9faf59b5-2984-4d0d-ac75-47c32ab9f1fb")
    print("   - Verify these URLs are configured:")
    print("     • Allow Authorization Redirect URIs: http://localhost:3000/wix/callback")
    print("     • Allow Redirect Domains: localhost:3000")
    print("     • Login URL: http://localhost:3000")
    print()
    print("3. Common issues:")
    print("   - App not published/activated")
    print("   - URLs not saved properly")
    print("   - App in development mode instead of production")
    print("   - Missing required permissions")
    print()
    print("4. Alternative test:")
    print("   - Try creating a completely new OAuth app")
    print("   - Configure URLs immediately during creation")
    print("   - Test with the new Client ID")

if __name__ == "__main__":
    test_oauth_url()
