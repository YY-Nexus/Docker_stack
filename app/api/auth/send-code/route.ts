import { type NextRequest, NextResponse } from "next/server"

// 模拟验证码存储（实际应该使用Redis）
const verificationCodes = new Map<string, { code: string; expires: number; attempts: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, type = "login" } = body

    if (!phone) {
      return NextResponse.json({ success: false, message: "请输入手机号" }, { status: 400 })
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: "手机号格式不正确" }, { status: 400 })
    }

    // 检查发送频率限制
    const existing = verificationCodes.get(phone)
    if (existing && existing.expires > Date.now()) {
      const remainingTime = Math.ceil((existing.expires - Date.now()) / 1000)
      return NextResponse.json({ success: false, message: `请等待${remainingTime}秒后再试` }, { status: 429 })
    }

    // 生成6位数验证码
    const code = Math.random().toString().slice(2, 8).padStart(6, "0")

    // 存储验证码（5分钟有效期）
    verificationCodes.set(phone, {
      code,
      expires: Date.now() + 5 * 60 * 1000, // 5分钟
      attempts: 0,
    })

    // 模拟发送短信（实际应该调用短信服务API）
    console.log(`发送验证码到 ${phone}: ${code}`)

    // 在开发环境下返回验证码（生产环境不应该返回）
    const responseData: any = {
      success: true,
      message: "验证码发送成功",
      data: {
        phone,
        expiresIn: 300, // 5分钟
      },
    }

    // 开发环境下返回验证码便于测试
    if (process.env.NODE_ENV === "development") {
      responseData.data.code = code
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("发送验证码错误:", error)
    return NextResponse.json({ success: false, message: "服务器内部错误" }, { status: 500 })
  }
}

// 验证验证码的辅助函数
export function verifyCode(phone: string, inputCode: string): boolean {
  const stored = verificationCodes.get(phone)

  if (!stored) {
    return false
  }

  // 检查是否过期
  if (stored.expires < Date.now()) {
    verificationCodes.delete(phone)
    return false
  }

  // 检查尝试次数
  if (stored.attempts >= 3) {
    verificationCodes.delete(phone)
    return false
  }

  // 增加尝试次数
  stored.attempts++

  // 验证码匹配
  if (stored.code === inputCode) {
    verificationCodes.delete(phone)
    return true
  }

  return false
}
