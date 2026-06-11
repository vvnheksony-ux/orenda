import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."tour_scenes"
      ADD COLUMN IF NOT EXISTS "branch_id" integer;

    ALTER TABLE "payload"."tour_scenes"
      ADD CONSTRAINT "tour_scenes_branch_id_branches_id_fk"
      FOREIGN KEY ("branch_id") REFERENCES "payload"."branches"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;

    CREATE INDEX IF NOT EXISTS "tour_scenes_branch_idx"
      ON "payload"."tour_scenes" USING btree ("branch_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."tour_scenes" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "payload"."tour_scenes" DROP CONSTRAINT IF EXISTS "tour_scenes_branch_id_branches_id_fk";
    DROP INDEX IF EXISTS "payload"."tour_scenes_branch_idx";
    ALTER TABLE "payload"."tour_scenes" DROP COLUMN IF EXISTS "branch_id";
  `)
}