import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

interface RegisterRequest {
  phone: string
  name: string
  password: string
  code: string
}

// 模拟用户数据库
const users = new Map()

// 模拟验证码存储
const verificationCodes = new Map<string, { code: string; expires: number }>()

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { phone, name, password, code } = body

    // 验证必填字段
    if (!phone || !name || !password || !code) {
      return NextResponse.json({ success: false, message: "所有字段都是必填的" }, { status: 400 })
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: "手机号格式不正确" }, { status: 400 })
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "密码长度至少6位" }, { status: 400 })
    }

    // 检查用户是否已存在
    if (users.has(phone)) {
      return NextResponse.json({ success: false, message: "该手机号已注册" }, { status: 409 })
    }

    // 验证验证码
    const storedCode = verificationCodes.get(phone)
    if (!storedCode || storedCode.expires < Date.now()) {
      return NextResponse.json({ success: false, message: "验证码已过期" }, { status: 400 })
    }

    if (storedCode.code !== code) {
      return NextResponse.json({ success: false, message: "验证码错误" }, { status: 400 })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      phone,
      name,
      password: hashedPassword,
      avatar: `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(name)}`,
      level: "新手导演",
      stars: 100, // 注册奖励
      createdAt: new Date().toISOString(),
    }

    users.set(phone, newUser)

    // 清除验证码
    verificationCodes.delete(phone)

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        phone: newUser.phone,
        name: newUser.name,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" },
    )

    const userResponse = {
      id: newUser.id,
      phone: newUser.phone,
      name: newUser.name,
      avatar: newUser.avatar,
      level: newUser.level,
      stars: newUser.stars,
    }

    const response = NextResponse.json({
      success: true,
      message: "注册成功",
      data: {
        user: userResponse,
        token,
      },
    })

    // 设置HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24小时
    })

    return response
  } catch (error) {
    console.error("注册错误:", error)
    return NextResponse.json({ success: false, message: "服务器内部错误" }, { status: 500 })
  }
}
