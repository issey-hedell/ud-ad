import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  const { email, agencyId } = await req.json()

  if (!email || !agencyId) {
    return NextResponse.json({ error: "email と agencyId は必須です" }, { status: 400 })
  }

  // Service Role クライアントで Admin API を使用
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      role: "agency",
      agency_id: agencyId,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
