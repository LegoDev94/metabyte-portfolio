"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Construction } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <AdminHeader
        title="Настройки"
        description="Настройки сайта и UI строки"
      />
      <div className="p-6">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Construction className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">В разработке</h2>
          <p className="text-muted-foreground">
            Раздел настроек будет доступен в следующем обновлении.
          </p>
        </div>
      </div>
    </>
  );
}
