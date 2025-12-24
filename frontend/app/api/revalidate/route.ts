import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string
      _id: string
      slug?: { current?: string }
    }>(req, process.env.SANITY_REVALIDATE_SECRET)

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    // Revalidate based on document type (using 'max' for stale-while-revalidate)
    revalidateTag(body._type, 'max')

    // Also revalidate specific document if needed
    if (body._id) {
      revalidateTag(body._id, 'max')
    }

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    })
  } catch (err: unknown) {
    console.error(err)
    return new NextResponse(err instanceof Error ? err.message : 'Error', { status: 500 })
  }
}
