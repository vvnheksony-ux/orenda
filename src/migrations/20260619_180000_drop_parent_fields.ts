import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload"."users_parent_idx";
    ALTER TABLE "payload"."users" DROP COLUMN IF EXISTS "parent_id";
    ALTER TABLE "payload"."users" DROP COLUMN IF EXISTS "parent_path";
  `)
}

export async function down({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."users"
      ADD COLUMN IF NOT EXISTS "parent_id" integer REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action,
      ADD COLUMN IF NOT EXISTS "parent_path" varchar;
    CREATE INDEX IF NOT EXISTS "users_parent_idx" ON "payload"."users" USING btree ("parent_id");
  `)
}
