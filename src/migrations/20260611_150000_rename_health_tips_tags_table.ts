import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload"."health_tips_tags"
      RENAME TO "health_tips_health_tip_tags";

    ALTER TABLE IF EXISTS "payload"."health_tips_health_tip_tags"
      DROP CONSTRAINT IF EXISTS "health_tips_tags_parent_id_fk";

    ALTER TABLE IF EXISTS "payload"."health_tips_health_tip_tags"
      ADD CONSTRAINT "health_tips_health_tip_tags_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "payload"."health_tips"("id")
      ON DELETE cascade ON UPDATE no action;

    DROP INDEX IF EXISTS "payload"."health_tips_tags_parent_idx";
    CREATE INDEX IF NOT EXISTS "health_tips_health_tip_tags_parent_idx"
      ON "payload"."health_tips_health_tip_tags" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload"."health_tips_health_tip_tags"
      DROP CONSTRAINT IF EXISTS "health_tips_health_tip_tags_parent_id_fk";

    ALTER TABLE IF EXISTS "payload"."health_tips_health_tip_tags"
      ADD CONSTRAINT "health_tips_tags_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "payload"."health_tips"("id")
      ON DELETE cascade ON UPDATE no action;

    DROP INDEX IF EXISTS "payload"."health_tips_health_tip_tags_parent_idx";
    CREATE INDEX IF NOT EXISTS "health_tips_tags_parent_idx"
      ON "payload"."health_tips_health_tip_tags" USING btree ("_parent_id");

    ALTER TABLE IF EXISTS "payload"."health_tips_health_tip_tags"
      RENAME TO "health_tips_tags";
  `)
}
