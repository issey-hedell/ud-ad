import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UDSidebar } from "@/components/layout/UDSidebar"
import { UDHeader } from "@/components/layout/UDHeader"

export default async function UDLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== "ud_admin") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UDSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <UDHeader userEmail={user.email ?? ""} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
