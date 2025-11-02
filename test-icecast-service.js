#!/usr/bin/env node

/**
 * Test script for IcecastMetadataService
 *
 * Usage: node test-icecast-service.js
 */

console.log('🎵 Testing Icecast Metadata Service');
console.log('='.repeat(60));

const ICECAST_STATUS_URL = 'https://stream.webe.radio/status-json.xsl';

async function fetchIcecastStatus() {
  try {
    console.log('📡 Fetching from:', ICECAST_STATUS_URL);
    const response = await fetch(ICECAST_STATUS_URL);
    const data = await response.json();

    console.log('\n✅ Response received');
    console.log('='.repeat(60));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(60));

    const title = data.icestats?.source?.title;
    const listeners = data.icestats?.source?.listeners;

    if (title) {
      console.log('\n🎵 Current Song:');
      const parts = title.split(' - ');
      console.log(`   Raw: ${title}`);
      console.log(`   Title: ${parts[0] || ''}`);
      console.log(`   Artist: ${parts[1] || ''}`);
      console.log(`   Year: ${parts[2] || ''}`);
      console.log(`   Album: ${parts[3] || ''}`);
      console.log(`   Listeners: ${listeners || 0}`);

      // Test iTunes API
      await testITunesAPI(parts[1] || '', parts[0] || '');
    } else {
      console.log('\n❌ No title found in response');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testITunesAPI(artist, title) {
  try {
    console.log('\n📀 Testing iTunes API...');
    const query = `${title} ${artist}`.trim();
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`;

    console.log(`   Query: ${query}`);
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      console.log('   ✅ Found cover:');
      console.log(`      Track: ${result.trackName}`);
      console.log(`      Artist: ${result.artistName}`);
      console.log(`      Album: ${result.collectionName}`);
      console.log(`      Cover (100x100): ${result.artworkUrl100}`);
      console.log(`      Cover (600x600): ${result.artworkUrl100.replace('100x100', '600x600')}`);
    } else {
      console.log('   ❌ No results from iTunes');
    }
  } catch (error) {
    console.log('   ❌ iTunes API error:', error.message);
  }
}

// Run the test
fetchIcecastStatus();
