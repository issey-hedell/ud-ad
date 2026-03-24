import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

type Props = {
  params: Promise<{ id: string }>
}

export default async function BuildingDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: building }, { data: escalators }] = await Promise.all([
    supabase.from("buildings").select("*").eq("id", id).single(),
    supabase
      .from("escalators")
      .select("*")
      .eq("building_id", id)
      .order("created_at", { ascending: true }),
  ])

  if (!building) notFound()

  const directionLabel: Record<string, string> = {
    up: "上り",
    down: "下り",
    both: "上下",
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/ud/buildings" className="text-[12px] text-gray-400 hover:text-gray-600">
              建物管理
            </Link>
            <span className="text-gray-300 text-[12px]">/</span>
            <span className="text-[12px] text-gray-500">{building.name}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{building.name}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{building.address}</p>
        </div>
        <Link
          href={`/ud/buildings/${id}/escalators/new`}
          className="px-5 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors"
        >
          + ESCを追加
        </Link>
      </div>

      {/* 建物情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-[13px] font-semibold text-gray-700 mb-3">建物情報</h2>
        <dl className="grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <dt className="text-gray-400 text-[11px] font-medium uppercase tracking-wide mb-0.5">建物名</dt>
            <dd className="text-gray-800">{building.name}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-[11px] font-medium uppercase tracking-wide mb-0.5">住所</dt>
            <dd className="text-gray-800">{building.address}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-[11px] font-medium uppercase tracking-wide mb-0.5">ESC数</dt>
            <dd className="text-gray-800">{escalators?.length ?? 0} 基</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-[11px] font-medium uppercase tracking-wide mb-0.5">登録日</dt>
            <dd className="text-gray-800">
              {new Date(building.created_at).toLocaleDateString("ja-JP")}
            </dd>
          </div>
        </dl>
      </div>

      {/* ESC一覧 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">
            エスカレーター一覧
            <span className="ml-2 text-[12px] font-normal text-gray-400">
              {escalators?.length ?? 0}基
            </span>
          </h2>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["ESC名", "フロア", "方向", ""].map((h) => (
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
            {escalators && escalators.length > 0 ? (
              escalators.map((esc) => (
                <tr key={esc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{esc.name}</td>
                  <td className="px-5 py-3 text-gray-600">{esc.floor}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {directionLabel[esc.direction] ?? esc.direction}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/ud/pricing?escalator=${esc.id}`}
                      className="text-[var(--color-ud-blue)] hover:underline text-[12px]"
                    >
                      価格設定 →
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                  エスカレーターが登録されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
