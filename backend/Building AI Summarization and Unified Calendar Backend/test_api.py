#!/usr/bin/env python3
import requests
import json
import os
import sys

def test_file_upload():
    """Test the file upload API endpoint"""
    
    # API endpoint
    url = "http://localhost:5000/api/files/upload"
    
    # Test file path
    test_file_path = "/home/ubuntu/test_document.txt"
    
    if not os.path.exists(test_file_path):
        print(f"Test file not found: {test_file_path}")
        return False
    
    # Headers
    headers = {
        'X-User-ID': 'test-user-123'
    }
    
    try:
        # Upload file
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_document.txt', f, 'text/plain')}
            
            print("Uploading file...")
            response = requests.post(url, files=files, headers=headers, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 201:
                data = response.json()
                upload_id = data['data']['upload_id']
                print(f"Upload successful! Upload ID: {upload_id}")
                return upload_id
            else:
                print("Upload failed!")
                return None
                
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def test_file_analysis(upload_id):
    """Test the file analysis API endpoint"""
    
    url = f"http://localhost:5000/api/files/{upload_id}/analyze"
    
    headers = {
        'X-User-ID': 'test-user-123',
        'Content-Type': 'application/json'
    }
    
    try:
        print("Starting file analysis...")
        response = requests.post(url, headers=headers, timeout=60)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Analysis successful!")
            return True
        else:
            print("Analysis failed!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"Analysis request failed: {e}")
        return False

def test_rag_confirmation(upload_id):
    """Test the RAG confirmation API endpoint"""
    
    url = f"http://localhost:5000/api/files/{upload_id}/confirm-rag"
    
    headers = {
        'X-User-ID': 'test-user-123',
        'Content-Type': 'application/json'
    }
    
    data = {
        'save_to_rag': True
    }
    
    try:
        print("Confirming RAG storage...")
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("RAG confirmation successful!")
            return True
        else:
            print("RAG confirmation failed!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"RAG confirmation request failed: {e}")
        return False

def main():
    """Run the complete test suite"""
    
    print("=== VoiceLoop Backend API Test ===\n")
    
    # Test 1: File Upload
    print("1. Testing file upload...")
    upload_id = test_file_upload()
    
    if not upload_id:
        print("File upload test failed. Exiting.")
        sys.exit(1)
    
    print(f"\n2. Testing file analysis for upload ID: {upload_id}")
    analysis_success = test_file_analysis(upload_id)
    
    if not analysis_success:
        print("File analysis test failed.")
        return
    
    print(f"\n3. Testing RAG confirmation for upload ID: {upload_id}")
    rag_success = test_rag_confirmation(upload_id)
    
    if rag_success:
        print("\n=== All tests passed! ===")
    else:
        print("\n=== Some tests failed ===")

if __name__ == "__main__":
    main()

