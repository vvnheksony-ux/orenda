import type { Endpoint, PayloadRequest } from 'payload'
import { isAdmin } from '../access'
import {
  buildKpiWhere,
  parseAnalyticsEventBody,
  parseInquiryFormBody,
  parseKpiExportQuery,
  parseKpiQuery,
  readJsonBody,
  RequestValidationError,
  serializeKpiCsv,
} from './validation'

function tryGetURL(req: PayloadRequest): URL {
  const urlStr = typeof req.url === 'string' ? req.url : ''
  return new URL(urlStr, 'http://localhost')
}

function validationResponse(err: unknown): Response {
  if (err instanceof RequestValidationError) {
    return Response.json({ error: err.message }, { status: err.status })
  }

  const message = err instanceof Error ? err.message : 'Unknown error'
  return Response.json({ error: message }, { status: 400 })
}

export const healthEndpoint: Endpoint = {
  path: '/health',
  method: 'get',
  handler: async () => {
    return Response.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  },
}

export const inquiryEndpoint: Endpoint = {
  path: '/forms/inquiry',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    try {
      const body = parseInquiryFormBody(await readJsonBody(req))
      const doc = await req.payload.create({
        collection: 'inquiries',
        overrideAccess: true,
        data: {
          name: body.name,
          phone: body.phone,
          email: body.email,
          message: body.message,
        },
      })
      return Response.json({ ok: true, id: doc.id }, { status: 201 })
    } catch (err: unknown) {
      return validationResponse(err)
    }
  },
}

export const eventEndpoint: Endpoint = {
  path: '/events',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    try {
      const body = parseAnalyticsEventBody(await readJsonBody(req))
      const doc = await req.payload.create({
        collection: 'analyticsEvents',
        overrideAccess: true,
        data: {
          event: body.event,
          slug: body.slug,
          locale: body.locale,
          scene: body.scene,
          sessionId: body.sessionId,
          ipHash: body.ipHash,
          referrer: body.referrer,
          userAgent: body.userAgent,
          timestamp: new Date().toISOString(),
        },
      })
      return Response.json({ ok: true, id: doc.id }, { status: 201 })
    } catch (err: unknown) {
      return validationResponse(err)
    }
  },
}

export const kpiEndpoint: Endpoint = {
  path: '/analytics/kpi',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    if (!isAdmin({ req })) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
      const { searchParams } = tryGetURL(req)
      const query = parseKpiQuery(searchParams)
      const result = await req.payload.find({
        collection: 'kpiSnapshots',
        sort: '-date',
        limit: 1000,
        where: buildKpiWhere(query),
      })
      return Response.json(result)
    } catch (err: unknown) {
      if (err instanceof RequestValidationError) {
        return Response.json({ error: err.message }, { status: err.status })
      }
      const message = err instanceof Error ? err.message : 'Unknown error'
      return Response.json({ error: message }, { status: 500 })
    }
  },
}

export const analyticsExportEndpoint: Endpoint = {
  path: '/analytics/export',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    if (!isAdmin({ req })) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
      const { searchParams } = tryGetURL(req)
      const query = parseKpiExportQuery(searchParams)
      const result = await req.payload.find({
        collection: 'kpiSnapshots',
        sort: 'date',
        limit: 10000,
        where: buildKpiWhere(query),
      })

      const csv = serializeKpiCsv(result.docs as unknown as Array<Record<string, unknown>>)

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="kpi-export.csv"',
        },
      })
    } catch (err: unknown) {
      if (err instanceof RequestValidationError) {
        return Response.json({ error: err.message }, { status: err.status })
      }
      const message = err instanceof Error ? err.message : 'Unknown error'
      return Response.json({ error: message }, { status: 500 })
    }
  },
}
