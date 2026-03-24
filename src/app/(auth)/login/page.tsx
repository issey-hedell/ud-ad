"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/types"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError("メールアドレスまたはパスワードが正しくありません")
      setLoading(false)
      return
    }

    // ロール別リダイレクト
    const role = data.user?.user_metadata?.role as UserRole | undefined
    const destinations: Record<UserRole, string> = {
      ud_admin: "/ud/dashboard",
      agency: "/agency/search",
      advertiser: "/advertiser/mypage",
    }
    router.push(role ? destinations[role] : "/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-ud-blue-light)]">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-ud-navy)] mb-4">
            <span className="text-white font-bold text-xl">UD</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-ud-navy)]">
            UDエスカレーター
          </h1>
          <p className="text-gray-500 text-sm mt-1">広告管理ポータル</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-ud-blue)] focus:border-transparent"
              placeholder="example@company.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-ud-blue)] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[var(--color-ud-blue)] text-white font-semibold rounded-lg hover:bg-[var(--color-ud-navy)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 UDエスカレーター株式会社
        </p>
      </div>
    </div>
  )
}
