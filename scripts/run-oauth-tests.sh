#!/bin/bash

# OAuth Flow Test Runner for MusicLi
# This script runs comprehensive tests for the OAuth integration

echo "🚀 MusicLi OAuth Flow Test Suite"
echo "=================================="

# Check if PocketBase is running
echo "📡 Checking PocketBase server..."
if curl -s http://127.0.0.1:8090/api/health > /dev/null; then
    echo "✅ PocketBase server is running"
else
    echo "❌ PocketBase server is not running"
    echo "Please start PocketBase with: cd pocketbase && ./pocketbase serve"
    exit 1
fi

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  Node modules not found. Installing..."
    bun install
fi

# Run automated tests that don't require OAuth interaction
echo "🧪 Running automated cross-platform tests..."
npm test -- __tests__/CrossPlatformExpo.test.ts --verbose --no-watchman

echo ""
echo "⚠️  OAuth Integration Tests Require Manual Testing"
echo "============================================="
echo "OAuth flows require user interaction (consent screens, login)"
echo "Use the manual checklist below for complete testing"

echo ""
echo "📋 Manual Test Checklist:"
echo "========================"
echo "□ Start the app: expo start"
echo "□ Test Google OAuth connection"
echo "□ Test Spotify OAuth connection"
echo "□ Test 'Get YouTube Music Data' button"
echo "□ Test 'Get Top 5 Tracks' button"
echo "□ Test 'Find YouTube Versions of My Top Tracks' button"
echo "□ Test connecting both services simultaneously"
echo "□ Test disconnecting individual services"
echo "□ Test complete sign out"
echo ""
echo "🔍 Check console logs for:"
echo "• 'Google tokens stored in memory'"
echo "• 'Spotify tokens stored in memory'"
echo "• 'Valid Google token found in memory'"
echo "• 'Valid Spotify token found in memory'"
echo "• YouTube/Spotify API success responses"
echo "• 'Starting cross-platform music discovery...'"
echo "• Track matching progress and confidence scores"
echo "• Cross-platform discovery summary statistics"
echo ""
echo "✨ Testing complete!"