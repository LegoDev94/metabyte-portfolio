"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Construction } from "lucide-react";

export default function FAQPage() {
  return (
    <>
      <AdminHeader
        title="FAQ"
        description="Управление часто задаваемыми вопросами"
      />
      <div className="p-6">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Construction className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">В разработке</h2>
          <p className="text-muted-foreground">
            Раздел управления FAQ будет доступен в следующем обновлении.
          </p>
        </div>
      </div>
    </>
  );
}
