import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

// GET /api/admin/blog/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        translations: true,
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/blog/posts/[id] - Update post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Handle publish status change
    let publishedAt = existingPost.publishedAt;
    if (body.published !== undefined && body.published !== existingPost.published) {
      publishedAt = body.published ? new Date() : null;
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        slug: body.slug,
        coverImage: body.coverImage,
        published: body.published,
        publishedAt,
        categories: body.categoryIds ? {
          set: body.categoryIds.map((id: string) => ({ id })),
        } : undefined,
        tags: body.tagIds ? {
          set: body.tagIds.map((id: string) => ({ id })),
        } : undefined,
      },
    });

    // Update translations if provided
    if (body.translations) {
      for (const trans of body.translations) {
        await prisma.postTranslation.upsert({
          where: {
            postId_locale: {
              postId: id,
              locale: trans.locale,
            },
          },
          create: {
            postId: id,
            locale: trans.locale,
            title: trans.title,
            excerpt: trans.excerpt,
            content: trans.content,
          },
          update: {
            title: trans.title,
            excerpt: trans.excerpt,
            content: trans.content,
          },
        });
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
