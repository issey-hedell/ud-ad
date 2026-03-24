import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function BuildingsPage() {
  const supabase = await createClient()

  // 建物一覧 + ESC数
  const { data: buildings } = await supabase
    .from("buildings")
    .select(`
      id,
      name,
      address,
      created_at,
      escalators ( id )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">建物管理</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {buildings?.length ?? 0}棟登録済み
          </p>
        </div>
        <Link
          href="/ud/buildings/new"
          className="px-5 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors"
        >
          + 建物を追加
        </Link>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["建物名", "住所", "ESC数", "登録日", ""].map((h) => (
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
            {buildings && buildings.length > 0 ? (
              buildings.map((b) => {
                const escCount = Array.isArray(b.escalators) ? b.escalators.length : 0
                return (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{b.name}</td>
                    <td className="px-5 py-3 text-gray-500">{b.address}</td>
                    <td className="px-5 py-3 text-gray-600">{escCount} 基</td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(b.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/ud/buildings/${b.id}`}
                        className="text-[var(--color-ud-blue)] hover:underline text-[12px]"
                      >
                        詳細 →
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  建物が登録されていません。
                  <Link href="/ud/buildings/new" className="text-[var(--color-ud-blue)] hover:underline ml-1">
                    最初の建物を追加する
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
