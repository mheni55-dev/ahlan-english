"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("حدث خطأ أثناء الحذف");
      }
    } catch {
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 transition-colors text-xs font-medium disabled:opacity-50"
    >
      {loading ? "جاري الحذف..." : "حذف"}
    </button>
  );
}
