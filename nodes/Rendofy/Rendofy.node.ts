import type {
	Icon,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { buildRenderRequest, parsePayload } from './transport';

export class Rendofy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rendofy',
		name: 'rendofy',
		icon: {
			light: 'file:rendofy.svg',
			dark: 'file:rendofy.dark.svg',
		} as Icon,
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create asynchronous video render jobs with Rendofy',
		defaults: {
			name: 'Rendofy',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'rendofyApi',
				required: true,
				testedBy: 'rendofy',
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Render',
						value: 'render',
					},
				],
				default: 'render',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['render'],
					},
				},
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
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. https://example.com/webhook/rendofy-callback',
				description: 'Public HTTPS URL where Rendofy sends the completed render or failure callback',
				displayOptions: {
					show: {
						resource: ['render'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Payload',
				name: 'payload',
				type: 'json',
				default: '{\n  "quote": "Ship it.",\n  "author": "You"\n}',
				required: true,
				description: 'JSON object that describes the video to render',
				displayOptions: {
					show: {
						resource: ['render'],
						operation: ['create'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				if (resource !== 'render' || operation !== 'create') {
					throw new NodeOperationError(this.getNode(), 'Unsupported Rendofy resource or operation', {
						itemIndex,
					});
				}

				const callbackUrl = this.getNodeParameter('callbackUrl', itemIndex) as string;
				const payloadValue = this.getNodeParameter('payload', itemIndex);
				const payload = parsePayload(payloadValue);
				const requestBody = buildRenderRequest(callbackUrl, payload);

				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'rendofyApi', {
					method: 'POST',
					url: 'https://api.rendofy.com/webhook/render-intake',
					headers: { 'Content-Type': 'application/json' },
					body: requestBody,
					json: true,
					timeout: 15000,
				});

				returnData.push({ json: response, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [returnData];
	}
}
