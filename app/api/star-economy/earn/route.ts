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

    const { action, amount, metadata } = await request.json()

    if (!action) {
      return NextResponse.json({ success: false, message: "行为类型不能为空" }, { status: 400 })
    }

    // 赚取规则
    const earningRules = [
      {
        id: "daily_login",
        action: "每日登录",
        baseAmount: 10,
        multiplier: 1,
        dailyLimit: 10,
        description: "每日首次登录获得星币",
        isActive: true,
      },
      {
        id: "create_script",
        action: "创作剧本",
        baseAmount: 50,
        multiplier: 1,
        description: "完成一个剧本创作",
        isActive: true,
      },
      {
        id: "share_work",
        action: "分享作品",
        baseAmount: 20,
        multiplier: 1,
        dailyLimit: 100,
        description: "分享作品到社交平台",
        isActive: true,
      },
    ]

    const rule = earningRules.find((r) => r.action === action)
    if (!rule || !rule.isActive) {
      return NextResponse.json({ success: false, message: "无效的赚取规则" }, { status: 400 })
    }

    // 计算实际赚取金额
    const baseAmount = amount || rule.baseAmount
    let finalAmount = baseAmount * rule.multiplier

    // 检查每日限制（这里简化处理）
    if (rule.dailyLimit && finalAmount > rule.dailyLimit) {
      finalAmount = rule.dailyLimit
    }

    // 模拟更新用户星币余额
    const newBalance = 1250 + finalAmount // 实际应该从数据库更新

    // 记录交易（实际应该保存到数据库）
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: "earn",
      amount: finalAmount,
      source: action,
      description: rule.description,
      metadata,
      timestamp: new Date().toISOString(),
      status: "completed",
    }

    return NextResponse.json({
      success: true,
      amount: finalAmount,
      newBalance,
      transaction,
    })
  } catch (error) {
    console.error("赚取星币失败:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "无效的认证token" }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: "赚取失败，请稍后重试" }, { status: 500 })
  }
}
