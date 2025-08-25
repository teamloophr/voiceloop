#!/usr/bin/env python3
"""
Test script for Supabase RAG system
Run this to verify your setup is working correctly
"""

import os
from dotenv import load_dotenv
from supabase_rag import SupabaseRAG

def test_supabase_connection():
    """Test basic Supabase connection"""
    print("🔍 Testing Supabase Connection...")
    
    try:
        # Load environment variables
        load_dotenv()
        
        # Test connection
        rag = SupabaseRAG()
        print("✅ Supabase connection successful!")
        
        # Test basic operations
        test_basic_operations(rag)
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your .env file has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("2. Verify your Supabase project is active")
        print("3. Ensure you have the correct API keys")
        return False
    
    return True

def test_basic_operations(rag):
    """Test basic RAG operations"""
    print("\n🧪 Testing Basic Operations...")
    
    try:
        # Test document stats
        stats = rag.get_document_stats()
        print(f"✅ Document stats retrieved: {stats['total_documents']} documents, {stats['total_chunks']} chunks")
        
        # Test table access
        docs_result = rag.supabase.table('documents').select('id').limit(1).execute()
        print("✅ Documents table accessible")
        
        chunks_result = rag.supabase.table('document_chunks').select('id').limit(1).execute()
        print("✅ Document chunks table accessible")
        
        print("\n🎉 All basic tests passed! Your Supabase RAG system is ready.")
        
    except Exception as e:
        print(f"❌ Basic operations test failed: {e}")
        print("\n🔧 This might indicate:")
        print("1. Tables don't exist - run the SQL commands in Supabase dashboard")
        print("2. Permissions issue - check your service role key")
        print("3. Database schema mismatch")

def test_pgvector_extension():
    """Test if pgvector extension is enabled"""
    print("\n🔍 Testing pgvector Extension...")
    
    try:
        load_dotenv()
        rag = SupabaseRAG()
        
        # Try to create a test vector
        test_result = rag.supabase.rpc('exec_sql', {
            'sql': "SELECT '[1,2,3]'::vector(3) as test_vector;"
        }).execute()
        
        print("✅ pgvector extension is enabled!")
        
    except Exception as e:
        print(f"❌ pgvector extension test failed: {e}")
        print("\n🔧 To enable pgvector:")
        print("1. Go to Supabase Dashboard → SQL Editor")
        print("2. Run: CREATE EXTENSION IF NOT EXISTS vector;")
        print("3. Verify with: SELECT * FROM pg_extension WHERE extname = 'vector';")

if __name__ == "__main__":
    print("🚀 Supabase RAG System Test Suite")
    print("=" * 50)
    
    # Test connection
    if test_supabase_connection():
        # Test pgvector
        test_pgvector_extension()
    
    print("\n" + "=" * 50)
    print("📚 Next Steps:")
    print("1. If all tests pass: Start your Flask server with 'python main.py'")
    print("2. If tests fail: Follow the troubleshooting steps above")
    print("3. Check SUPABASE_RAG_SETUP.md for detailed setup instructions")
