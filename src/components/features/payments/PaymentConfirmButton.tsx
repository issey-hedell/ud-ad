"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

type PaymentConfirmButtonProps = {
  reservationId: string
  invoiceId: string
}

export function PaymentConfirmButton({ reservationId, invoiceId }: PaymentConfirmButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 予約ステータスを confirmed に更新
    await supabase
      .from("reservations")
      .update({ status: "confirmed" })
      .eq("id", reservationId)

    // 請求書の paid_at を現在時刻に更新
    await supabase
      .from("invoices")
      .update({ paid_at: new Date().toISOString() })
      .eq("id", invoiceId)

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="px-3 py-1.5 bg-green-600 text-white text-[12px] font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      {loading ? "処理中..." : "入金確認"}
    </button>
  )
}
