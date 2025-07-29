import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// 模拟用户数据库
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, code, name } = body

    // 验证必填字段
    if (!phone || !code) {
      return NextResponse.json({ success: false, message: "手机号和验证码不能为空" }, { status: 400 })
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: "手机号格式不正确" }, { status: 400 })
    }

    // 验证验证码（模拟验证）
    if (code !== "123456") {
      return NextResponse.json({ success: false, message: "验证码错误" }, { status: 400 })
    }

    // 检查用户是否已存在
    const existingUser = users.find((u) => u.phone === phone)
    if (existingUser) {
      return NextResponse.json({ success: false, message: "该手机号已注册" }, { status: 409 })
    }

    // 加密密码（如果提供了密码）
    let hashedPassword = ""
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, message: "密码长度不能少于6位" }, { status: 400 })
      }
      hashedPassword = await bcrypt.hash(password, 12)
    }

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      phone,
      password: hashedPassword,
      name: name || `用户${phone.slice(-4)}`,
      avatar: "/placeholder.svg?height=40&width=40",
      level: "初级导演",
      starCoins: 100, // 新用户赠送100星币
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    users.push(newUser)

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        phone: newUser.phone,
        name: newUser.name,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    const response = NextResponse.json({
      success: true,
      message: "注册成功",
      data: {
        user: {
          id: newUser.id,
          phone: newUser.phone,
          name: newUser.name,
          avatar: newUser.avatar,
          level: newUser.level,
          starCoins: newUser.starCoins,
        },
        token,
      },
    })

    // 设置HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7天
    })

    return response
  } catch (error) {
    console.error("注册错误:", error)
    return NextResponse.json({ success: false, message: "服务器内部错误" }, { status: 500 })
  }
}
