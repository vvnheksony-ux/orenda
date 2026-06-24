import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Adds the `target_scene_id` link on tour-scene hotspots so a hotspot (pin) can
// navigate the visitor to another room when clicked. Single relationship →
// stored as a direct FK column on the hotspots row table.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."tour_scenes_hotspots"
      ADD COLUMN IF NOT EXISTS "target_scene_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload"."tour_scenes_hotspots"
        ADD CONSTRAINT "tour_scenes_hotspots_target_scene_id_fk"
        FOREIGN KEY ("target_scene_id") REFERENCES "payload"."tour_scenes"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "tour_scenes_hotspots_target_scene_id_idx"
      ON "payload"."tour_scenes_hotspots" ("target_scene_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."tour_scenes_hotspots" DROP COLUMN IF EXISTS "target_scene_id";
  `)
}
