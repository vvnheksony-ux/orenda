import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."_news_v_rels" (
      "order" integer,
      "parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_news_v_rels_parent_fk'
      ) THEN
        ALTER TABLE "payload"."_news_v_rels"
          ADD CONSTRAINT "_news_v_rels_parent_fk"
          FOREIGN KEY ("parent_id") REFERENCES "payload"."_news_v"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_news_v_rels_media_id_fk'
      ) THEN
        ALTER TABLE "payload"."_news_v_rels"
          ADD CONSTRAINT "_news_v_rels_media_id_fk"
          FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "_news_v_rels_order_idx" ON "payload"."_news_v_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "_news_v_rels_parent_idx" ON "payload"."_news_v_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_news_v_rels_path_idx" ON "payload"."_news_v_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "_news_v_rels_media_id_idx" ON "payload"."_news_v_rels" USING btree ("media_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload"."_news_v_rels_media_id_idx";
    DROP INDEX IF EXISTS "payload"."_news_v_rels_path_idx";
    DROP INDEX IF EXISTS "payload"."_news_v_rels_parent_idx";
    DROP INDEX IF EXISTS "payload"."_news_v_rels_order_idx";
    ALTER TABLE "payload"."_news_v_rels" DROP CONSTRAINT IF EXISTS "_news_v_rels_media_id_fk";
    ALTER TABLE "payload"."_news_v_rels" DROP CONSTRAINT IF EXISTS "_news_v_rels_parent_fk";
    DROP TABLE IF EXISTS "payload"."_news_v_rels" CASCADE;
  `)
}
