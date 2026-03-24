"use client"

import { useEffect } from "react"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function UDError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-xl font-semibold text-gray-800">エラーが発生しました</p>
      <p className="text-[13px] text-gray-400">{error.message || "予期しないエラーが発生しました"}</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors"
      >
        再読み込み
      </button>
    </div>
  )
}
