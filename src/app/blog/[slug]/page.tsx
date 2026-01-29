import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ru, ro } from "date-fns/locale"
import { ArrowLeft, Calendar, Folder, Tag } from "lucide-react"

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params

  const post = await prisma.post.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      translations: true,
    },
  })

  if (!post) {
    return {
      title: "Статья не найдена | METABYTE",
    }
  }

  const translation = post.translations.find((t) =>
    locale === "ru" ? t.locale === "ru" : t.locale === "ro"
  ) || post.translations[0]

  return {
    title: `${translation?.title || "Статья"} | METABYTE`,
    description: translation?.excerpt || "Статья на METABYTE",
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params

  const post = await prisma.post.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      translations: true,
      categories: true,
      tags: true,
    },
  })

  if (!post) {
    notFound()
  }

  const translation = post.translations.find((t) =>
    locale === "ru" ? t.locale === "ru" : t.locale === "ro"
  ) || post.translations[0]

  const title = translation?.title || "Без названия"
  const content = translation?.content || ""
  const excerpt = translation?.excerpt || ""

  const dateLocale = locale === "ru" ? ru : ro
  const publishDate = post.publishedAt
    ? format(new Date(post.publishedAt), "d MMMM yyyy", { locale: dateLocale })
    : format(new Date(post.createdAt), "d MMMM yyyy", { locale: dateLocale })

  return (
    <article className="container mx-auto py-20 px-4">
      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        {locale === "ru" ? "Вернуться к статьям" : "Înapoi la articole"}
      </Link>

      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full"
              >
                {cat.slug}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-6">
          {title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{publishDate}</span>
          </div>

          {post.categories.length > 0 && (
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span>{post.categories.map((c) => c.slug).join(", ")}</span>
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <div className="flex gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag.id} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.slug}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="max-w-5xl mx-auto mb-12">
          <div className="aspect-video rounded-xl overflow-hidden">
            <img
              src={post.coverImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        {excerpt && (
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed font-medium">
            {excerpt}
          </p>
        )}

        <div className="prose prose-lg max-w-none">
          {content.split("\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Теги:
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 rounded-full text-sm border border-border"
                style={{ color: tag.color, borderColor: tag.color + "40" }}
              >
                #{tag.slug}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
