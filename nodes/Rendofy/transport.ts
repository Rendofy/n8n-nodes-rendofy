export interface RendofyRenderRequest {
	callback_url: string;
	payload: Record<string, unknown>;
}

export function parsePayload(value: unknown): Record<string, unknown> {
	if (typeof value === 'string') {
		const parsed: unknown = JSON.parse(value);
		if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
			throw new Error('Payload must be a JSON object');
		}
		return parsed as Record<string, unknown>;
	}

	if (value === null || Array.isArray(value) || typeof value !== 'object') {
		throw new Error('Payload must be a JSON object');
	}

	return value as Record<string, unknown>;
}

export function buildRenderRequest(
	callbackUrl: string,
	payload: Record<string, unknown>,
): RendofyRenderRequest {
	return {
		callback_url: callbackUrl,
		payload,
	};
}
