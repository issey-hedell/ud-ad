import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function PricingPage() {
  const supabase = await createClient()

  const [{ data: pricingRules }, { data: escalators }, { data: bannerSizes }] = await Promise.all([
    supabase
      .from("pricing_rules")
      .select(`
        id,
        price_per_month,
        created_at,
        escalators ( id, name, buildings ( name ) ),
        banner_sizes ( id, name, width_mm, height_mm )
      `)
      .order("created_at", { ascending: false }),
    supabase.from("escalators").select("id, name").order("name"),
    supabase.from("banner_sizes").select("id, name, width_mm, height_mm").order("name"),
  ])

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">価格設定</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            ESC × バナーサイズ の月額料金を管理します
          </p>
        </div>
        <Link
          href="/ud/pricing/new"
          className="px-5 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors"
        >
          + 料金を追加
        </Link>
      </div>

      {/* サマリ */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-400 font-medium mb-1">設定済み料金ルール</p>
          <p className="text-2xl font-bold text-[var(--color-ud-navy)]">
            {pricingRules?.length ?? 0}
            <span className="text-sm font-medium ml-1">件</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-400 font-medium mb-1">登録ESC数</p>
          <p className="text-2xl font-bold text-[var(--color-ud-blue)]">
            {escalators?.length ?? 0}
            <span className="text-sm font-medium ml-1">基</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[11px] text-gray-400 font-medium mb-1">バナーサイズ</p>
          <p className="text-2xl font-bold text-gray-700">
            {bannerSizes?.length ?? 0}
            <span className="text-sm font-medium ml-1">種</span>
          </p>
        </div>
      </div>

      {/* 料金テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["建物 / ESC", "バナーサイズ", "月額料金", "設定日", ""].map((h) => (
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
            {pricingRules && pricingRules.length > 0 ? (
              pricingRules.map((r) => {
                const esc = r.escalators as unknown as { id: string; name: string; buildings: { name: string } | null } | null
                const size = r.banner_sizes as unknown as { id: string; name: string; width_mm: number; height_mm: number } | null
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-700">
                      <span className="text-gray-400">{esc?.buildings?.name ?? "—"} / </span>
                      {esc?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {size ? `${size.name} (${size.width_mm}×${size.height_mm}mm)` : "—"}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      ¥{r.price_per_month.toLocaleString()}
                      <span className="text-[11px] font-normal text-gray-400 ml-1">/ 月</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/ud/pricing/${r.id}/edit`}
                        className="text-[var(--color-ud-blue)] hover:underline text-[12px]"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  料金ルールが設定されていません。
                  <Link href="/ud/pricing/new" className="text-[var(--color-ud-blue)] hover:underline ml-1">
                    最初の料金を設定する
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
