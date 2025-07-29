import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import jwt from "jsonwebtoken"

interface OptimizeRequest {
  content: string
  optimizeType: "dialogue" | "structure" | "emotion" | "cultural"
  instructions?: string
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })
    }

    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")

    const body: OptimizeRequest = await request.json()
    const { content, optimizeType, instructions } = body

    if (!content || !optimizeType) {
      return NextResponse.json({ success: false, message: "剧本内容和优化类型不能为空" }, { status: 400 })
    }

    const optimizePrompts = {
      dialogue: "优化对话，使其更加生动自然，符合角色性格特点",
      structure: "优化剧本结构，使情节更加紧凑，逻辑更加清晰",
      emotion: "增强情感表达，让观众更容易产生共鸣",
      cultural: "融入更多中华文化元素，提升文化内涵和教育价值",
    }

    const prompt = `
请对以下剧本进行优化：

优化重点：${optimizePrompts[optimizeType]}
${instructions ? `特殊要求：${instructions}` : ""}

原剧本：
${content}

优化要求：
1. 保持原有故事主线不变
2. ${optimizePrompts[optimizeType]}
3. 保持剧本格式规范
4. 确保内容适合短视频呈现
5. 体现中华文化传承价值

请输出优化后的完整剧本：
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    })

    return NextResponse.json({
      success: true,
      message: "剧本优化成功",
      data: {
        originalContent: content,
        optimizedContent: text,
        optimizeType,
        optimizedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("优化剧本错误:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "Token无效" }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: "剧本优化失败，请稍后重试" }, { status: 500 })
  }
}
