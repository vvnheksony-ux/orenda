import type { Endpoint, PayloadRequest, Plugin } from 'payload'
import { openapi } from 'payload-oapi'

const docsPath = '/docs'
const specPath = '/openapi.json'
const authPath = '/openapi-auth'
const apiBase = '/payload-api'

function rewriteSpecPaths(spec: Record<string, unknown>): Record<string, unknown> {
  const result = { ...spec }

  if (result.paths && typeof result.paths === 'object') {
    const rewritten: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(result.paths as Record<string, unknown>)) {
      rewritten[key.replace(/^\/api\//, `${apiBase}/`)] = value
    }
    result.paths = rewritten
  }

  if (result.components && typeof result.components === 'object') {
    const sec = (result.components as Record<string, unknown>).securitySchemes
    if (sec && typeof sec === 'object') {
      for (const scheme of Object.values(sec as Record<string, Record<string, unknown>>)) {
        if (scheme?.flows && typeof scheme.flows === 'object') {
          for (const flow of Object.values(scheme.flows as Record<string, Record<string, unknown>>)) {
            if (typeof flow?.tokenUrl === 'string') {
              flow.tokenUrl = flow.tokenUrl.replace(/^\/api\//, `${apiBase}/`)
            }
          }
        }
      }
    }
  }

  return result
}

export type PayloadApiDocsOptions = {
  metadata: { description?: string; title: string; version: string }
  openapiVersion?: '3.0' | '3.1'
}

export const payloadApiDocs = (options: PayloadApiDocsOptions): Plugin =>
  async (incomingConfig) => {
    const config = await openapi({
      authEndpoint: authPath,
      metadata: options.metadata,
      openapiVersion: options.openapiVersion ?? '3.0',
      specEndpoint: specPath,
    })(incomingConfig)

    const specHandler = config.endpoints?.find(
      (ep) => ep.method === 'get' && ep.path === specPath,
    )

    const rewrittenSpecEndpoint: Endpoint = {
      method: 'get',
      path: specPath,
      handler: async (req: PayloadRequest) => {
        if (!specHandler) {
          return new Response('Spec endpoint not found', { status: 500 })
        }
        const original = await specHandler.handler(req)
        const cloned = original.clone()
        const spec = await cloned.json()
        return new Response(JSON.stringify(rewriteSpecPaths(spec)), {
          headers: { 'content-type': 'application/json' },
        })
      },
    }

    const docsEndpoint: Endpoint = {
      method: 'get',
      path: docsPath,
      handler: async (req: PayloadRequest) => {
        const specUrl = `${req.protocol}//${req.host}${apiBase}${specPath}`

        return new Response(
          `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Orienda API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui@5.20.0/dist/swagger-ui.min.css" />
    <style>
      body { margin: 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui@5.20.0/dist/swagger-ui-bundle.min.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: ${JSON.stringify(specUrl)},
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout',
      });
    </script>
  </body>
</html>`,
          { headers: { 'content-type': 'text/html; charset=utf-8' } },
        )
      },
    }

    return {
      ...config,
      endpoints: [
        ...(config.endpoints ?? []).filter(
          (ep) =>
            !(ep.method === 'get' && (ep.path === docsPath || ep.path === specPath)),
        ),
        rewrittenSpecEndpoint,
        docsEndpoint,
      ],
    }
  }
