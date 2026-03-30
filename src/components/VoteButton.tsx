'use client'

import { useState, useTransition } from 'react'
import { incrementPriorityVote } from '@/lib/actions'

interface Props {
  slug: string
  initialVotes: number
}

export function VoteButton({ slug, initialVotes }: Props) {
  const [voted, setVoted] = useState(false)
  const [votes, setVotes] = useState(initialVotes)
  const [isPending, startTransition] = useTransition()

  function handleVote() {
    if (voted || isPending) return
    startTransition(async () => {
      await incrementPriorityVote(slug)
      setVoted(true)
      setVotes(v => v + 1)
    })
  }

  return (
    <div className="flex flex-col items-end gap-2 flex-shrink-0">
      <div className="text-center">
        <div className="text-2xl font-black text-[#2A7DE1]">{votes}</div>
        <div className="text-xs text-slate-400">priority votes</div>
      </div>
      <button
        onClick={handleVote}
        disabled={voted || isPending}
        aria-label={voted ? 'Already voted on this topic' : 'Vote to raise this topic\'s research priority'}
        aria-pressed={voted}
        className={`text-xs px-3 py-1.5 rounded border transition-all ${
          voted
            ? 'border-green-300 text-green-600 bg-green-50 cursor-default'
            : isPending
            ? 'border-slate-200 text-slate-400 cursor-wait bg-slate-50'
            : 'border-[#2A7DE1] text-[#2A7DE1] hover:bg-[#2A7DE1] hover:text-white'
        }`}
        title={voted ? 'You have already voted on this topic today' : 'Vote to raise this topic\'s priority'}
      >
        {voted ? '✓ Voted' : isPending ? '…' : '▲ Vote priority'}
      </button>
      {voted && (
        <p className="text-xs text-slate-400 text-right">One vote per topic per day</p>
      )}
    </div>
  )
}
