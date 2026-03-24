"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createBrowserClient } from "@supabase/ssr"

const buildingSchema = z.object({
  name: z.string().min(1, "建物名を入力してください"),
  address: z.string().min(1, "住所を入力してください"),
})

type BuildingFormValues = z.infer<typeof buildingSchema>

type BuildingFormProps = {
  defaultValues?: BuildingFormValues
  buildingId?: string
}

export function BuildingForm({ defaultValues, buildingId }: BuildingFormProps) {
  const router = useRouter()
  const isEdit = !!buildingId

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: defaultValues ?? { name: "", address: "" },
  })

  async function onSubmit(values: BuildingFormValues) {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    if (isEdit) {
      await supabase.from("buildings").update(values).eq("id", buildingId)
    } else {
      await supabase.from("buildings").insert(values)
    }

    router.push("/ud/buildings")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-lg">
      {/* 建物名 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          建物名 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="例：渋谷スクランブルスクエア"
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-ud-blue)] focus:border-transparent"
        />
        {errors.name && (
          <p className="text-[12px] text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* 住所 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          住所 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("address")}
          type="text"
          placeholder="例：東京都渋谷区渋谷2-24-12"
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-ud-blue)] focus:border-transparent"
        />
        {errors.address && (
          <p className="text-[12px] text-red-500">{errors.address.message}</p>
        )}
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "保存中..." : isEdit ? "更新する" : "追加する"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/ud/buildings")}
          className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
