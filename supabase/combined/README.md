# Combined migrations

`all_migrations.sql` concatenates the 10 files in `../migrations/` in order.
It exists only to make the first-time Supabase setup a single paste.

## Usage

1. Open your Supabase project → **SQL editor** → **New query**.
2. Paste the entire contents of `all_migrations.sql`.
3. Click **Run**.

Every migration is idempotent (`create … if not exists`, `do $$ … exception
when duplicate_object`), so re-running is safe.

## Keeping it in sync

If you add a new migration under `../migrations/`, regenerate this file:

```bash
{ for f in supabase/migrations/00*.sql; do
    echo "-- ============================================================"
    echo "-- $(basename $f)"
    echo "-- ============================================================"
    cat "$f"; echo; echo
  done; } > supabase/combined/all_migrations.sql
```

CI does **not** check this file is up to date — it's a convenience artifact,
not the source of truth. The individual migration files remain canonical.
