-- Allow trusted Edge Functions using the service role key to read/write
-- AquaTracker notification data for scheduled server-side delivery.

grant usage on schema aquatracker to service_role;
grant select, insert, update, delete on all tables in schema aquatracker to service_role;
grant usage, select on all sequences in schema aquatracker to service_role;

