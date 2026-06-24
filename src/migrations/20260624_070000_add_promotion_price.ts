import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Adds `price` (current/sale) and `originalPrice` (struck-through) text fields to
// Promotions, shown as a price pill on the promotion card. Promotions has
// drafts/versions enabled, so the versioned table needs the mirrored
// `version_*` columns. Non-localized — a price label is the same across languages.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."promotions" ADD COLUMN IF NOT EXISTS "price" varchar;
    ALTER TABLE "payload"."promotions" ADD COLUMN IF NOT EXISTS "original_price" varchar;
    ALTER TABLE "payload"."_promotions_v" ADD COLUMN IF NOT EXISTS "version_price" varchar;
    ALTER TABLE "payload"."_promotions_v" ADD COLUMN IF NOT EXISTS "version_original_price" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."promotions" DROP COLUMN IF EXISTS "price";
    ALTER TABLE "payload"."promotions" DROP COLUMN IF EXISTS "original_price";
    ALTER TABLE "payload"."_promotions_v" DROP COLUMN IF EXISTS "version_price";
    ALTER TABLE "payload"."_promotions_v" DROP COLUMN IF EXISTS "version_original_price";
  `)
}
