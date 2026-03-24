import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function AgenciesPage() {
  const supabase = await createClient()

  const { data: agencies } = await supabase
    .from("agencies")
    .select(`
      id,
      name,
      email,
      created_at,
      advertisers ( id )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">代理店管理</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {agencies?.length ?? 0}社登録済み
          </p>
        </div>
        <Link
          href="/ud/agencies/new"
          className="px-5 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors"
        >
          + 代理店を追加
        </Link>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["代理店名", "メールアドレス", "広告主数", "登録日"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agencies && agencies.length > 0 ? (
              agencies.map((a) => {
                const advertiserCount = Array.isArray(a.advertisers) ? a.advertisers.length : 0
                return (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{a.name}</td>
                    <td className="px-5 py-3 text-gray-500">{a.email}</td>
                    <td className="px-5 py-3 text-gray-600">{advertiserCount} 社</td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(a.created_at).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                  代理店が登録されていません。
                  <Link href="/ud/agencies/new" className="text-[var(--color-ud-blue)] hover:underline ml-1">
                    最初の代理店を追加する
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
