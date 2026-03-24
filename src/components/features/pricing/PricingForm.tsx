"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createBrowserClient } from "@supabase/ssr"
import type { Escalator, BannerSize } from "@/types"

const pricingSchema = z.object({
  escalator_id: z.string().min(1, "ESCを選択してください"),
  banner_size_id: z.string().min(1, "バナーサイズを選択してください"),
  price_per_month: z
    .number({ error: "金額を入力してください" })
    .int("整数を入力してください")
    .min(1, "1以上の金額を入力してください"),
})

type PricingFormValues = z.infer<typeof pricingSchema>

type PricingFormProps = {
  escalators: Escalator[]
  bannerSizes: BannerSize[]
  pricingRuleId?: string
  defaultValues?: Partial<PricingFormValues>
}

export function PricingForm({
  escalators,
  bannerSizes,
  pricingRuleId,
  defaultValues,
}: PricingFormProps) {
  const router = useRouter()
  const isEdit = !!pricingRuleId

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      escalator_id: defaultValues?.escalator_id ?? "",
      banner_size_id: defaultValues?.banner_size_id ?? "",
      price_per_month: defaultValues?.price_per_month ?? undefined,
    },
  })

  async function onSubmit(values: PricingFormValues) {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    if (isEdit) {
      await supabase.from("pricing_rules").update(values).eq("id", pricingRuleId)
    } else {
      await supabase.from("pricing_rules").insert(values)
    }

    router.push("/ud/pricing")
    router.refresh()
  }

  const selectClass =
    "border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ud-blue)] focus:border-transparent"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-lg">
      {/* ESC選択 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          エスカレーター <span className="text-red-500">*</span>
        </label>
        <select {...register("escalator_id")} className={selectClass}>
          <option value="">選択してください</option>
          {escalators.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        {errors.escalator_id && (
          <p className="text-[12px] text-red-500">{errors.escalator_id.message}</p>
        )}
      </div>

      {/* バナーサイズ選択 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          バナーサイズ <span className="text-red-500">*</span>
        </label>
        <select {...register("banner_size_id")} className={selectClass}>
          <option value="">選択してください</option>
          {bannerSizes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.width_mm}mm × {s.height_mm}mm)
            </option>
          ))}
        </select>
        {errors.banner_size_id && (
          <p className="text-[12px] text-red-500">{errors.banner_size_id.message}</p>
        )}
      </div>

      {/* 月額料金 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          月額料金（円） <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">¥</span>
          <input
            {...register("price_per_month", { valueAsNumber: true })}
            type="number"
            min={1}
            placeholder="例：80000"
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-ud-blue)] focus:border-transparent"
          />
          <span className="text-gray-400 text-sm">/ 月</span>
        </div>
        {errors.price_per_month && (
          <p className="text-[12px] text-red-500">{errors.price_per_month.message}</p>
        )}
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "保存中..." : isEdit ? "更新する" : "設定する"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/ud/pricing")}
          className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
