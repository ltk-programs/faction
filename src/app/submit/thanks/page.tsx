import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-4xl mb-4">✓</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Submission received</h1>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">
        Your suggestion has been added to the editorial review queue.
        The FACTION team will verify the source and respond if we need more information.
        Only primary sources that meet the tier criteria will be published.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/"
          className="text-sm px-4 py-2 bg-[#2A7DE1] text-white rounded-lg hover:bg-[#1A4A8A] transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/submit"
          className="text-sm px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:border-slate-300 transition-colors"
        >
          Submit another
        </Link>
      </div>
    </div>
  )
}
