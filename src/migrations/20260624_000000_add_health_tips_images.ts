import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Adds the `images` (upload hasMany) relation for HealthTips — a gallery of
// extra images per article. HealthTips has drafts/versions enabled, so BOTH the
// main rels table AND the versioned rels table are required (mirrors news_rels
// + _news_v_rels).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."health_tips_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer,
      CONSTRAINT "health_tips_rels_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."health_tips"("id") ON DELETE CASCADE,
      CONSTRAINT "health_tips_rels_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS "health_tips_rels_parent_id_idx" ON "payload"."health_tips_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "health_tips_rels_path_idx" ON "payload"."health_tips_rels" ("path");
    CREATE INDEX IF NOT EXISTS "health_tips_rels_media_id_idx" ON "payload"."health_tips_rels" ("media_id");

    -- Versioned/drafts rels table (required because HealthTips has versions enabled).
    CREATE TABLE IF NOT EXISTS "payload"."_health_tips_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer,
      CONSTRAINT "_health_tips_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_health_tips_v"("id") ON DELETE CASCADE,
      CONSTRAINT "_health_tips_v_rels_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS "_health_tips_v_rels_order_idx" ON "payload"."_health_tips_v_rels" ("order");
    CREATE INDEX IF NOT EXISTS "_health_tips_v_rels_parent_idx" ON "payload"."_health_tips_v_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "_health_tips_v_rels_path_idx" ON "payload"."_health_tips_v_rels" ("path");
    CREATE INDEX IF NOT EXISTS "_health_tips_v_rels_media_id_idx" ON "payload"."_health_tips_v_rels" ("media_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload"."_health_tips_v_rels";
    DROP TABLE IF EXISTS "payload"."health_tips_rels";
  `)
}
