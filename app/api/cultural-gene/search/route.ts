import { type NextRequest, NextResponse } from "next/server"

// 模拟文化基因数据库
const culturalGenes = [
  {
    id: "cg_001",
    name: "洛神赋",
    category: "古典文学",
    dynasty: "魏晋",
    author: "曹植",
    description: "描写洛水女神的千古名篇，体现了古代文人的浪漫主义情怀",
    keywords: ["洛神", "曹植", "古典文学", "浪漫主义"],
    content: "翩若惊鸿，婉若游龙，荣曜秋菊，华茂春松...",
    culturalValue: 95,
    popularity: 88,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "cg_002",
    name: "武则天传说",
    category: "历史人物",
    dynasty: "唐朝",
    author: "史官记录",
    description: "中国历史上唯一的女皇帝，展现了女性的智慧与权力",
    keywords: ["武则天", "女皇", "唐朝", "权力"],
    content: "武则天，名曌，中国历史上唯一的正统女皇帝...",
    culturalValue: 92,
    popularity: 85,
    createdAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "cg_003",
    name: "洛邑古城",
    category: "历史建筑",
    dynasty: "多朝代",
    author: "历代工匠",
    description: "洛阳古城的历史文化遗存，见证了十三朝古都的辉煌",
    keywords: ["洛阳", "古城", "十三朝", "建筑"],
    content: "洛邑古城位于洛阳老城区，是洛阳文化的重要载体...",
    culturalValue: 90,
    popularity: 82,
    createdAt: "2024-01-17T10:00:00Z",
  },
  {
    id: "cg_004",
    name: "八卦九宫",
    category: "哲学思想",
    dynasty: "先秦",
    author: "伏羲、文王",
    description: "中华文化的重要符号系统，体现了古代哲学智慧",
    keywords: ["八卦", "九宫", "易经", "哲学"],
    content: "八卦九宫是中华文化中重要的符号系统...",
    culturalValue: 98,
    popularity: 75,
    createdAt: "2024-01-18T10:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const dynasty = searchParams.get("dynasty") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let filteredGenes = culturalGenes

    // 关键词搜索
    if (query) {
      filteredGenes = filteredGenes.filter(
        (gene) =>
          gene.name.includes(query) ||
          gene.description.includes(query) ||
          gene.keywords.some((keyword) => keyword.includes(query)) ||
          gene.content.includes(query),
      )
    }

    // 分类筛选
    if (category) {
      filteredGenes = filteredGenes.filter((gene) => gene.category === category)
    }

    // 朝代筛选
    if (dynasty) {
      filteredGenes = filteredGenes.filter((gene) => gene.dynasty === dynasty)
    }

    // 分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedGenes = filteredGenes.slice(startIndex, endIndex)

    // 统计信息
    const categories = [...new Set(culturalGenes.map((gene) => gene.category))]
    const dynasties = [...new Set(culturalGenes.map((gene) => gene.dynasty))]

    return NextResponse.json({
      success: true,
      data: {
        genes: paginatedGenes,
        pagination: {
          page,
          limit,
          total: filteredGenes.length,
          totalPages: Math.ceil(filteredGenes.length / limit),
        },
        filters: {
          categories,
          dynasties,
        },
      },
    })
  } catch (error) {
    console.error("搜索文化基因错误:", error)
    return NextResponse.json({ success: false, message: "搜索失败，请稍后重试" }, { status: 500 })
  }
}
