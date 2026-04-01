import { NextResponse } from 'next/server'
import { verifyUnsubToken, removeSubscriber } from '@/lib/subscribers'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://faction-tawny.vercel.app'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return new Response('Invalid unsubscribe link.', { status: 400 })
  }

  const decoded = await verifyUnsubToken(token)
  if (!decoded) {
    return new Response('Invalid or expired unsubscribe link.', { status: 400 })
  }

  await removeSubscriber(decoded.slug, decoded.email)

  // Redirect to a confirmation page
  return NextResponse.redirect(`${BASE_URL}/unsubscribed?slug=${decoded.slug}`)
}
