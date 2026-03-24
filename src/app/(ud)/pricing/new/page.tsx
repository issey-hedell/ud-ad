import { createClient } from "@/lib/supabase/server"
import { PricingForm } from "@/components/features/pricing/PricingForm"
import type { Escalator, BannerSize } from "@/types"

export default async function NewPricingPage() {
  const supabase = await createClient()

  const [{ data: escalators }, { data: bannerSizes }] = await Promise.all([
    supabase.from("escalators").select("id, name, building_id, floor, direction, created_at").order("name"),
    supabase.from("banner_sizes").select("id, name, width_mm, height_mm").order("name"),
  ])

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">料金を設定</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">ESC × バナーサイズの月額料金を設定します</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <PricingForm
          escalators={(escalators ?? []) as Escalator[]}
          bannerSizes={(bannerSizes ?? []) as BannerSize[]}
        />
      </div>
    </div>
  )
}
