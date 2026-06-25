import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."users"
      ADD COLUMN IF NOT EXISTS "created_by" varchar;

    UPDATE "payload"."users"
    SET "created_by" = "created_by_id"::text
    WHERE "created_by" IS NULL
      AND "created_by_id" IS NOT NULL;

    DROP INDEX IF EXISTS "payload"."users_created_by_idx";

    ALTER TABLE "payload"."users"
      DROP COLUMN IF EXISTS "created_by_id";

    CREATE INDEX IF NOT EXISTS "users_created_by_idx"
      ON "payload"."users" USING btree ("created_by");
  `)
}

export async function down({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload"."users_created_by_idx";

    ALTER TABLE "payload"."users"
      ADD COLUMN IF NOT EXISTS "created_by_id" integer REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;

    UPDATE "payload"."users"
    SET "created_by_id" = "created_by"::integer
    WHERE "created_by_id" IS NULL
      AND "created_by" ~ '^[0-9]+$';

    ALTER TABLE "payload"."users"
      DROP COLUMN IF EXISTS "created_by";

    CREATE INDEX IF NOT EXISTS "users_created_by_idx"
      ON "payload"."users" USING btree ("created_by_id");
  `)
}
