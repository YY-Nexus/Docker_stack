import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "未提供认证token" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const { amount, purpose, description, metadata } = await request.json()

    if (!amount || !purpose || !description) {
      return NextResponse.json({ success: false, message: "金额、用途和描述不能为空" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ success: false, message: "金额必须大于0" }, { status: 400 })
    }

    // 模拟检查用户余额
    const currentBalance = 1250 // 实际应该从数据库查询

    if (currentBalance < amount) {
      return NextResponse.json({ success: false, message: "星币余额不足" }, { status: 400 })
    }

    // 模拟更新用户星币余额
    const newBalance = currentBalance - amount

    // 记录交易（实际应该保存到数据库）
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: "spend",
      amount,
      source: purpose,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      status: "completed",
    }

    return NextResponse.json({
      success: true,
      newBalance,
      transaction,
    })
  } catch (error) {
    console.error("消费星币失败:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "无效的认证token" }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: "消费失败，请稍后重试" }, { status: 500 })
  }
}
