import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "announcements_id" integer;
    ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "health_tips_id" integer;
    ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "careers_id" integer;
    ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "doctor_talks_id" integer;
    ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "insurance_updates_id" integer;
    ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "content_search_index_id" integer;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_announcements_fk'
      ) THEN
        ALTER TABLE "payload"."payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk"
          FOREIGN KEY ("announcements_id") REFERENCES "payload"."announcements"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_health_tips_fk'
      ) THEN
        ALTER TABLE "payload"."payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_health_tips_fk"
          FOREIGN KEY ("health_tips_id") REFERENCES "payload"."health_tips"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_careers_fk'
      ) THEN
        ALTER TABLE "payload"."payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_careers_fk"
          FOREIGN KEY ("careers_id") REFERENCES "payload"."careers"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_doctor_talks_fk'
      ) THEN
        ALTER TABLE "payload"."payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_doctor_talks_fk"
          FOREIGN KEY ("doctor_talks_id") REFERENCES "payload"."doctor_talks"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_insurance_updates_fk'
      ) THEN
        ALTER TABLE "payload"."payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_insurance_updates_fk"
          FOREIGN KEY ("insurance_updates_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_content_search_index_fk'
      ) THEN
        ALTER TABLE "payload"."payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_content_search_index_fk"
          FOREIGN KEY ("content_search_index_id") REFERENCES "payload"."content_search_index"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_announcements_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("announcements_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_health_tips_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("health_tips_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_careers_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("careers_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_doctor_talks_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("doctor_talks_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_insurance_updates_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("insurance_updates_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_content_search_index_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("content_search_index_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_announcements_fk";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_health_tips_fk";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_careers_fk";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_doctor_talks_fk";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_insurance_updates_fk";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_content_search_index_fk";

    DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_announcements_id_idx";
    DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_health_tips_id_idx";
    DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_careers_id_idx";
    DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_doctor_talks_id_idx";
    DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_insurance_updates_id_idx";
    DROP INDEX IF EXISTS "payload"."payload_locked_documents_rels_content_search_index_id_idx";

    ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "announcements_id";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "health_tips_id";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "careers_id";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "doctor_talks_id";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "insurance_updates_id";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "content_search_index_id";
  `)
}
