"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  badge?: number
}

type NavSection = {
  section: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    section: "管理",
    items: [
      { href: "/ud/dashboard", label: "ダッシュボード" },
      { href: "/ud/buildings", label: "建物一覧" },
      { href: "/ud/escalators", label: "ESC管理" },
      { href: "/ud/pricing", label: "価格設定" },
    ],
  },
  {
    section: "運営",
    items: [
      { href: "/ud/payments", label: "入金管理" },
      { href: "/ud/agencies", label: "代理店管理" },
      { href: "/ud/form-links", label: "フォームURL発行" },
      { href: "/ud/reports", label: "レポート" },
    ],
  },
]

export function UDSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[var(--color-ud-navy)] min-h-screen flex flex-col">
      {/* ロゴ */}
      <div className="px-5 h-14 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
          <span className="text-white text-[11px] font-bold">UD</span>
        </div>
        <span className="text-white text-sm font-semibold">管理者ポータル</span>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-5">
        {navSections.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 px-2 mb-1.5">
              {section}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map(({ href, label, badge }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center justify-between px-2 py-2 rounded-md text-[13px] transition-colors",
                        active
                          ? "bg-white/15 text-white font-medium"
                          : "text-white/60 hover:bg-white/8 hover:text-white/90"
                      )}
                    >
                      <span>{label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
