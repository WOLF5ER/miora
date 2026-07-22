-- Патч: убирает предупреждение Supabase "Security Definer View" для master_public.
-- Заставляет вьюху выполняться с правами запрашивающего (RLS применяется как обычно),
-- а не с правами владельца БД. Выполнить один раз в SQL Editor.

alter view public.master_public set (security_invoker = true);
