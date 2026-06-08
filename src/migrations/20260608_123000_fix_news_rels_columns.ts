import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Drop incorrect table first
    DROP TABLE IF EXISTS "payload"."news_rels" CASCADE;

    -- 1. Create rels table with correct column names (matching Payload convention)
    CREATE TABLE "payload"."news_rels" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    -- 2. FK constraints
    ALTER TABLE "payload"."news_rels"
      ADD CONSTRAINT "news_rels_parent_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "payload"."news"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload"."news_rels"
      ADD CONSTRAINT "news_rels_media_id_fk"
      FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id")
      ON DELETE set null ON UPDATE no action;

    -- 3. Indexes
    CREATE INDEX "news_rels_parent_id_idx" ON "payload"."news_rels" USING btree ("parent_id");
    CREATE INDEX "news_rels_path_idx" ON "payload"."news_rels" USING btree ("path");
    CREATE INDEX "news_rels_media_id_idx" ON "payload"."news_rels" USING btree ("media_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload"."news_rels_media_id_idx";
    DROP INDEX IF EXISTS "payload"."news_rels_path_idx";
    DROP INDEX IF EXISTS "payload"."news_rels_parent_id_idx";
    ALTER TABLE "payload"."news_rels" DROP CONSTRAINT IF EXISTS "news_rels_media_id_fk";
    ALTER TABLE "payload"."news_rels" DROP CONSTRAINT IF EXISTS "news_rels_parent_id_fk";
    DROP TABLE IF EXISTS "payload"."news_rels" CASCADE;
  `)
}