import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key")

// 需要认证的路由
const protectedRoutes = [
  "/profile",
  "/ai-script",
  "/cultural-gene",
  "/star-economy",
  "/social-system",
  "/project-management",
]

// 公开路由
const publicRoutes = [
  "/",
  "/main",
  "/auth",
  "/auth/single-page",
  "/cultural-crossing",
  "/functionality-report",
  "/test-optimization",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是API路由
  if (pathname.startsWith("/api/")) {
    // API路由的认证逻辑
    if (pathname.startsWith("/api/auth/")) {
      // 认证相关的API不需要token验证
      return NextResponse.next()
    }

    // 其他API需要token验证
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "未提供认证令牌" }, { status: 401 })
    }

    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json({ error: "无效的认证令牌" }, { status: 401 })
    }
  }

  // 页面路由的认证逻辑
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      url.searchParams.set("redirect", pathname)
      const response = NextResponse.redirect(url)
      response.cookies.delete("auth-token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
