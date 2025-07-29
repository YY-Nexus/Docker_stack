import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "未提供认证token" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // 模拟星币数据（实际应该从数据库查询）
    const starCoins = {
      balance: 1250,
      totalEarned: 2500,
      totalSpent: 1250,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: starCoins,
    })
  } catch (error) {
    console.error("获取星币余额失败:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "无效的认证token" }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: "获取余额失败，请稍后重试" }, { status: 500 })
  }
}
