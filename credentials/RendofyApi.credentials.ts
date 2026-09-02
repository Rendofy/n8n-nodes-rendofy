import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class RendofyApi implements ICredentialType {

	name = 'rendofyApi';

	displayName = 'Rendofy API';

	icon: Icon = {
		light: 'file:../nodes/Rendofy/rendofy.svg',
		dark: 'file:../nodes/Rendofy/rendofy.dark.svg',
	};

	documentationUrl = 'https://rendofy.com/json-to-video-api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Rendofy API key. Create or manage API keys in Rendofy.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			body: {
				api_key: '={{$credentials.apiKey}}',
			},
		},
	};

	/**
	 * Validates the API key without submitting a render. The endpoint shares the
	 * render-intake key lookup but has no job, callback, storage, or billing path.
	 */
	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: 'https://api.rendofy.com/webhook/render-credential-test',
		},
	};
}
