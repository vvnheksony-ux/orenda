import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."announcements"
      DROP COLUMN IF EXISTS "legacy_news_id",
      DROP COLUMN IF EXISTS "legacy_slug";

    ALTER TABLE "payload"."_announcements_v"
      DROP COLUMN IF EXISTS "version_legacy_news_id",
      DROP COLUMN IF EXISTS "version_legacy_slug";

    ALTER TABLE "payload"."health_tips"
      DROP COLUMN IF EXISTS "legacy_news_id",
      DROP COLUMN IF EXISTS "legacy_slug";

    ALTER TABLE "payload"."_health_tips_v"
      DROP COLUMN IF EXISTS "version_legacy_news_id",
      DROP COLUMN IF EXISTS "version_legacy_slug";

    ALTER TABLE "payload"."careers"
      DROP COLUMN IF EXISTS "legacy_news_id",
      DROP COLUMN IF EXISTS "legacy_slug";

    ALTER TABLE "payload"."_careers_v"
      DROP COLUMN IF EXISTS "version_legacy_news_id",
      DROP COLUMN IF EXISTS "version_legacy_slug";

    ALTER TABLE "payload"."doctor_talks"
      DROP COLUMN IF EXISTS "legacy_news_id",
      DROP COLUMN IF EXISTS "legacy_slug";

    ALTER TABLE "payload"."_doctor_talks_v"
      DROP COLUMN IF EXISTS "version_legacy_news_id",
      DROP COLUMN IF EXISTS "version_legacy_slug";

    ALTER TABLE "payload"."insurance_updates"
      DROP COLUMN IF EXISTS "legacy_news_id",
      DROP COLUMN IF EXISTS "legacy_slug";

    ALTER TABLE "payload"."_insurance_updates_v"
      DROP COLUMN IF EXISTS "version_legacy_news_id",
      DROP COLUMN IF EXISTS "version_legacy_slug";

    ALTER TABLE "payload"."content_search_index"
      DROP COLUMN IF EXISTS "legacy_news_id",
      DROP COLUMN IF EXISTS "legacy_slug";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."announcements"
      ADD COLUMN IF NOT EXISTS "legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "legacy_slug" varchar;

    ALTER TABLE "payload"."_announcements_v"
      ADD COLUMN IF NOT EXISTS "version_legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "version_legacy_slug" varchar;

    ALTER TABLE "payload"."health_tips"
      ADD COLUMN IF NOT EXISTS "legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "legacy_slug" varchar;

    ALTER TABLE "payload"."_health_tips_v"
      ADD COLUMN IF NOT EXISTS "version_legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "version_legacy_slug" varchar;

    ALTER TABLE "payload"."careers"
      ADD COLUMN IF NOT EXISTS "legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "legacy_slug" varchar;

    ALTER TABLE "payload"."_careers_v"
      ADD COLUMN IF NOT EXISTS "version_legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "version_legacy_slug" varchar;

    ALTER TABLE "payload"."doctor_talks"
      ADD COLUMN IF NOT EXISTS "legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "legacy_slug" varchar;

    ALTER TABLE "payload"."_doctor_talks_v"
      ADD COLUMN IF NOT EXISTS "version_legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "version_legacy_slug" varchar;

    ALTER TABLE "payload"."insurance_updates"
      ADD COLUMN IF NOT EXISTS "legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "legacy_slug" varchar;

    ALTER TABLE "payload"."_insurance_updates_v"
      ADD COLUMN IF NOT EXISTS "version_legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "version_legacy_slug" varchar;

    ALTER TABLE "payload"."content_search_index"
      ADD COLUMN IF NOT EXISTS "legacy_news_id" integer,
      ADD COLUMN IF NOT EXISTS "legacy_slug" varchar;
  `)
}
