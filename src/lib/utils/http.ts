export async function parseJsonResponse<T>(response: Response): Promise<T | Record<string, never>> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as Record<string, never>);
}
