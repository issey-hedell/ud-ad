"use client"

import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

type UDHeaderProps = {
  userEmail: string
}

export function UDHeader({ userEmail }: UDHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6">
      {/* 左余白（サイドバーと高さを揃えるため） */}
      <div />

      {/* 右: ユーザー情報 + ログアウト */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--color-ud-blue-light)] flex items-center justify-center">
            <span className="text-[var(--color-ud-blue)] text-[11px] font-semibold">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-[13px] text-gray-600">{userEmail}</span>
          <span className="text-[10px] font-semibold text-[var(--color-ud-blue)] bg-[var(--color-ud-blue-light)] px-2 py-0.5 rounded-full">
            UD管理者
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
