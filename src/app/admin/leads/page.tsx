"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ru, ro } from "date-fns/locale"
import { 
  Search, 
  Filter, 
  Eye, 
  MessageSquare,
  Phone,
  Mail,
  User,
  ChevronDown,
  Plus,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST"

interface LeadNote {
  id: string
  content: string
  isInternal: boolean
  createdAt: string
}

interface Lead {
  id: string
  name: string | null
  email: string | null
  telegram: string | null
  phone: string | null
  budget: string | null
  source: string
  projectType: string | null
  message: string
  status: LeadStatus
  priority: number
  createdAt: string
  updatedAt: string
  notes: LeadNote[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  NEW: { label: "Новый", color: "bg-blue-500" },
  CONTACTED: { label: "Связались", color: "bg-yellow-500" },
  QUALIFIED: { label: "Квалифицирован", color: "bg-purple-500" },
  PROPOSAL: { label: "Предложение", color: "bg-orange-500" },
  NEGOTIATION: { label: "Переговоры", color: "bg-indigo-500" },
  WON: { label: "Выиграл", color: "bg-green-500" },
  LOST: { label: "Потерян", color: "bg-red-500" },
}

const priorityConfig = {
  0: { label: "Обычный", color: "text-muted-foreground" },
  1: { label: "Высокий", color: "text-orange-500" },
  2: { label: "Срочный", color: "text-red-500" },
}

const allStatuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [locale, setLocale] = useState("ru")
  const [activeTab, setActiveTab] = useState("notes")
  
  // Create form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telegram: "",
    phone: "",
    budget: "",
    projectType: "",
    message: "",
    source: "website",
  })

  useEffect(() => {
    fetchLeads()
  }, [pagination.page, statusFilter, search])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/admin/leads?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLeads(data.leads)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchLeads()
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus })
        }
      }
    } catch (error) {
      console.error("Error updating lead status:", error)
    }
  }

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return

    try {
      const response = await fetch(`/api/admin/leads/${selectedLead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      })

      if (response.ok) {
        const { note } = await response.json()
        setSelectedLead({
          ...selectedLead,
          notes: [note, ...selectedLead.notes],
        })
        setNewNote("")
        fetchLeads()
      }
    } catch (error) {
      console.error("Error adding note:", error)
    }
  }

  const handleCreateLead = async () => {
    if (!formData.message.trim()) return

    try {
      const response = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreate(false)
        setFormData({
          name: "",
          email: "",
          telegram: "",
          phone: "",
          budget: "",
          projectType: "",
          message: "",
          source: "website",
        })
        fetchLeads()
      }
    } catch (error) {
      console.error("Error creating lead:", error)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      return format(d, "d MMM yyyy, HH:mm", { locale: locale === "ru" ? ru : ro })
    } catch {
      return date
    }
  }

  const getStatusCounts = () => {
    const counts: Record<string, number> = {}
    allStatuses.forEach(s => counts[s] = 0)
    leads.forEach(l => counts[l.status]++)
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Лиды CRM</h1>
          <p className="text-muted-foreground mt-1">
            Управление входящими заявками и потенциальными клиентами
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить лид
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, email..."
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
                <option value="all">Все статусы</option>
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s].label} ({statusCounts[s]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {allStatuses.map((s) => (
          <Card 
            key={s}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              statusFilter === s && "ring-2 ring-primary"
            )}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className={cn("w-3 h-3 rounded-full", statusConfig[s].color)} />
                <span className="text-2xl font-bold">{statusCounts[s]}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{statusConfig[s].label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все лиды ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Лиды не найдены
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Контакт</th>
                    <th className="text-left py-3 px-4 font-medium">Источник</th>
                    <th className="text-left py-3 px-4 font-medium">Проект</th>
                    <th className="text-left py-3 px-4 font-medium">Статус</th>
                    <th className="text-left py-3 px-4 font-medium">Приоритет</th>
                    <th className="text-left py-3 px-4 font-medium">Дата</th>
                    <th className="text-right py-3 px-4 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10">
                              {getInitials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {lead.name || "Без имени"}
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              {lead.telegram && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {lead.telegram}
                                </span>
                              )}
                              {lead.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{lead.source}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {lead.projectType || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="border rounded-md px-2 py-1 text-sm"
                        >
                          {allStatuses.map((s) => (
                            <option key={s} value={s}>
                              {statusConfig[s].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {lead.priority > 0 && (
                          <Badge variant={lead.priority === 2 ? "destructive" : "secondary"}>
                            {priorityConfig[lead.priority as keyof typeof priorityConfig]?.label}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead)
                            setShowDetail(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Открыть
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Lead Detail Modal */}
      {showDetail && selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Детали лида</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetail(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Имя</label>
                  <p className="text-muted-foreground">{selectedLead.name || "Не указано"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{selectedLead.email || "Не указан"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Telegram</label>
                  <p className="text-muted-foreground">{selectedLead.telegram || "Не указан"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Телефон</label>
                  <p className="text-muted-foreground">{selectedLead.phone || "Не указан"}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium">Сообщение</label>
                <p className="text-muted-foreground mt-1">{selectedLead.message}</p>
              </div>

              {/* Tabs */}
              <div className="border-b">
                <div className="flex gap-4">
                  <button
                    className={cn(
                      "pb-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "notes" ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => setActiveTab("notes")}
                  >
                    Заметки ({selectedLead.notes.length})
                  </button>
                  <button
                    className={cn(
                      "pb-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "add" ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => setActiveTab("add")}
                  >
                    Добавить заметку
                  </button>
                </div>
              </div>

              {activeTab === "notes" && (
                <div className="space-y-4">
                  {selectedLead.notes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Заметок пока нет
                    </p>
                  ) : (
                    selectedLead.notes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="pt-4">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(note.createdAt)}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === "add" && (
                <div>
                  <Textarea
                    placeholder="Добавить заметку..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    className="mt-2" 
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    Добавить заметку
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Создать лид</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Имя</label>
                <Input
                  placeholder="Имя клиента"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Телефон</label>
                  <Input
                    placeholder="+373..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Telegram</label>
                  <Input
                    placeholder="@username"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Бюджет</label>
                  <Input
                    placeholder="$1000-2000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Тип проекта</label>
                <Input
                  placeholder="Сайт, приложение, дизайн..."
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Источник</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="website">С сайта</option>
                  <option value="referral">Рекомендация</option>
                  <option value="ai_assistant">AI Ассистент</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Сообщение *</label>
                <Textarea
                  placeholder="Описание проекта..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateLead} disabled={!formData.message.trim()}>
                  Создать лид
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
