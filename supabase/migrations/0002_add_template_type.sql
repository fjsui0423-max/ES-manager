-- Add type column to templates table
alter table templates
  add column if not exists type text
    check (type in ('internship', 'main', 'other'));
