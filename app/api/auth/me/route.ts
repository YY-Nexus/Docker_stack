import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// 模拟用户数据库
const users = new Map([
  [
    "13800138000",
    {
      id: "1",
      phone: "13800138000",
      name: "张文豪",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS",
      avatar: "/images/avatar-1.png",
      level: "导演",
      stars: 1580,
      createdAt: new Date().toISOString(),
    },
  ],
])

export async function GET(request: NextRequest) {
  try {
    // 从cookie或Authorization header获取token
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // 获取用户信息
    const user = users.get(decoded.phone)

    if (!user) {
      return NextResponse.json({ success: false, message: "用户不存在" }, { status: 404 })
    }

    const userResponse = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      stars: user.stars,
    }

    return NextResponse.json({
      success: true,
      data: { user: userResponse },
    })
  } catch (error) {
    console.error("获取用户信息错误:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "Token无效" }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: "服务器内部错误" }, { status: 500 })
  }
}
