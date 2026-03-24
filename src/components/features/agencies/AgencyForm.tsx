"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createBrowserClient } from "@supabase/ssr"

const agencySchema = z.object({
  name: z.string().min(1, "代理店名を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
})

type AgencyFormValues = z.infer<typeof agencySchema>

export function AgencyForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgencyFormValues>({
    resolver: zodResolver(agencySchema),
    defaultValues: { name: "", email: "" },
  })

  async function onSubmit(values: AgencyFormValues) {
    setServerError(null)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // agencies テーブルに追加
    const { data: agency, error: insertError } = await supabase
      .from("agencies")
      .insert({ name: values.name, email: values.email })
      .select("id")
      .single()

    if (insertError || !agency) {
      setServerError("代理店の登録に失敗しました")
      return
    }

    // Supabase Auth に招待メール送信（Service Role が必要なため API Route 経由）
    const res = await fetch("/api/agencies/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email, agencyId: agency.id }),
    })

    if (!res.ok) {
      setServerError("代理店は登録されましたが、招待メールの送信に失敗しました")
      return
    }

    router.push("/ud/agencies")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-lg">
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700">
          {serverError}
        </div>
      )}

      {/* 代理店名 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          代理店名 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="例：株式会社〇〇広告"
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-ud-blue)] focus:border-transparent"
        />
        {errors.name && (
          <p className="text-[12px] text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* メールアドレス */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="例：contact@agency.co.jp"
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-ud-blue)] focus:border-transparent"
        />
        {errors.email && (
          <p className="text-[12px] text-red-500">{errors.email.message}</p>
        )}
        <p className="text-[11px] text-gray-400">
          登録後、このメールアドレス宛に招待メールが送信されます
        </p>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "登録中..." : "登録して招待する"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/ud/agencies")}
          className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
