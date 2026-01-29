import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ru, ro } from "date-fns/locale"
import { FileText, Calendar, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Блог | METABYTE",
  description: "Статьи о веб-разработке, дизайне и технологиях",
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Fetch published posts
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    include: {
      translations: true,
      categories: true,
      tags: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  })

  const dateLocale = locale === "ru" ? ru : ro

  return (
    <div className="container mx-auto py-20 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-4">
          <span className="text-primary">БЛОГ</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Статьи о веб-разработке, дизайне и современных технологиях
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Статьи скоро появятся</h2>
          <p className="text-muted-foreground">
            Мы готовим для вас интересные материалы
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const translation = post.translations.find((t) =>
              locale === "ru" ? true : t.language === "RO"
            ) || post.translations[0]

            const title = translation?.title || "Без названия"
            const excerpt = translation?.excerpt || ""

            return (
              <article
                key={post.id}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
              >
                {/* Cover Image */}
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="aspect-video bg-muted overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  {/* Categories */}
                  {post.categories.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {post.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat.id}
                          className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded"
                        >
                          {cat.slug}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="font-semibold text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {title}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  {excerpt && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {excerpt}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "d MMM yyyy", {
                            locale: dateLocale,
                          })
                        : format(new Date(post.createdAt), "d MMM yyyy", {
                            locale: dateLocale,
                          })}
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all"
                    >
                      Читать
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
