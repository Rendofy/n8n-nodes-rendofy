# n8n-nodes-rendofy

An n8n community node for submitting asynchronous video render jobs to [Rendofy](https://rendofy.com).

The node sends your JSON payload to Rendofy and returns the immediate queued-job response. Rendofy later sends the completed MP4 URL, or a failure, to the callback URL you provide.

## Installation

In n8n, go to **Settings → Community Nodes → Install**, then enter:

```text
n8n-nodes-rendofy
```

Community nodes are installed at your own discretion. For self-hosted n8n, your administrator may need to enable community nodes first.

## Credentials

Create a **Rendofy API** credential and enter your API key. The key is stored by n8n as a password field and is sent only to Rendofy's render intake endpoint.

For API details, see the [Rendofy JSON-to-video API guide](https://rendofy.com/json-to-video-api).

## Operations

### Submit a render job

The node accepts these fields:

| Field | Description |
| --- | --- |
| **Callback URL** | Public URL Rendofy calls when the render completes or fails. Use an n8n Webhook/Wait-for-Webhook callback pattern. |
| **Payload** | JSON object describing the render data. |

The immediate output is Rendofy's queued response, for example:

```json
{
  "status": "queued",
  "job_id": "job_123"
}
```

The callback body is sent to the URL you provide. A completed job contains `status`, `job_id`, and `video_url`; a failed job contains `status`, `job_id`, and `error`.

## Example workflow pattern

1. Prepare the render JSON in prior nodes.
2. Add **Rendofy** and configure the API credential, payload, and a callback URL.
3. Receive the callback in a Webhook or Wait node.
4. Continue the workflow using `video_url` after a completed callback.

See [docs/USAGE.md](docs/USAGE.md) for a callback-oriented example and the [Rendofy developer examples](https://github.com/Rendofy/rendofy-developer) for a tested RSS-to-video workflow.

## Development

Requires Node.js 22 or later.

```bash
npm install
npm run lint
npm test
npm run dev
```

`npm run dev` starts a local n8n development instance. It never requires a real Rendofy API key to lint, build, unit-test, or scan the package.

After a provenance-published release is available on npm, run `npm run scan:published`. n8n's public scanner accepts an npm package name, not an unpublished local directory.

## Publishing

Do not publish manually. The included GitHub Actions workflow is configured for npm provenance and is intended to publish only after a version tag is pushed from the public repository. Configure npm Trusted Publishing for `Rendofy/n8n-nodes-rendofy` before the first release.

## License

[MIT](LICENSE)
