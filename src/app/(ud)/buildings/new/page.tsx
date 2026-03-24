import { BuildingForm } from "@/components/features/buildings/BuildingForm"

export default function NewBuildingPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">建物を追加</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">新しい建物を登録します</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <BuildingForm />
      </div>
    </div>
  )
}
