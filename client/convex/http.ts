/**
 * Convex HTTP actions — serves stored files publicly.
 * Replaces Uploadcare CDN for public image access.
 *
 * Usage:
 *   <img src={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file/${storageId}`} />
 */
import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'

const http = httpRouter()

// Serve any stored file publicly by its storage ID
http.route({
  path: '/file/{storageId}',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url)
    const storageId = url.pathname.split('/file/')[1]

    if (!storageId) {
      return new Response('Missing storage ID', { status: 400 })
    }

    const blob = await ctx.storage.get(storageId as any)

    if (!blob) {
      return new Response('File not found', { status: 404 })
    }

    // Return file with cache headers (1 week)
    return new Response(blob, {
      headers: {
        'Cache-Control': 'public, max-age=604800, immutable',
        'Content-Type': blob.type,
      },
    })
  }),
})

export default http
