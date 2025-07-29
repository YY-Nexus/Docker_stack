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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // 模拟交易数据
    const mockTransactions = [
      {
        id: "txn_001",
        userId,
        type: "earn",
        amount: 50,
        source: "创作剧本",
        description: "完成剧本《洛神传说》创作",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: "completed",
      },
      {
        id: "txn_002",
        userId,
        type: "spend",
        amount: 30,
        source: "购买道具",
        description: "购买古风背景音乐",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: "completed",
      },
      {
        id: "txn_003",
        userId,
        type: "earn",
        amount: 20,
        source: "分享作品",
        description: "分享作品到微信朋友圈",
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        status: "completed",
      },
    ]

    const paginatedTransactions = mockTransactions.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total: mockTransactions.length,
        hasMore: offset + limit < mockTransactions.length,
      },
    })
  } catch (error) {
    console.error("获取交易历史失败:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "无效的认证token" }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: "获取交易历史失败，请稍后重试" }, { status: 500 })
  }
}
