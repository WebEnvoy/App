const defaultMaxBytes = 64 * 1024;

export async function readBoundedJsonResponse(response: Response, maxBytes = defaultMaxBytes): Promise<unknown> {
  const mediaType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    await cancel(response);
    throw new Error("Owner API response must use application/json.");
  }
  const contentLength = response.headers.get("content-length");
  if (contentLength != null && /^\d+$/.test(contentLength) && Number(contentLength) > maxBytes) {
    await cancel(response);
    throw new Error("Owner API response exceeds the byte limit.");
  }
  if (response.body == null) return null;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await cancel(response, reader);
      throw new Error("Owner API response exceeds the byte limit.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const text = new TextDecoder().decode(bytes);
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Owner API response is not valid JSON.");
  }
}

async function cancel(response: Response, reader?: ReadableStreamDefaultReader<Uint8Array>) {
  try {
    if (reader) await reader.cancel();
    else await response.body?.cancel();
  } catch {
    // The response is already rejected; cancellation is best effort.
  }
}
