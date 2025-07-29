import { type NextRequest, NextResponse } from "next/server"

// 模拟文化基因详细数据
const culturalGenesDetail = new Map([
  [
    "cg_001",
    {
      id: "cg_001",
      name: "洛神赋",
      category: "古典文学",
      dynasty: "魏晋",
      author: "曹植",
      description: "描写洛水女神的千古名篇，体现了古代文人的浪漫主义情怀",
      keywords: ["洛神", "曹植", "古典文学", "浪漫主义"],
      content: `翩若惊鸿，婉若游龙，荣曜秋菊，华茂春松。
髣髴兮若轻云之蔽月，飘飖兮若流风之回雪。
远而望之，皎若太阳升朝霞；迫而察之，灼若芙蕖出渌波。`,
      fullText: "洛神赋全文内容...",
      culturalValue: 95,
      popularity: 88,
      relatedWorks: ["洛神图", "洛神传说", "曹植诗集"],
      historicalBackground: "曹植创作此赋时正值人生低谷，通过描写洛神来抒发内心情感",
      culturalImpact: "对后世文学创作产生深远影响，成为浪漫主义文学的典范",
      modernAdaptations: ["洛神水赋舞蹈", "洛神赋电视剧", "洛神主题短剧"],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T15:30:00Z",
    },
  ],
  [
    "cg_002",
    {
      id: "cg_002",
      name: "武则天传说",
      category: "历史人物",
      dynasty: "唐朝",
      author: "史官记录",
      description: "中国历史上唯一的女皇帝，展现了女性的智慧与权力",
      keywords: ["武则天", "女皇", "唐朝", "权力"],
      content: "武则天，名曌，中国历史上唯一的正统女皇帝",
      fullText: "武则天详细传记...",
      culturalValue: 92,
      popularity: 85,
      relatedWorks: ["武则天传", "大明宫词", "武媚娘传奇"],
      historicalBackground: "唐朝盛世背景下，武则天从才人到皇后再到皇帝的传奇经历",
      culturalImpact: "打破了男权社会的传统观念，成为女性力量的象征",
      modernAdaptations: ["武则天影视作品", "女性励志题材", "权谋剧情"],
      createdAt: "2024-01-16T10:00:00Z",
      updatedAt: "2024-01-21T16:45:00Z",
    },
  ],
])

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, message: "文化基因ID不能为空" }, { status: 400 })
    }

    const gene = culturalGenesDetail.get(id)

    if (!gene) {
      return NextResponse.json({ success: false, message: "文化基因不存在" }, { status: 404 })
    }

    // 增加访问次数（模拟）
    gene.popularity += 1

    return NextResponse.json({
      success: true,
      data: gene,
    })
  } catch (error) {
    console.error("获取文化基因详情错误:", error)
    return NextResponse.json({ success: false, message: "获取详情失败，请稍后重试" }, { status: 500 })
  }
}
