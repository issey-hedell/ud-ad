import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { UserRole } from "@/types"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 認証不要のパス
  const publicPaths = ["/", "/login", "/forms"]
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  // 未ログインで保護ルートにアクセス → ログインへリダイレクト
  if (!isPublic && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // ログイン済みの場合、ロールに応じたルート保護
  if (user) {
    const role = user.user_metadata?.role as UserRole | undefined

    // UD管理者エリア
    if (pathname.startsWith("/ud") && role !== "ud_admin") {
      return redirectByRole(role, request)
    }

    // 代理店エリア
    if (pathname.startsWith("/agency") && role !== "agency") {
      return redirectByRole(role, request)
    }

    // 広告主エリア
    if (pathname.startsWith("/advertiser") && role !== "advertiser") {
      return redirectByRole(role, request)
    }

    // ログイン済みでログインページにアクセス → ロール別ダッシュボードへ
    if (pathname === "/login") {
      return redirectByRole(role, request)
    }
  }

  return supabaseResponse
}

function redirectByRole(role: UserRole | undefined, request: NextRequest) {
  const destinations: Record<UserRole, string> = {
    ud_admin: "/ud/dashboard",
    agency: "/agency/search",
    advertiser: "/advertiser/mypage",
  }
  const dest = role ? destinations[role] : "/"
  return NextResponse.redirect(new URL(dest, request.url))
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
