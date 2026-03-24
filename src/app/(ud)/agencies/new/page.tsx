import { AgencyForm } from "@/components/features/agencies/AgencyForm"

export default function NewAgencyPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">代理店を追加</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          代理店を登録し、ログイン用の招待メールを送信します
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <AgencyForm />
      </div>
    </div>
  )
}
