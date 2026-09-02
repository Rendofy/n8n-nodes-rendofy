const assert = require('node:assert/strict');
const test = require('node:test');

const { buildRenderRequest, parsePayload } = require('../.test-dist/nodes/Rendofy/transport.js');

test('parses a JSON object payload', () => {
	assert.deepEqual(parsePayload('{"quote":"Ship it."}'), { quote: 'Ship it.' });
});

test('rejects non-object payloads', () => {
	assert.throws(() => parsePayload('["not","an","object"]'), /Payload must be a JSON object/);
});

test('preserves the Rendofy render-intake request contract', () => {
	assert.deepEqual(
		buildRenderRequest('https://example.com/callback', { quote: 'Ship it.' }),
		{
			callback_url: 'https://example.com/callback',
			payload: { quote: 'Ship it.' },
		},
	);
});
