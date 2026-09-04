const assert = require('node:assert/strict');
const test = require('node:test');

const { buildRenderRequest, parsePayload } = require('../.test-dist/nodes/Rendofy/transport.js');
const { Rendofy } = require('../.test-dist/nodes/Rendofy/Rendofy.node.js');
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

test('uses the standard Resource and Operation UI pattern', () => {
	const node = new Rendofy();
	const [resource, operation, callbackUrl, payload] = node.description.properties;

	assert.equal(node.description.subtitle, '={{$parameter["operation"] + ": " + $parameter["resource"]}}');
	assert.equal(node.description.usableAsTool, true);
	assert.deepEqual(resource, {
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [{ name: 'Render', value: 'render' }],
		default: 'render',
		required: true,
	});
	assert.deepEqual(operation, {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['render'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Queue an asynchronous video render job',
				action: 'Create a render',
			},
		],
		default: 'create',
		required: true,
	});
	assert.deepEqual(callbackUrl.displayOptions, {
		show: { resource: ['render'], operation: ['create'] },
	});
	assert.deepEqual(payload.displayOptions, {
		show: { resource: ['render'], operation: ['create'] },
	});
});
