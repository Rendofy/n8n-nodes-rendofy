const assert = require('node:assert/strict');
const test = require('node:test');

const { buildRenderRequest, parsePayload } = require('../.test-dist/nodes/Rendofy/transport.js');
const { RendofyApi } = require('../.test-dist/credentials/RendofyApi.credentials.js');

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

test('uses the side-effect-free credential validation endpoint', () => {
	const credential = new RendofyApi();

	assert.deepEqual(credential.test, {
		request: {
			method: 'POST',
			url: 'https://api.rendofy.com/webhook/render-credential-test',
		},
	});
	assert.deepEqual(credential.authenticate, {
		type: 'generic',
		properties: {
			body: {
				api_key: '={{$credentials.apiKey}}',
			},
		},
	});
});
