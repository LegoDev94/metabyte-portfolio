"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ru, ro } from "date-fns/locale"
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  X,
  ExternalLink,
  FileText,
  Tag,
  Folder
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Post {
  id: string
  slug: string
  coverImage: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
  translations: Array<{
    title: string
    excerpt: string | null
  }>
  categories: Array<{
    id: string
    slug: string
  }>
  tags: Array<{
    id: string
    slug: string
    color: string
  }>
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [locale, setLocale] = useState("ru")
  
  // Create form state
  const [formData, setFormData] = useState({
    slug: "",
    titleRU: "",
    contentRU: "",
    excerptRU: "",
    titleRO: "",
    contentRO: "",
    excerptRO: "",
    coverImage: "",
    published: false,
  })

  useEffect(() => {
    fetchPosts()
  }, [pagination.page, statusFilter, search])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/admin/blog/posts?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToggle = async (postId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error toggling publish status:", error)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот пост?")) return

    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const handleCreatePost = async () => {
    if (!formData.titleRU.trim() || !formData.slug.trim()) return

    try {
      const response = await fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreate(false)
        setFormData({
          slug: "",
          titleRU: "",
          contentRU: "",
          excerptRU: "",
          titleRO: "",
          contentRO: "",
          excerptRO: "",
          coverImage: "",
          published: false,
        })
        fetchPosts()
      }
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      return format(d, "d MMM yyyy", { locale: locale === "ru" ? ru : ro })
    } catch {
      return date
    }
  }

  const getTitle = (post: Post) => {
    const ruTrans = post.translations.find(t => t.title)
    return ruTrans?.title || "Без названия"
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Блог</h1>
          <p className="text-muted-foreground mt-1">
            Управление статьями и публикациями
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Новая статья
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Все статьи</option>
                <option value="published">Опубликованные</option>
                <option value="draft">Черновики</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">Всего статей</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">
              {posts.filter(p => p.published).length}
            </div>
            <p className="text-xs text-muted-foreground">Опубликовано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-500">
              {posts.filter(p => !p.published).length}
            </div>
            <p className="text-xs text-muted-foreground">Черновики</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Все статьи ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Статьи не найдены
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div 
                  key={post.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Cover Image */}
                  <div className="w-24 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={getTitle(post)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold truncate">
                          {getTitle(post)}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          /blog/{post.slug}
                        </p>
                      </div>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Опубликовано" : "Черновик"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </span>
                      
                      {/* Categories */}
                      {post.categories.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Folder className="h-3 w-3 text-muted-foreground" />
                          {post.categories.slice(0, 2).map((cat) => (
                            <Badge key={cat.id} variant="outline" className="text-xs">
                              {cat.slug}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge 
                              key={tag.id} 
                              className="text-xs"
                              style={{ backgroundColor: tag.color + "20", color: tag.color }}
                            >
                              {tag.slug}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePublishToggle(post.id, post.published)}
                    >
                      {post.published ? (
                        <span className="text-xs">Скрыть</span>
                      ) : (
                        <span className="text-xs">Опубликовать</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPost(post)
                        setShowDetail(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Страница {pagination.page} из {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Создать статью</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">URL slug *</label>
                <Input
                  placeholder="my-post-title"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Будет доступно по /blog/your-slug</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Заголовок (RU) *</label>
                  <Input
                    placeholder="Заголовок на русском"
                    value={formData.titleRU}
                    onChange={(e) => setFormData({ ...formData, titleRU: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Заголовок (RO)</label>
                  <Input
                    placeholder="Titlu în română"
                    value={formData.titleRO}
                    onChange={(e) => setFormData({ ...formData, titleRO: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Краткое описание (RU)</label>
                <Textarea
                  placeholder="Краткое описание статьи для превью..."
                  value={formData.excerptRU}
                  onChange={(e) => setFormData({ ...formData, excerptRU: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Краткое описание (RO)</label>
                <Textarea
                  placeholder="Descriere scurtă pentru previzualizare..."
                  value={formData.excerptRO}
                  onChange={(e) => setFormData({ ...formData, excerptRO: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Содержание (RU) *</label>
                <Textarea
                  placeholder="Текст статьи на русском..."
                  value={formData.contentRU}
                  onChange={(e) => setFormData({ ...formData, contentRU: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Содержание (RO)</label>
                <Textarea
                  placeholder="Conținut articol în română..."
                  value={formData.contentRO}
                  onChange={(e) => setFormData({ ...formData, contentRO: e.target.value })}
                  rows={6}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">URL изображения</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="published" className="text-sm font-medium">Опубликовать сразу</label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreatePost} disabled={!formData.titleRU.trim() || !formData.slug.trim() || !formData.contentRU.trim()}>
                  Создать статью
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
