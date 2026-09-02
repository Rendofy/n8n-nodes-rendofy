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
		subtitle: 'Submit a render job',
		description: 'Submit an asynchronous video render job to Rendofy',
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
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. https://example.com/webhook/rendofy-callback',
				description: 'Where Rendofy sends the completed render or failure callback',
			},
			{
				displayName: 'Payload',
				name: 'payload',
				type: 'json',
				default: '{\n  "quote": "Ship it.",\n  "author": "You"\n}',
				required: true,
				description: 'JSON data Rendofy uses to render the video',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
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
