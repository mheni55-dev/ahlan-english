"use client";

import { useEffect, useState } from "react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/contact");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    fetchMessages();
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;
    await fetch(`/api/contact/${id}`, { method: "DELETE" });
    fetchMessages();
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-white">رسائل التواصل</h1>
          <p className="text-muted mt-1">{unreadCount} رسالة جديدة</p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-muted">لا توجد رسائل</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                msg.read
                  ? "bg-white dark:bg-navy/50 border-border"
                  : "bg-gold/5 border-gold/20"
              }`}
              onClick={() => {
                setExpandedId(expandedId === msg.id ? null : msg.id);
                if (!msg.read) markAsRead(msg.id);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy dark:bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                    {msg.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy dark:text-white">{msg.name}</span>
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-gold" />
                      )}
                    </div>
                    <div className="text-xs text-muted">{msg.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">
                    {new Date(msg.createdAt).toLocaleDateString("ar-DZ")}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                    className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {expandedId === msg.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  {msg.phone && (
                    <p className="text-sm text-muted mb-2">
                      <span className="font-bold">الهاتف:</span> {msg.phone}
                    </p>
                  )}
                  <p className="text-sm text-navy dark:text-white leading-relaxed">{msg.message}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
