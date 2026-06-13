-- =============================================
-- Migración 007: Restringir inserciones en activity_log
-- El backend usa service_role (bypassa RLS), por lo que puede seguir
-- insertando. Los usuarios autenticados ya no pueden insertar logs
-- directamente a través de la Supabase Data API.
-- =============================================

drop policy if exists "Authenticated can insert activity_log" on activity_log;

-- Solo service_role puede insertar (usando using(false) para denegar
-- explícitamente a usuarios autenticados; service_role bypassa esto)
create policy "Deny direct insert activity_log" on activity_log
  for insert with check (false);
