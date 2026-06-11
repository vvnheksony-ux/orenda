import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."insurance_updates"
      DROP COLUMN IF EXISTS "insurance_provider";

    ALTER TABLE "payload"."_insurance_updates_v"
      DROP COLUMN IF EXISTS "version_insurance_provider";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."insurance_updates"
      ADD COLUMN IF NOT EXISTS "insurance_provider" varchar;

    ALTER TABLE "payload"."_insurance_updates_v"
      ADD COLUMN IF NOT EXISTS "version_insurance_provider" varchar;
  `)
}
