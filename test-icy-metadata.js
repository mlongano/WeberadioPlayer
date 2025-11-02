#!/usr/bin/env node

/**
 * Test script to check if https://stream.webe.radio/live sends ICY metadata
 *
 * Usage: node test-icy-metadata.js
 */

const http = require('http');
const https = require('https');
const url = require('url');

const STREAM_URL = 'https://stream.webe.radio/live';
const TIMEOUT = 30000; // 30 seconds

console.log('🎵 ICY Metadata Test for WeBe Radio');
console.log('='.repeat(60));
console.log(`Stream URL: ${STREAM_URL}`);
console.log('='.repeat(60));
console.log();

function parseStreamUrl(streamUrl) {
  const parsedUrl = url.parse(streamUrl);
  return {
    protocol: parsedUrl.protocol === 'https:' ? https : http,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.path,
  };
}

function parseIcyMetadata(buffer) {
  try {
    const metadata = buffer.toString('utf8').replace(/\0/g, '');
    const matches = metadata.match(/StreamTitle='([^']*)'/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

function testIcyMetadata() {
  const { protocol, hostname, port, path } = parseStreamUrl(STREAM_URL);

  const options = {
    hostname,
    port,
    path,
    method: 'GET',
    headers: {
      'Icy-MetaData': '1',
      'User-Agent': 'WeBeRadioApp/1.0 (Metadata Test)',
      'Accept': '*/*',
    },
  };

  console.log('📡 Connecting to stream...');
  console.log(`   Host: ${hostname}:${port}`);
  console.log(`   Path: ${path}`);
  console.log();

  const req = protocol.request(options, (res) => {
    console.log('✅ Connected! Status:', res.statusCode);
    console.log();
    console.log('📋 Response Headers:');
    console.log('-'.repeat(60));

    Object.keys(res.headers).forEach(header => {
      if (header.toLowerCase().startsWith('icy-') ||
        header.toLowerCase() === 'content-type' ||
        header.toLowerCase() === 'server') {
        console.log(`   ${header}: ${res.headers[header]}`);
      }
    });
    console.log('-'.repeat(60));
    console.log();

    // Check for ICY metadata support
    const icyMetaInt = parseInt(res.headers['icy-metaint']);
    const icyName = res.headers['icy-name'];
    const icyDescription = res.headers['icy-description'];
    const icyGenre = res.headers['icy-genre'];
    const icyBitrate = res.headers['icy-br'];

    if (!icyMetaInt) {
      console.log('❌ ICY Metadata NOT supported by this stream');
      console.log('   The server did not send "icy-metaint" header');
      console.log();
      console.log('💡 This means metadata must come from another source');
      console.log('   (like your Socket.IO server at metadata.webe.radio)');
      req.abort();
      return;
    }

    console.log('✅ ICY Metadata IS supported!');
    console.log(`   Metadata interval: ${icyMetaInt} bytes`);
    if (icyName) console.log(`   Station name: ${icyName}`);
    if (icyDescription) console.log(`   Description: ${icyDescription}`);
    if (icyGenre) console.log(`   Genre: ${icyGenre}`);
    if (icyBitrate) console.log(`   Bitrate: ${icyBitrate} kbps`);
    console.log();
    console.log('🎵 Listening for metadata updates...');
    console.log('   (This may take a few seconds)');
    console.log('-'.repeat(60));

    let buffer = Buffer.alloc(0);
    let audioDataCount = 0;
    let metadataCount = 0;

    res.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= icyMetaInt) {
        // Skip audio data
        buffer = buffer.slice(icyMetaInt);
        audioDataCount++;

        if (buffer.length > 0) {
          // Read metadata length (1 byte * 16 = actual length)
          const metaLength = buffer[0] * 16;

          if (metaLength > 0 && buffer.length >= metaLength + 1) {
            // Extract metadata
            const metaBuffer = buffer.slice(1, 1 + metaLength);
            const metadata = parseIcyMetadata(metaBuffer);

            if (metadata) {
              metadataCount++;
              const timestamp = new Date().toLocaleTimeString();
              console.log(`\n[${timestamp}] 🎵 Metadata #${metadataCount}:`);
              console.log(`   ${metadata}`);

              // Parse artist and title if in "Artist - Title" format
              if (metadata.includes(' - ')) {
                const [artist, title] = metadata.split(' - ', 2);
                console.log(`   Artist: ${artist.trim()}`);
                console.log(`   Title: ${title.trim()}`);
              }
            }

            buffer = buffer.slice(1 + metaLength);
          } else {
            // Need more data
            break;
          }
        }
      }
    });

    res.on('end', () => {
      console.log('\n\n📊 Summary:');
      console.log(`   Audio chunks received: ${audioDataCount}`);
      console.log(`   Metadata updates: ${metadataCount}`);
      console.log('\n✅ Test completed');
    });

    // Timeout after specified duration
    setTimeout(() => {
      console.log('\n\n⏱️  Test timeout reached');
      console.log('📊 Summary:');
      console.log(`   Audio chunks received: ${audioDataCount}`);
      console.log(`   Metadata updates: ${metadataCount}`);

      if (metadataCount === 0) {
        console.log('\n⚠️  No metadata received during test period');
        console.log('   This could mean:');
        console.log('   - The stream sends metadata infrequently');
        console.log('   - The current song hasn\'t changed');
        console.log('   - Try running the test for longer');
      }

      req.abort();
    }, TIMEOUT);
  });

  req.on('error', (error) => {
    console.error('❌ Connection Error:', error.message);
    console.log('\nPossible issues:');
    console.log('   - Network connectivity problems');
    console.log('   - Stream server is down');
    console.log('   - SSL/TLS certificate issues');
  });

  req.end();
}

// Run the test
testIcyMetadata();
