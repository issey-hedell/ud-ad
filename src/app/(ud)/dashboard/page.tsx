import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  // KPI データ取得（並列）
  const [
    { count: buildingCount },
    { count: escalatorCount },
    { count: activeCount },
    { count: pendingPaymentCount },
    { data: recentReservations },
  ] = await Promise.all([
    supabase.from("buildings").select("*", { count: "exact", head: true }),
    supabase.from("escalators").select("*", { count: "exact", head: true }),
    supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed"),
    supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_payment"),
    supabase
      .from("reservations")
      .select(`
        id,
        start_date,
        end_date,
        status,
        payment_method,
        created_at,
        escalators ( name, buildings ( name ) ),
        agencies ( name )
      `)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const kpis = [
    {
      label: "契約建物数",
      value: buildingCount ?? 0,
      unit: "棟",
      color: "text-[var(--color-ud-navy)]",
      bg: "bg-[var(--color-ud-blue-light)]",
    },
    {
      label: "総ESC数",
      value: escalatorCount ?? 0,
      unit: "基",
      color: "text-[var(--color-ud-blue)]",
      bg: "bg-[var(--color-ud-blue-light)]",
    },
    {
      label: "掲載中",
      value: activeCount ?? 0,
      unit: "件",
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "未入金",
      value: pendingPaymentCount ?? 0,
      unit: "件",
      color: pendingPaymentCount ? "text-red-700" : "text-gray-600",
      bg: pendingPaymentCount ? "bg-red-50" : "bg-gray-50",
    },
  ]

  const statusLabel: Record<string, { text: string; cls: string }> = {
    pending: { text: "申請中", cls: "bg-gray-100 text-gray-600" },
    pending_payment: { text: "入金待ち", cls: "bg-orange-100 text-orange-700" },
    confirmed: { text: "確定", cls: "bg-green-100 text-green-700" },
    cancelled: { text: "キャンセル", cls: "bg-red-100 text-red-600" },
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* ページタイトル */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">ダッシュボード</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">UDエスカレーター広告管理の概要</p>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, unit, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-[12px] text-gray-400 font-medium mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>
              {value.toLocaleString()}
              <span className="text-base font-medium ml-1">{unit}</span>
            </p>
            <div className={`mt-3 w-8 h-1.5 rounded-full ${bg}`} />
          </div>
        ))}
      </div>

      {/* 最近の予約 */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">最近の予約</h2>
          <span className="text-[12px] text-gray-400">直近10件</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["代理店", "建物 / ESC", "掲載期間", "支払方法", "ステータス"].map((h) => (
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
              {recentReservations && recentReservations.length > 0 ? (
                recentReservations.map((r) => {
                  const esc = r.escalators as unknown as { name: string; buildings: { name: string } | null } | null
                  const agency = r.agencies as unknown as { name: string } | null
                  const status = statusLabel[r.status] ?? { text: r.status, cls: "bg-gray-100 text-gray-500" }
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-700">{agency?.name ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {esc?.buildings?.name ?? "—"} / {esc?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {r.start_date} 〜 {r.end_date}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {r.payment_method === "card" ? "カード" : "請求書"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${status.cls}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-[13px]">
                    予約データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
