import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS "public"."mekong_otp_challenges" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "phone" text NOT NULL,
      "code_hash" text NOT NULL,
      "attempts" integer NOT NULL DEFAULT 0,
      "expires_at" timestamptz NOT NULL,
      "consumed_at" timestamptz,
      "created_at" timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "mekong_otp_challenges_phone_created_idx"
      ON "public"."mekong_otp_challenges" ("phone", "created_at" DESC);

    GRANT USAGE ON SCHEMA "public" TO anon, authenticated, service_role;
    GRANT ALL PRIVILEGES ON TABLE "public"."mekong_otp_challenges" TO service_role;
    GRANT SELECT, INSERT, UPDATE ON TABLE "public"."mekong_otp_challenges" TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON TABLE "public"."mekong_otp_challenges" TO anon;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DROP TABLE IF EXISTS "public"."mekong_otp_challenges";
  `)
}
