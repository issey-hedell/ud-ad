import Link from "next/link"

export default function TopPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ナビゲーション */}
      <nav className="flex items-center justify-between px-10 h-[60px] border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2.5 font-semibold text-base">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-ud-navy)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">UD</span>
          </div>
          UDエスカレーター 広告管理
        </div>
        <Link
          href="/login"
          className="px-5 py-2 bg-[var(--color-ud-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-ud-blue)] transition-colors"
        >
          ログイン
        </Link>
      </nav>

      {/* ヒーロー */}
      <section className="px-10 py-20 flex items-center gap-12 border-b border-gray-50">
        <div className="flex-1 max-w-[520px]">
          <p className="text-xs font-semibold text-[var(--color-ud-blue)] tracking-widest uppercase mb-4">
            AD Management Portal
          </p>
          <h1 className="text-4xl font-semibold leading-snug mb-5">
            エスカレーター広告を<br />
            <span className="text-[var(--color-ud-navy)]">スマートに管理</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
            UD管理者・代理店・広告主の3者が連携できる<br />
            統合型広告管理ポータルです。
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/login"
              className="px-7 py-3 bg-[var(--color-ud-navy)] text-white rounded-lg text-[15px] font-medium hover:bg-[var(--color-ud-blue)] transition-colors"
            >
              ログインして始める
            </Link>
            <a
              href="#roles"
              className="px-6 py-3 border border-gray-300 rounded-lg text-[15px] text-gray-500 hover:bg-gray-50 transition-colors"
            >
              詳しく見る
            </a>
          </div>
        </div>

        {/* ヒーロービジュアル */}
        <div className="flex-[0_0_340px]">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col gap-3">
            {[
              { label: "掲載中の広告枠", value: "128 枠", color: "text-[var(--color-ud-blue)]" },
              { label: "今月の予約件数", value: "47 件", color: "text-[var(--color-agency-purple)]" },
              { label: "登録代理店数", value: "12 社", color: "text-[var(--color-ud-navy)]" },
              { label: "対応建物数", value: "38 棟", color: "text-gray-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-1.5 flex-1 bg-gray-200 rounded-full" />
                <span className="text-[11px] text-gray-400 min-w-[120px]">{label}</span>
                <span className={`text-[13px] font-semibold min-w-[52px] text-right ${color}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ロール別ログインカード */}
      <section id="roles" className="px-10 py-16 bg-gray-50 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-center mb-1.5">ご利用者別ログイン</h2>
        <p className="text-sm text-gray-400 text-center mb-10">
          役割に応じたポータルにアクセスできます
        </p>

        <div className="grid grid-cols-3 gap-5 max-w-4xl mx-auto">
          {/* UD管理者 */}
          <RoleCard
            iconBg="bg-[var(--color-ud-blue-light)]"
            iconText="UD"
            iconColor="text-[var(--color-ud-blue)]"
            role="UD管理者"
            roleColor="text-[var(--color-ud-blue)]"
            title="UD管理者ポータル"
            desc="建物・ESC管理、代理店・価格・入金管理を行うUD社専用ダッシュボード"
            features={["建物・ESC・バナー管理", "代理店・価格設定", "入金確認・レポート"]}
            dotColor="bg-[var(--color-ud-blue)]"
            btnClass="border-blue-200 text-[var(--color-ud-blue)] hover:bg-[var(--color-ud-blue-light)]"
          />

          {/* 代理店 */}
          <RoleCard
            iconBg="bg-[var(--color-agency-purple-light)]"
            iconText="AG"
            iconColor="text-[var(--color-agency-purple)]"
            role="広告代理店"
            roleColor="text-[var(--color-agency-purple)]"
            title="代理店ポータル"
            desc="空き枠検索・予約・決済・請求書管理を行う代理店専用ポータル"
            features={["空き枠検索・予約", "Stripe決済・請求書", "広告主リンク発行"]}
            dotColor="bg-[var(--color-agency-purple)]"
            btnClass="border-purple-200 text-[var(--color-agency-purple)] hover:bg-[var(--color-agency-purple-light)]"
          />

          {/* 広告主 */}
          <RoleCard
            iconBg="bg-[var(--color-advertiser-coral-light)]"
            iconText="AD"
            iconColor="text-[var(--color-advertiser-coral)]"
            role="広告主"
            roleColor="text-[var(--color-advertiser-coral)]"
            title="広告主マイページ"
            desc="掲載申込・掲載状況の確認ができる広告主専用マイページ"
            features={["掲載申込", "掲載状況確認", "契約履歴"]}
            dotColor="bg-[var(--color-advertiser-coral)]"
            btnClass="border-orange-200 text-[var(--color-advertiser-coral)] hover:bg-[var(--color-advertiser-coral-light)]"
          />
        </div>
      </section>

      {/* 利用ステップ */}
      <section className="px-10 py-16 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-center mb-1.5">ご利用の流れ</h2>
        <p className="text-sm text-gray-400 text-center mb-10">
          シンプルなステップで広告掲載が完了
        </p>
        <div className="grid grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { num: "1", title: "空き枠検索", desc: "代理店がエスカレーター・期間・サイズを指定して空き枠を検索します。" },
            { num: "2", title: "予約・決済", desc: "希望枠を選択してStripe決済または請求書払いで予約を確定します。" },
            { num: "3", title: "掲載開始", desc: "入金確認後、掲載が開始されます。広告主はマイページで状況を確認できます。" },
          ].map(({ num, title, desc }) => (
            <div key={num} className="flex flex-col gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--color-ud-blue-light)] flex items-center justify-center text-sm font-semibold text-[var(--color-ud-blue)]">
                {num}
              </div>
              <p className="text-[15px] font-semibold">{title}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="px-10 py-8 flex items-center justify-between border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2024 UDエスカレーター株式会社</p>
        <div className="flex gap-5">
          <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">プライバシーポリシー</span>
          <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">利用規約</span>
          <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">お問い合わせ</span>
        </div>
      </footer>
    </div>
  )
}

type RoleCardProps = {
  iconBg: string
  iconText: string
  iconColor: string
  role: string
  roleColor: string
  title: string
  desc: string
  features: string[]
  dotColor: string
  btnClass: string
}

function RoleCard({
  iconBg, iconText, iconColor, role, roleColor,
  title, desc, features, dotColor, btnClass,
}: RoleCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-7 flex flex-col gap-3">
      <div className={`w-11 h-11 rounded-[10px] flex items-center justify-center ${iconBg}`}>
        <span className={`font-bold text-sm ${iconColor}`}>{iconText}</span>
      </div>
      <div>
        <p className={`text-[11px] font-semibold tracking-wider uppercase mb-0.5 ${roleColor}`}>
          {role}
        </p>
        <p className="text-base font-semibold">{title}</p>
      </div>
      <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
      <ul className="flex flex-col gap-1.5 mt-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[12px] text-gray-500">
            <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`mt-auto w-full py-2.5 border rounded-lg text-sm font-medium text-center transition-colors ${btnClass}`}
      >
        ログイン
      </Link>
    </div>
  )
}
