"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [form, setForm] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    price: 0,
    level: "مبتدئ",
    duration: "",
    featured: false,
    visible: true,
  });

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            title: data.title,
            titleAr: data.titleAr,
            description: data.description,
            descriptionAr: data.descriptionAr,
            price: data.price,
            level: data.level,
            duration: data.duration,
            featured: data.featured,
            visible: data.visible,
          });
          if (data.thumbnail) {
            setThumbnailPreview(data.thumbnail);
            setThumbnailUrl(data.thumbnail);
          }
          if (data.promoVideo) {
            setVideoPreview(data.promoVideo);
            setVideoUrl(data.promoVideo);
          }
        }
      } catch {
        setError("فشل تحميل بيانات الدورة");
      } finally {
        setFetching(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
      return null;
    } catch {
      return null;
    }
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) { setError("يرجى اختيار ملف صورة صالح"); return; }
      if (file.size > 5 * 1024 * 1024) { setError("حجم الصورة يجب أن يكون أقل من 5 ميغابايت"); return; }
      setError("");
      const reader = new FileReader();
      reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) { setError("يرجى اختيار ملف فيديو صالح"); return; }
      if (file.size > 50 * 1024 * 1024) { setError("حجم الفيديو يجب أن يكون أقل من 50 ميغابايت"); return; }
      setError("");
      const reader = new FileReader();
      reader.onload = (ev) => setVideoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUploading(true);

    const formData = new FormData(e.currentTarget);

    let finalThumbnailUrl = thumbnailUrl;
    const thumbnailFile = formData.get("thumbnailFile") as File | null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const uploaded = await uploadFile(thumbnailFile, "uploads/courses");
      if (uploaded) finalThumbnailUrl = uploaded;
      else { setError("فشل رفع الصورة"); setLoading(false); setUploading(false); return; }
    }

    let finalVideoUrl = videoUrl;
    const videoFile = formData.get("videoFile") as File | null;
    if (videoFile && videoFile.size > 0) {
      const uploaded = await uploadFile(videoFile, "uploads/courses");
      if (uploaded) finalVideoUrl = uploaded;
      else { setError("فشل رفع الفيديو"); setLoading(false); setUploading(false); return; }
    }

    setUploading(false);

    const body = {
      ...form,
      thumbnail: finalThumbnailUrl || null,
      promoVideo: finalVideoUrl || null,
    };

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { router.push("/admin/courses"); router.refresh(); }
      else { const data = await res.json(); setError(data.error || "حدث خطأ"); }
    } catch { setError("حدث خطأ في الاتصال"); }
    finally { setLoading(false); }
  }

  function updateField(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">تعديل الدورة</h1>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-border p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm text-center">{error}</div>}

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">صورة الدورة (غلاف)</label>
          <div onClick={() => thumbnailRef.current?.click()} className="relative w-full h-48 rounded-2xl border-2 border-dashed border-border hover:border-gold cursor-pointer transition-colors overflow-hidden bg-gray-50 flex items-center justify-center">
            {thumbnailPreview ? (
              <>
                <img src={thumbnailPreview} alt="معاينة" className="w-full h-full object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setThumbnailPreview(null); setThumbnailUrl(""); if (thumbnailRef.current) thumbnailRef.current.value = ""; }} className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </>
            ) : (
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-muted/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                <p className="text-sm text-muted">اضغط لرفع صورة الدورة</p>
                <p className="text-xs text-muted/60 mt-1">JPG, PNG — حد أقصى 5 ميغابايت</p>
              </div>
            )}
            <input ref={thumbnailRef} name="thumbnailFile" type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
          </div>
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">فيديو تعريفي عن الدورة</label>
          <div onClick={() => videoRef.current?.click()} className="relative w-full h-48 rounded-2xl border-2 border-dashed border-border hover:border-gold cursor-pointer transition-colors overflow-hidden bg-gray-50 flex items-center justify-center">
            {videoPreview ? (
              <>
                <video src={videoPreview} className="w-full h-full object-cover" controls preload="metadata" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setVideoPreview(null); setVideoUrl(""); if (videoRef.current) videoRef.current.value = ""; }} className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </>
            ) : (
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-muted/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                <p className="text-sm text-muted">اضغط لرفع فيديو تعريفي</p>
                <p className="text-xs text-muted/60 mt-1">MP4, WebM — حد أقصى 50 ميغابايت</p>
              </div>
            )}
            <input ref={videoRef} name="videoFile" type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
          </div>
        </div>

        {/* Fields */}
        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">العنوان بالعربية</label>
          <input value={form.titleAr} onChange={(e) => updateField("titleAr", e.target.value)} required className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold" />
        </div>
        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">العنوان بالإنجليزية</label>
          <input value={form.title} onChange={(e) => updateField("title", e.target.value)} required className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold" />
        </div>
        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">الوصف بالعربية</label>
          <textarea value={form.descriptionAr} onChange={(e) => updateField("descriptionAr", e.target.value)} required rows={3} className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold resize-none" />
        </div>
        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">الوصف بالإنجليزية</label>
          <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} required rows={3} className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold resize-none" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-navy mb-1.5">السعر (دج)</label>
            <input type="number" value={form.price} onChange={(e) => updateField("price", Number(e.target.value))} required min={0} className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy mb-1.5">المدة</label>
            <input value={form.duration} onChange={(e) => updateField("duration", e.target.value)} required placeholder="مثال: 3 أشهر" className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">المستوى</label>
          <select value={form.level} onChange={(e) => updateField("level", e.target.value)} required className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold">
            <option value="مبتدئ">مبتدئ</option>
            <option value="متوسط">متوسط</option>
            <option value="متقدم">متقدم</option>
          </select>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => updateField("featured", e.target.checked)} className="w-4 h-4 rounded border-border text-gold focus:ring-gold accent-gold-dark" />
            <span className="text-sm text-navy font-medium">دورة مميزة</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.visible} onChange={(e) => updateField("visible", e.target.checked)} className="w-4 h-4 rounded border-border text-gold focus:ring-gold accent-gold-dark" />
            <span className="text-sm text-navy font-medium">ظاهرة</span>
          </label>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-gold text-navy px-8 py-2.5 rounded-full font-bold hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? (<><div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />{uploading ? "جاري الرفع..." : "جاري الحفظ..."}</>) : "حفظ التعديلات"}
          </button>
          <button type="button" onClick={() => router.back()} className="text-muted hover:text-foreground transition-colors text-sm">إلغاء</button>
        </div>
      </form>
    </div>
  );
}
