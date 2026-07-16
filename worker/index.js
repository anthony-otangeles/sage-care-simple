function indexRequest(request) {
  const url = new URL(request.url);
  url.pathname = "/index.html";
  url.search = "";
  return new Request(url, request);
}

export default {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response("SAGE Care Simple assets are unavailable.", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== "GET") return response;

    return env.ASSETS.fetch(indexRequest(request));
  },
};
