import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "public"."telegram_subscribers" (
      "id" serial PRIMARY KEY NOT NULL,
      "chat_id" varchar NOT NULL,
      "username" varchar,
      "first_name" varchar,
      "last_name" varchar,
      "is_active" boolean DEFAULT true NOT NULL,
      "last_started_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "telegram_subscribers_chat_id_unique" UNIQUE("chat_id")
    );

    CREATE INDEX IF NOT EXISTS "telegram_subscribers_active_idx"
      ON "public"."telegram_subscribers" ("is_active", "updated_at" DESC);

    ALTER TABLE "public"."telegram_subscribers" ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE "public"."telegram_subscribers" FROM anon, authenticated;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "public"."telegram_subscribers";
  `)
}
