#!/usr/bin/env python3
"""
Test script to verify comment reply functionality
"""
import os
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_comment_reply():
    print("=== Testing Comment Reply Functionality ===\n")
    
    # 1. Login first
    print("1. Logging in...")
    login_data = {
        "pseudonym": os.getenv("TEST_USERNAME", "testuser"),
        "password": os.getenv("TEST_PASSWORD", "testpass123")
    }
    
    login_response = requests.post(
        f"{BASE_URL}/auth/login/",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        return
    
    tokens = login_response.json()
    access_token = tokens.get('access')
    print(f"✅ Login successful\n")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # 2. Get a post with comments
    print("2. Getting posts...")
    posts_response = requests.get(
        f"{BASE_URL}/posts/",
        headers=headers
    )
    
    if posts_response.status_code != 200:
        print(f"❌ Failed to get posts: {posts_response.status_code}")
        return
    
    posts_data = posts_response.json()
    if not posts_data.get('results'):
        print("❌ No posts found")
        return
    
    post_id = posts_data['results'][0]['id']
    print(f"✅ Found post: {post_id}\n")
    
    # 3. Create a parent comment
    print("3. Creating parent comment...")
    comment_data = {
        "body": "This is a parent comment for testing"
    }
    
    comment_response = requests.post(
        f"{BASE_URL}/posts/{post_id}/comments/",
        json=comment_data,
        headers=headers
    )
    
    if comment_response.status_code != 201:
        print(f"❌ Failed to create comment: {comment_response.status_code}")
        print(comment_response.text)
        return
    
    parent_comment = comment_response.json()
    parent_id = parent_comment['id']
    print(f"✅ Created parent comment: {parent_id}")
    print(f"   Comment data: {json.dumps(parent_comment, indent=2)}\n")
    
    # 4. Create a reply to the parent comment
    print("4. Creating reply to parent comment...")
    reply_data = {
        "body": "This is a reply to the parent comment",
        "parent": parent_id
    }
    
    reply_response = requests.post(
        f"{BASE_URL}/posts/{post_id}/comments/",
        json=reply_data,
        headers=headers
    )
    
    if reply_response.status_code != 201:
        print(f"❌ Failed to create reply: {reply_response.status_code}")
        print(f"   Response: {reply_response.text}")
        return
    
    reply_comment = reply_response.json()
    print(f"✅ Created reply comment: {reply_comment['id']}")
    print(f"   Reply data: {json.dumps(reply_comment, indent=2)}\n")
    
    # 5. Verify the parent field
    if reply_comment.get('parent') == parent_id:
        print(f"✅ Parent field correctly set: {reply_comment['parent']}")
    else:
        print(f"❌ Parent field mismatch!")
        print(f"   Expected: {parent_id}")
        print(f"   Got: {reply_comment.get('parent')}")
    
    # 6. Get all comments and verify threading
    print("\n5. Getting all comments to verify threading...")
    comments_response = requests.get(
        f"{BASE_URL}/posts/{post_id}/comments/",
        headers=headers
    )
    
    if comments_response.status_code != 200:
        print(f"❌ Failed to get comments: {comments_response.status_code}")
        return
    
    all_comments = comments_response.json()
    print(f"✅ Retrieved {len(all_comments)} comments")
    
    # Check threading
    parent_found = False
    reply_found = False
    
    for comment in all_comments:
        if comment['id'] == parent_id:
            parent_found = True
            print(f"\n   Parent comment found:")
            print(f"   - ID: {comment['id']}")
            print(f"   - Parent: {comment.get('parent')}")
            print(f"   - Body: {comment['body'][:50]}...")
        
        if comment['id'] == reply_comment['id']:
            reply_found = True
            print(f"\n   Reply comment found:")
            print(f"   - ID: {comment['id']}")
            print(f"   - Parent: {comment.get('parent')}")
            print(f"   - Body: {comment['body'][:50]}...")
    
    if parent_found and reply_found:
        print(f"\n✅ Both comments found in list!")
        
        # Verify parent relationship
        reply_in_list = next((c for c in all_comments if c['id'] == reply_comment['id']), None)
        if reply_in_list and reply_in_list.get('parent') == parent_id:
            print(f"✅ Reply correctly linked to parent!")
        else:
            print(f"❌ Reply not correctly linked to parent")
            print(f"   Reply parent field: {reply_in_list.get('parent') if reply_in_list else 'Not found'}")
    else:
        print(f"\n❌ Missing comments in list")

if __name__ == "__main__":
    test_comment_reply()
