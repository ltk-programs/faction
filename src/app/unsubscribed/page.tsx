import Link from 'next/link'

export default function UnsubscribedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-black text-[#0D1F3C] mb-2">Unsubscribed</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          You won&apos;t receive any more updates for this topic.
          You can resubscribe at any time from the fact file page.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-[#2A7DE1] text-white text-sm font-medium rounded-lg hover:bg-[#1A4A8A] transition-colors"
        >
          Browse all topics →
        </Link>
      </div>
    </div>
  )
}
