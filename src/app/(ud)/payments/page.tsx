import { createClient } from "@/lib/supabase/server"
import { PaymentConfirmButton } from "@/components/features/payments/PaymentConfirmButton"

export default async function PaymentsPage() {
  const supabase = await createClient()

  // pending_payment の予約を取得（JOIN: agencies, escalators, buildings, invoices）
  const { data: pendingReservations } = await supabase
    .from("reservations")
    .select(`
      id,
      start_date,
      end_date,
      payment_method,
      created_at,
      escalators ( name, buildings ( name ) ),
      agencies ( name ),
      invoices ( id, amount, issued_at, paid_at )
    `)
    .eq("status", "pending_payment")
    .order("created_at", { ascending: true })

  // 確認済み（最近30件）
  const { data: confirmedReservations } = await supabase
    .from("reservations")
    .select(`
      id,
      start_date,
      end_date,
      payment_method,
      created_at,
      escalators ( name, buildings ( name ) ),
      agencies ( name ),
      invoices ( id, amount, paid_at )
    `)
    .eq("status", "confirmed")
    .eq("payment_method", "invoice")
    .order("created_at", { ascending: false })
    .limit(30)

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* ヘッダー */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">入金管理</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">振込入金の確認・管理を行います</p>
      </div>

      {/* 未入金アラート */}
      {pendingReservations && pendingReservations.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
          <p className="text-[13px] text-orange-700 font-medium">
            入金待ちが {pendingReservations.length} 件あります
          </p>
        </div>
      )}

      {/* 入金待ちテーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">
            入金待ち
            <span className="ml-2 text-[12px] font-normal text-orange-600">
              {pendingReservations?.length ?? 0}件
            </span>
          </h2>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["代理店", "建物 / ESC", "掲載期間", "請求金額", "請求日", ""].map((h) => (
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
            {pendingReservations && pendingReservations.length > 0 ? (
              pendingReservations.map((r) => {
                const esc = r.escalators as unknown as { name: string; buildings: { name: string } | null } | null
                const agency = r.agencies as unknown as { name: string } | null
                const invoices = r.invoices as unknown as { id: string; amount: number; issued_at: string; paid_at: string | null }[] | null
                const invoice = invoices?.[0]

                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{agency?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {esc?.buildings?.name ?? "—"} / {esc?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {r.start_date} 〜 {r.end_date}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      {invoice ? `¥${invoice.amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {invoice ? new Date(invoice.issued_at).toLocaleDateString("ja-JP") : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {invoice && (
                        <PaymentConfirmButton
                          reservationId={r.id}
                          invoiceId={invoice.id}
                        />
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                  入金待ちの案件はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 入金済み履歴 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">
            入金済み
            <span className="ml-2 text-[12px] font-normal text-gray-400">直近30件</span>
          </h2>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["代理店", "建物 / ESC", "掲載期間", "金額", "入金確認日"].map((h) => (
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
            {confirmedReservations && confirmedReservations.length > 0 ? (
              confirmedReservations.map((r) => {
                const esc = r.escalators as unknown as { name: string; buildings: { name: string } | null } | null
                const agency = r.agencies as unknown as { name: string } | null
                const invoices = r.invoices as unknown as { id: string; amount: number; paid_at: string | null }[] | null
                const invoice = invoices?.[0]

                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-700">{agency?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {esc?.buildings?.name ?? "—"} / {esc?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {r.start_date} 〜 {r.end_date}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {invoice ? `¥${invoice.amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {invoice?.paid_at
                          ? new Date(invoice.paid_at).toLocaleDateString("ja-JP")
                          : "—"}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  入金済みの履歴はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
