import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

interface LoginRequest {
  phone: string
  password?: string
  code?: string
}

// 模拟用户数据库
const users = new Map([
  [
    "13800138000",
    {
      id: "1",
      phone: "13800138000",
      name: "张文豪",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5S/kS", // password123
      avatar: "/images/avatar-1.png",
      level: "导演",
      stars: 1580,
      createdAt: new Date().toISOString(),
    },
  ],
])

// 模拟验证码存储
const verificationCodes = new Map<string, { code: string; expires: number }>()

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { phone, password, code } = body

    if (!phone) {
      return NextResponse.json({ success: false, message: "手机号不能为空" }, { status: 400 })
    }

    const user = users.get(phone)

    if (!user) {
      return NextResponse.json({ success: false, message: "用户不存在" }, { status: 404 })
    }

    // 验证码登录
    if (code) {
      const storedCode = verificationCodes.get(phone)
      if (!storedCode || storedCode.expires < Date.now()) {
        return NextResponse.json({ success: false, message: "验证码已过期" }, { status: 400 })
      }

      if (storedCode.code !== code) {
        return NextResponse.json({ success: false, message: "验证码错误" }, { status: 400 })
      }

      // 清除验证码
      verificationCodes.delete(phone)
    }
    // 密码登录
    else if (password) {
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ success: false, message: "密码错误" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ success: false, message: "请提供密码或验证码" }, { status: 400 })
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        name: user.name,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" },
    )

    const userResponse = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      stars: user.stars,
    }

    const response = NextResponse.json({
      success: true,
      message: "登录成功",
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
    console.error("登录错误:", error)
    return NextResponse.json({ success: false, message: "服务器内部错误" }, { status: 500 })
  }
}
