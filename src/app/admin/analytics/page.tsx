"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  BarChart3,
  Users,
  Eye,
  MessageCircle,
  UserCheck,
  TrendingUp,
  MapPin,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  period: string;
  metrics: {
    totalVisitors: number;
    newVisitors: number;
    totalPageViews: number;
    totalChatSessions: number;
    activeChatSessions: number;
    contactsCollected: number;
    conversionRate: number;
  };
  charts: {
    visitorsByDay: Array<{ date: string; count: number }>;
    chatSessionsByDay: Array<{ date: string; count: number }>;
  };
  topData: {
    visitorsByCity: Array<{ city: string; count: number }>;
    topPages: Array<{ path: string; count: number }>;
  };
}

const periods = [
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" },
  { value: "all", label: "Всё время" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatDate = (value: string | number) => {
    const date = new Date(String(value));
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  return (
    <>
      <AdminHeader
        title="Аналитика"
        description="Подробная статистика посещений и конверсий"
      />
      <div className="p-6 space-y-6">
        {/* Period selector */}
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                period === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
            <div className="h-80 bg-muted animate-pulse rounded-xl" />
          </div>
        ) : data ? (
          <>
            {/* Metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={Users}
                label="Посетители"
                value={data.metrics.totalVisitors}
                subValue={`+${data.metrics.newVisitors} новых`}
                color="text-blue-500"
              />
              <MetricCard
                icon={Eye}
                label="Просмотры"
                value={data.metrics.totalPageViews}
                color="text-green-500"
              />
              <MetricCard
                icon={MessageCircle}
                label="Чат-сессии"
                value={data.metrics.totalChatSessions}
                subValue={`${data.metrics.activeChatSessions} активных`}
                color="text-purple-500"
              />
              <MetricCard
                icon={UserCheck}
                label="Контакты"
                value={data.metrics.contactsCollected}
                subValue={`${data.metrics.conversionRate}% конверсия`}
                color="text-orange-500"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visitors chart */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Посетители по дням</h3>
                </div>
                {data.charts.visitorsByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.charts.visitorsByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#00ffff"
                        strokeWidth={2}
                        dot={{ fill: "#00ffff", strokeWidth: 0 }}
                        name="Посетители"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Нет данных за выбранный период
                  </div>
                )}
              </div>

              {/* Chat sessions chart */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Чат-сессии по дням</h3>
                </div>
                {data.charts.chatSessionsByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.charts.chatSessionsByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(label) => formatDate(label as string)}
                      />
                      <Bar
                        dataKey="count"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        name="Чаты"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Нет данных за выбранный период
                  </div>
                )}
              </div>
            </div>

            {/* Top data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top cities */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Города</h3>
                </div>
                {data.topData.visitorsByCity.length > 0 ? (
                  <div className="space-y-3">
                    {data.topData.visitorsByCity.map((item, index) => (
                      <div key={item.city} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate">{item.city}</span>
                        <span className="text-muted-foreground">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Нет данных о городах
                  </div>
                )}
              </div>

              {/* Top pages */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Популярные страницы</h3>
                </div>
                {data.topData.topPages.length > 0 ? (
                  <div className="space-y-3">
                    {data.topData.topPages.map((item, index) => (
                      <div key={item.path} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate font-mono text-sm">
                          {item.path}
                        </span>
                        <span className="text-muted-foreground">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Нет данных о страницах
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Не удалось загрузить данные аналитики
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-muted ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
      )}
    </div>
  );
}
