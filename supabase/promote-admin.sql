-- ============================================================
-- AHLAN ENGLISH ACADEMY — إصلاح دخول حساب المدير
-- ============================================================
-- شغّل هذا السكربت في Supabase Dashboard > SQL Editor
-- (غيّر البريد الإلكتروني في السطر أدناه قبل التشغيل).
--
-- المشكلة: أي حساب أُنشئ من لوحة Supabase (أو قبل إنشاء الـ trigger)
-- لا يملك صفاً في public.users أو يكون role = 'student'، لذلك يتم
-- تحويله بعيداً عن /admin ولا يستطيع الدخول إلى لوحة التحكم.
-- ============================================================


-- ------------------------------------------------------------
-- 1) ترقية الحساب إلى مدير + إنشاء صف public.users إن لزم
-- ------------------------------------------------------------
-- 👇 غيّر البريد الإلكتروني أدناه إلى بريد حساب المدير
DO $$
DECLARE
  target_email TEXT := 'admin@ahlan-english.com';
  target_id   UUID;
BEGIN
  SELECT id INTO target_id
  FROM auth.users
  WHERE lower(email) = lower(target_email);

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'لم يتم العثور على مستخدم بالبريد: %', target_email;
  END IF;

  -- ضمان وجود صف في public.users مع role = 'admin'
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    target_id,
    target_email,
    COALESCE(
      (SELECT raw_user_meta_data ->> 'name' FROM auth.users WHERE id = target_id),
      ''
    ),
    'admin'
  )
  ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();

  -- مزامنة الدور داخل بيانات المستخدم حتى لا يفقده عند إعادة إنشاء الصف
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  WHERE id = target_id;

  RAISE NOTICE 'تم ترقية الحساب % إلى مدير', target_email;
END $$;


-- ------------------------------------------------------------
-- 2) إنشاء الصفوف الناقصة لبقية الحسابات (الـ trigger لم يعمل لها)
-- ------------------------------------------------------------
INSERT INTO public.users (id, email, name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'name', ''),
  COALESCE(au.raw_user_meta_data ->> 'role', 'student')
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 3) ضمان وجود صف singleton في site_settings
--    (بدونه يمرر الـ API قيمة null وتتكسر الفوتر)
-- ------------------------------------------------------------
INSERT INTO public.site_settings (id)
VALUES ('singleton')
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 4) التحقق: يجب أن يظهر صف واحد بدور admin
-- ------------------------------------------------------------
SELECT u.id, u.email, u.name, u.role
FROM public.users u
WHERE u.role = 'admin';
