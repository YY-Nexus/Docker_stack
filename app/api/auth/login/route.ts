import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// 模拟用户数据库
const users = [
  {
    id: "1",
    phone: "13800138000",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qK", // password123
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40",
    level: "初级导演",
    starCoins: 1000,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, code, loginType } = body

    if (!phone) {
      return NextResponse.json({ success: false, message: "请输入手机号" }, { status: 400 })
    }

    // 验证码登录
    if (loginType === "code") {
      if (!code) {
        return NextResponse.json({ success: false, message: "请输入验证码" }, { status: 400 })
      }

      // 模拟验证码验证（实际应该从Redis或数据库验证）
      if (code !== "123456") {
        return NextResponse.json({ success: false, message: "验证码错误" }, { status: 400 })
      }

      // 查找或创建用户
      let user = users.find((u) => u.phone === phone)
      if (!user) {
        // 自动注册新用户
        user = {
          id: Date.now().toString(),
          phone,
          password: "",
          name: `用户${phone.slice(-4)}`,
          avatar: "/placeholder.svg?height=40&width=40",
          level: "初级导演",
          starCoins: 100,
          createdAt: new Date().toISOString(),
        }
        users.push(user)
      }

      // 生成JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          name: user.name,
        },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" },
      )

      const response = NextResponse.json({
        success: true,
        message: "登录成功",
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            avatar: user.avatar,
            level: user.level,
            starCoins: user.starCoins,
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
    }

    // 密码登录
    if (loginType === "password") {
      if (!password) {
        return NextResponse.json({ success: false, message: "请输入密码" }, { status: 400 })
      }

      const user = users.find((u) => u.phone === phone)
      if (!user) {
        return NextResponse.json({ success: false, message: "用户不存在" }, { status: 404 })
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ success: false, message: "密码错误" }, { status: 400 })
      }

      // 生成JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          name: user.name,
        },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" },
      )

      const response = NextResponse.json({
        success: true,
        message: "登录成功",
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            avatar: user.avatar,
            level: user.level,
            starCoins: user.starCoins,
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
    }

    return NextResponse.json({ success: false, message: "无效的登录类型" }, { status: 400 })
  } catch (error) {
    console.error("登录错误:", error)
    return NextResponse.json({ success: false, message: "服务器内部错误" }, { status: 500 })
  }
}
