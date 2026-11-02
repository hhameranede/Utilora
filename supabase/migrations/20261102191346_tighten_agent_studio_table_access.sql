create index if not exists team_chat_runs_prompt_message_id_idx
  on public.team_chat_runs (prompt_message_id);

create policy "service_role_full_access_team_chat_rooms"
  on public.team_chat_rooms for all to service_role
  using (true) with check (true);
create policy "service_role_full_access_team_chat_messages"
  on public.team_chat_messages for all to service_role
  using (true) with check (true);
create policy "service_role_full_access_team_chat_runs"
  on public.team_chat_runs for all to service_role
  using (true) with check (true);
create policy "service_role_full_access_team_chat_agent_runs"
  on public.team_chat_agent_runs for all to service_role
  using (true) with check (true);
create policy "service_role_full_access_team_chat_events"
  on public.team_chat_events for all to service_role
  using (true) with check (true);
