# Using Rendofy in n8n

## Submit a render

Add the **Rendofy** node after a node that prepares your video data. In **Payload**, provide a JSON object or an n8n expression that resolves to one.

Use a callback URL controlled by your n8n workflow. The callback must be reachable by Rendofy when the job finishes.

## Continue after the callback

Rendofy queues the render immediately. The Rendofy node therefore returns a queued response; it doesn't wait for an MP4.

Use either:

- a separate Webhook workflow, keyed by `job_id`; or
- n8n's Wait node configured to resume on a webhook callback.

On n8n 2.32.0, normalize a Wait callback from `$json.body` before reading `video_url`. A successful callback has the following shape:

```json
{
  "status": "completed",
  "job_id": "job_123",
  "video_url": "https://.../video.mp4"
}
```

Do not place API keys in payload data, workflow notes, source control, or screenshots.

## Failure handling

If Rendofy sends `status: "failed"`, branch on that status and handle the returned `error`. The node also supports n8n's **Continue On Fail** option for an intake request that cannot be submitted.
