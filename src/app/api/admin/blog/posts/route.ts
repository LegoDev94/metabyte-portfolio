import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

// GET /api/admin/blog/posts - List posts
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // all, published, draft
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (status === "published") {
      where.published = true;
    } else if (status === "draft") {
      where.published = false;
    }

    if (search) {
      where.translations = {
        some: {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        },
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          translations: {
            where: { locale: "ru" },
            take: 1,
          },
          categories: true,
          tags: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog/posts - Create new post
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const post = await prisma.post.create({
      data: {
        slug: body.slug,
        coverImage: body.coverImage,
        published: body.published || false,
        publishedAt: body.published ? new Date() : null,
        translations: {
          create: body.translations || [],
        },
        categories: {
          connect: body.categoryIds?.map((id: string) => ({ id })) || [],
        },
        tags: {
          connect: body.tagIds?.map((id: string) => ({ id })) || [],
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
