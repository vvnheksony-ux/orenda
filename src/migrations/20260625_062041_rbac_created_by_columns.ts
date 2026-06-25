import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."roles"
      ADD COLUMN IF NOT EXISTS "created_by" varchar;

    ALTER TABLE "payload"."permission_features"
      ADD COLUMN IF NOT EXISTS "created_by" varchar;

    ALTER TABLE "payload"."permission_actions"
      ADD COLUMN IF NOT EXISTS "created_by" varchar;

    ALTER TABLE "payload"."permissions"
      ADD COLUMN IF NOT EXISTS "created_by" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."roles"
      DROP COLUMN IF EXISTS "created_by";

    ALTER TABLE "payload"."permission_features"
      DROP COLUMN IF EXISTS "created_by";

    ALTER TABLE "payload"."permission_actions"
      DROP COLUMN IF EXISTS "created_by";

    ALTER TABLE "payload"."permissions"
      DROP COLUMN IF EXISTS "created_by";
  `)
}
