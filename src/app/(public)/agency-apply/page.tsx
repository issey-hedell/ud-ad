'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  company_name: z.string().min(1, "会社名を入力してください"),
  contact_name: z.string().min(1, "担当者名を入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  phone: z.string().min(1, "電話番号を入力してください"),
  address: z.string().optional(),
  business: z.string().optional(),
  agreed: z.literal(true, { error: "利用規約への同意が必要です" }),
})

type FormValues = z.infer<typeof schema>

export default function AgencyApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormValues) {
    setServerError(null)
    try {
      const res = await fetch("/api/agency-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setServerError((body as { error?: string }).error ?? "送信に失敗しました。しばらく経ってから再度お試しください。")
        return
      }
      setSubmitted(true)
    } catch {
      setServerError("通信エラーが発生しました。しばらく経ってから再度お試しください。")
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ナビゲーション */}
      <nav className="flex items-center justify-between px-10 h-[60px] border-b border-gray-100 bg-white">
        <a href="/" className="flex items-center gap-2.5 font-semibold text-base">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-ud-navy)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">UD</span>
          </div>
          UDエスカレーター 広告管理
        </a>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* ページタイトル */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold text-[var(--color-ud-blue)] tracking-widest uppercase mb-2">
            AGENCY APPLICATION
          </p>
          <h1 className="text-2xl font-semibold">代理店申請フォーム</h1>
        </div>

        <div className="grid grid-cols-[1fr_1.2fr] gap-12 items-start">
          {/* 左: エスカレーター広告の説明 */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-semibold mb-3">エスカレーター広告とは？</h2>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                商業施設・駅・ビルのエスカレーターに設置されたデジタル・紙面広告枠です。
                乗降客が自然に視線を向ける場所に広告を配置することで、
                高い視認率と滞留時間を実現します。
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  icon: "📍",
                  title: "全国対応",
                  desc: "首都圏から地方まで、幅広い建物・施設に対応しています。",
                },
                {
                  icon: "🖼",
                  title: "複数サイズ展開",
                  desc: "A4・A3・B3など複数のバナーサイズから用途に合わせて選択可能。",
                },
                {
                  icon: "💻",
                  title: "オンライン完結",
                  desc: "空き枠検索から予約・決済・請求書発行まですべてポータル内で完結。",
                },
                {
                  icon: "🤝",
                  title: "広告主への展開",
                  desc: "代理店が広告主向けの申込リンクを発行し、管理を一元化できます。",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold mb-0.5">{title}</p>
                    <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右: 申請フォーム */}
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">✓</div>
              <h3 className="text-base font-semibold text-green-800">申請を受け付けました</h3>
              <p className="text-[13px] text-green-700 leading-relaxed">
                内容を確認のうえ、担当者よりご連絡いたします。<br />
                通常 2〜3 営業日以内にご連絡します。
              </p>
              <a
                href="/"
                className="mt-2 px-6 py-2.5 border border-green-300 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors"
              >
                トップページへ戻る
              </a>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-5"
            >
              <Field label="会社名" required error={errors.company_name?.message}>
                <input
                  {...register("company_name")}
                  placeholder="株式会社〇〇"
                  className={inputClass(!!errors.company_name)}
                />
              </Field>

              <Field label="担当者名" required error={errors.contact_name?.message}>
                <input
                  {...register("contact_name")}
                  placeholder="山田 太郎"
                  className={inputClass(!!errors.contact_name)}
                />
              </Field>

              <Field label="メールアドレス" required error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="contact@example.com"
                  className={inputClass(!!errors.email)}
                />
              </Field>

              <Field label="電話番号" required error={errors.phone?.message}>
                <input
                  {...register("phone")}
                  placeholder="03-0000-0000"
                  className={inputClass(!!errors.phone)}
                />
              </Field>

              <Field label="住所" error={errors.address?.message}>
                <input
                  {...register("address")}
                  placeholder="東京都〇〇区〇〇 1-2-3"
                  className={inputClass(!!errors.address)}
                />
              </Field>

              <Field label="事業内容" error={errors.business?.message}>
                <textarea
                  {...register("business")}
                  placeholder="広告代理業、デジタルマーケティング等"
                  rows={3}
                  className={inputClass(!!errors.business) + " resize-none"}
                />
              </Field>

              {/* 利用規約 */}
              <div className="flex flex-col gap-2">
                <p className="text-[12px] font-semibold text-gray-600">利用規約</p>
                <div className="h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 text-[11px] text-gray-500 leading-relaxed bg-gray-50">
                  <p className="font-semibold mb-1">UDエスカレーター広告管理ポータル 利用規約</p>
                  <p>第1条（目的）本規約は、UDエスカレーター株式会社（以下「当社」）が提供する広告管理ポータル（以下「本サービス」）の利用条件を定めるものです。</p>
                  <p>第2条（代理店登録）代理店として登録を希望する事業者は、本規約に同意の上、当社所定の申請手続きを行うものとします。登録の承認は当社の審査による。</p>
                  <p>第3条（禁止事項）代理店は、法令または公序良俗に反する広告の掲載、虚偽情報の登録、本サービスの不正利用を行ってはなりません。</p>
                  <p>第4条（料金・決済）掲載料金は当社が定める料金表に基づきます。決済はStripeカード決済または請求書払いから選択できます。</p>
                  <p>第5条（解約・退会）代理店は当社所定の手続きにより退会することができます。退会後も掲載中の広告は契約期間終了まで掲載されます。</p>
                  <p>第6条（免責）当社は、本サービスの利用により生じた損害について、当社の故意または重過失による場合を除き、責任を負いません。</p>
                  <p>第7条（準拠法）本規約は日本法に準拠し、東京地方裁判所を専属的合意管轄とします。</p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    {...register("agreed")}
                    className="mt-0.5 accent-[var(--color-ud-navy)]"
                  />
                  <span className="text-[12px] text-gray-600">
                    利用規約を読み、内容に同意します
                  </span>
                </label>
                {errors.agreed && (
                  <p className="text-[11px] text-red-500">{errors.agreed.message}</p>
                )}
              </div>

              {serverError && (
                <p className="text-[12px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[var(--color-ud-navy)] text-white rounded-lg text-[14px] font-medium hover:bg-[var(--color-ud-blue)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "送信中..." : "申請を送信する"}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="px-10 py-8 border-t border-gray-100 mt-16">
        <p className="text-xs text-gray-400 text-center">© 2024 UDエスカレーター株式会社</p>
      </footer>
    </div>
  )
}

function inputClass(hasError: boolean) {
  return [
    "w-full px-3.5 py-2.5 border rounded-lg text-[14px] outline-none transition-colors",
    hasError
      ? "border-red-300 focus:border-red-400 bg-red-50"
      : "border-gray-200 focus:border-[var(--color-ud-blue)] bg-white",
  ].join(" ")
}

type FieldProps = {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-gray-600">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}
