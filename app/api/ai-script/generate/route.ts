import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import jwt from "jsonwebtoken"

interface GenerateRequest {
  theme: string
  style: string
  length: "short" | "medium" | "long"
  characters: string[]
  setting: string
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const body: GenerateRequest = await request.json()
    const { theme, style, length, characters, setting } = body

    if (!theme || !style || !length) {
      return NextResponse.json({ success: false, message: "主题、风格和长度不能为空" }, { status: 400 })
    }

    // 构建提示词
    const lengthMap = {
      short: "500-800字",
      medium: "1000-1500字",
      long: "2000-3000字",
    }

    const prompt = `
请基于以下要求创作一个${lengthMap[length]}的短剧剧本：

主题：${theme}
风格：${style}
场景设定：${setting || "现代都市"}
主要角色：${characters.join("、") || "待定"}

要求：
1. 剧本结构完整，包含开场、发展、高潮、结局
2. 对话生动自然，符合角色性格
3. 场景描述简洁明了
4. 情节紧凑，适合短视频呈现
5. 融入中华文化元素，体现文化传承价值

请按照标准剧本格式输出，包含场景、角色、对话和动作描述。
`

    // 调用AI生成剧本
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: length === "short" ? 1000 : length === "medium" ? 1500 : 2000,
      temperature: 0.8,
    })

    // 生成剧本ID
    const scriptId = `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const scriptData = {
      id: scriptId,
      title: `${theme}主题剧本`,
      content: text,
      theme,
      style,
      length,
      characters,
      setting,
      authorId: decoded.userId,
      createdAt: new Date().toISOString(),
      status: "draft",
    }

    return NextResponse.json({
      success: true,
      message: "剧本生成成功",
      data: scriptData,
    })
  } catch (error) {
    console.error("生成剧本错误:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "Token无效" }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: "剧本生成失败，请稍后重试" }, { status: 500 })
  }
}
