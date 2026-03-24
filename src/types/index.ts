// ユーザーロール定義
export type UserRole = "ud_admin" | "agency" | "advertiser"

// 建物
export type Building = {
  id: string
  name: string
  address: string
  created_at: string
}

// エスカレーター
export type Escalator = {
  id: string
  building_id: string
  name: string
  floor: string
  direction: "up" | "down" | "both"
  created_at: string
}

// バナーサイズ
export type BannerSize = {
  id: string
  name: string
  width_mm: number
  height_mm: number
}

// 料金ルール
export type PricingRule = {
  id: string
  escalator_id: string
  banner_size_id: string
  price_per_month: number
  created_at: string
}

// 代理店
export type Agency = {
  id: string
  name: string
  email: string
  created_at: string
}

// 広告主
export type Advertiser = {
  id: string
  agency_id: string
  name: string
  email: string
  created_at: string
}

// 予約・掲載管理
export type Reservation = {
  id: string
  escalator_id: string
  agency_id: string
  advertiser_id: string | null
  start_date: string
  end_date: string
  payment_method: "card" | "invoice"
  status: "pending" | "pending_payment" | "confirmed" | "cancelled"
  stripe_payment_intent_id: string | null
  created_at: string
}

// 請求書
export type Invoice = {
  id: string
  reservation_id: string
  amount: number
  pdf_url: string | null
  issued_at: string
  paid_at: string | null
}

// 広告主申込リンク
export type InquiryLink = {
  id: string
  agency_id: string
  token: string
  expires_at: string | null
  created_at: string
}

// 建物オーナーフォーム
export type BuildingForm = {
  id: string
  token: string
  building_id: string | null
  submitted_at: string | null
  created_at: string
}
