import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// 需要认证的路径
const protectedPaths = [
  "/api/ai-script",
  "/api/star-economy",
  "/api/auth/me",
  "/profile",
  "/ai-script",
  "/star-economy",
]

// 公开路径
const publicPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/send-code",
  "/api/cultural-gene",
  "/",
  "/cultural-crossing",
  "/cultural-gene",
  "/social-system",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是公开路径
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // 获取认证token
  const token = request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    // API路径返回401，页面路径重定向到登录
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 })
    } else {
      const loginUrl = new URL("/auth", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  try {
    // 验证JWT token
    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    return NextResponse.next()
  } catch (error) {
    console.error("Token验证失败:", error)

    // 清除无效token
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, message: "Token无效，请重新登录" }, { status: 401 })
      : NextResponse.redirect(new URL("/auth", request.url))

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })

    return response
  }
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public文件夹中的文件
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
