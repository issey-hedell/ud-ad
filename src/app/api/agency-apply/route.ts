import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const schema = z.object({
  company_name: z.string().min(1),
  contact_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().optional(),
  business: z.string().optional(),
  agreed: z.literal(true),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容を確認してください" }, { status: 400 })
  }

  const { agreed: _agreed, ...data } = parsed.data

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from("agency_applications").insert(data)
  if (error) {
    console.error("agency_applications insert error:", error)
    return NextResponse.json({ error: "申請の保存に失敗しました" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
