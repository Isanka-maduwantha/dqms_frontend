export async function parseJsonResponse(response) {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}
