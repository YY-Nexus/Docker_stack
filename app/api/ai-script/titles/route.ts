import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import jwt from "jsonwebtoken"

interface TitleRequest {
  content: string
  count?: number
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

    const body: TitleRequest = await request.json()
    const { content, count = 5 } = body

    if (!content) {
      return NextResponse.json({ success: false, message: "剧本内容不能为空" }, { status: 400 })
    }

    const prompt = `
基于以下剧本内容，生成${count}个吸引人的标题：

剧本内容：
${content.substring(0, 500)}...

要求：
1. 标题要简洁有力，不超过15个字
2. 能够准确概括剧本主题
3. 具有吸引力和传播性
4. 体现中华文化特色
5. 适合短视频平台传播

请以JSON数组格式返回标题列表：
["标题1", "标题2", "标题3", ...]
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 300,
      temperature: 0.9,
    })

    // 尝试解析JSON，如果失败则手动提取标题
    let titles: string[] = []
    try {
      titles = JSON.parse(text)
    } catch {
      // 如果JSON解析失败，尝试从文本中提取标题
      const matches = text.match(/"([^"]+)"/g)
      if (matches) {
        titles = matches.map((match) => match.replace(/"/g, ""))
      } else {
        // 如果都失败了，按行分割
        titles = text
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => line.replace(/^\d+\.\s*/, "").trim())
          .slice(0, count)
      }
    }

    return NextResponse.json({
      success: true,
      message: "标题生成成功",
      data: { titles: titles.slice(0, count) },
    })
  } catch (error) {
    console.error("生成标题错误:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ success: false, message: "Token无效" }, { status: 401 })
    }

    return NextResponse.json({ success: false, message: "标题生成失败，请稍后重试" }, { status: 500 })
  }
}
