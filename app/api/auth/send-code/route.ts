import { type NextRequest, NextResponse } from "next/server"

interface SendCodeRequest {
  phone: string
  type: "login" | "register"
}

// 模拟验证码存储
const verificationCodes = new Map<string, { code: string; expires: number }>()

// 模拟发送限制
const sendLimits = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: NextRequest) {
  try {
    const body: SendCodeRequest = await request.json()
    const { phone, type } = body

    if (!phone || !type) {
      return NextResponse.json({ success: false, message: "手机号和类型不能为空" }, { status: 400 })
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: "手机号格式不正确" }, { status: 400 })
    }

    // 检查发送频率限制
    const now = Date.now()
    const limit = sendLimits.get(phone)

    if (limit) {
      if (now < limit.resetTime) {
        if (limit.count >= 5) {
          return NextResponse.json({ success: false, message: "发送次数过多，请1小时后再试" }, { status: 429 })
        }
        limit.count++
      } else {
        // 重置计数
        sendLimits.set(phone, { count: 1, resetTime: now + 3600000 }) // 1小时后重置
      }
    } else {
      sendLimits.set(phone, { count: 1, resetTime: now + 3600000 })
    }

    // 生成6位数验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 存储验证码，5分钟有效期
    verificationCodes.set(phone, {
      code,
      expires: now + 300000, // 5分钟
    })

    // 模拟发送短信（实际项目中这里会调用短信服务API）
    console.log(`发送验证码到 ${phone}: ${code}`)

    // 在开发环境下返回验证码（生产环境不应该返回）
    const responseData: any = {
      success: true,
      message: "验证码发送成功",
    }

    if (process.env.NODE_ENV === "development") {
      responseData.code = code // 仅开发环境返回
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("发送验证码错误:", error)
    return NextResponse.json({ success: false, message: "服务器内部错误" }, { status: 500 })
  }
}
