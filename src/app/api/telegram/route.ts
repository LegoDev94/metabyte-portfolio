import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Validation
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: "Все обязательные поля должны быть заполнены" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Неверный формат email" },
        { status: 400 }
      );
    }

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
      },
    });

    // Check if Telegram credentials are configured
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Telegram credentials not configured");
      // In development, just log and return success
      console.log("Contact form submission:", data);
      return NextResponse.json({ success: true, id: submission.id });
    }

    // Format message for Telegram
    const telegramMessage =
      `<b>🔔 Новое сообщение с портфолио</b>\n\n` +
      `👤 <b>Имя:</b> ${escapeHtml(data.name)}\n` +
      `📧 <b>Email:</b> ${escapeHtml(data.email)}\n` +
      `${data.subject ? `📝 <b>Тема:</b> ${escapeHtml(data.subject)}\n` : ""}` +
      `💬 <b>Сообщение:</b>\n${escapeHtml(data.message)}\n\n` +
      `⏰ ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`;

    // Send to Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", errorData);
      // Still return success since we saved to database
    }

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Ошибка отправки сообщения" },
      { status: 500 }
    );
  }
}
