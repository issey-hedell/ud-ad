import Link from "next/link"

export default function UDNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-4xl font-bold text-gray-200">404</p>
      <p className="text-xl font-semibold text-gray-800">ページが見つかりません</p>
      <p className="text-[13px] text-gray-400">
        お探しのページは存在しないか、移動した可能性があります
      </p>
      <Link
        href="/ud/dashboard"
        className="px-5 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors"
      >
        ダッシュボードに戻る
      </Link>
    </div>
  )
}
