import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Center of Excellence collection tables. NOTE: Payload's auto-generated migration
// tried to reconcile full-schema drift (868 lines / 91 DROPs of existing tables) and
// was discarded — this is the clean, additive CoE-only version.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
DO $$ BEGIN CREATE TYPE "payload"."enum_centers_of_excellence_status" AS ENUM('draft','published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "payload"."enum__centers_of_excellence_v_version_status" AS ENUM('draft','published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "payload"."enum__centers_of_excellence_v_published_locale" AS ENUM('en','km','zh'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "payload"."centers_of_excellence" (
  "id" serial PRIMARY KEY NOT NULL,
  "thumbnail_id" integer,
  "slug" varchar,
  "branch_id" integer,
  "success_rate" varchar,
  "surgeries" varchar,
  "satisfactions_rate" varchar,
  "order" numeric DEFAULT 0,
  "status" "payload"."enum_centers_of_excellence_status" DEFAULT 'draft',
  "published_at" timestamp(3) with time zone,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "_status" "payload"."enum_centers_of_excellence_status" DEFAULT 'draft'
);
CREATE TABLE IF NOT EXISTS "payload"."centers_of_excellence_locales" (
  "title" varchar,
  "description" jsonb,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "payload"."_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "payload"."centers_of_excellence_numbers" (
  "id" serial PRIMARY KEY NOT NULL,
  "number" numeric,
  "order" integer NOT NULL,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL
);
CREATE TABLE IF NOT EXISTS "payload"."centers_of_excellence_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "doctors_id" integer
);
CREATE TABLE IF NOT EXISTS "payload"."_centers_of_excellence_v" (
  "id" serial PRIMARY KEY NOT NULL,
  "parent_id" integer,
  "version_thumbnail_id" integer,
  "version_slug" varchar,
  "version_branch_id" integer,
  "version_success_rate" varchar,
  "version_surgeries" varchar,
  "version_satisfactions_rate" varchar,
  "version_order" numeric DEFAULT 0,
  "version_status" "payload"."enum__centers_of_excellence_v_version_status" DEFAULT 'draft',
  "version_published_at" timestamp(3) with time zone,
  "version_updated_at" timestamp(3) with time zone,
  "version_created_at" timestamp(3) with time zone,
  "version__status" "payload"."enum__centers_of_excellence_v_version_status" DEFAULT 'draft',
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "snapshot" boolean,
  "published_locale" "payload"."enum__centers_of_excellence_v_published_locale",
  "latest" boolean
);
CREATE TABLE IF NOT EXISTS "payload"."_centers_of_excellence_v_locales" (
  "version_title" varchar,
  "version_description" jsonb,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "payload"."_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "payload"."_centers_of_excellence_v_numbers" (
  "id" serial PRIMARY KEY NOT NULL,
  "number" numeric,
  "order" integer NOT NULL,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL
);
CREATE TABLE IF NOT EXISTS "payload"."_centers_of_excellence_v_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "doctors_id" integer
);

ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "centers_of_excellence_id" integer;

DO $$ BEGIN
  ALTER TABLE "payload"."centers_of_excellence" ADD CONSTRAINT "centers_of_excellence_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null;
  ALTER TABLE "payload"."centers_of_excellence" ADD CONSTRAINT "centers_of_excellence_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "payload"."branches"("id") ON DELETE set null;
  ALTER TABLE "payload"."centers_of_excellence_locales" ADD CONSTRAINT "centers_of_excellence_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."centers_of_excellence"("id") ON DELETE cascade;
  ALTER TABLE "payload"."centers_of_excellence_numbers" ADD CONSTRAINT "centers_of_excellence_numbers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."centers_of_excellence"("id") ON DELETE cascade;
  ALTER TABLE "payload"."centers_of_excellence_rels" ADD CONSTRAINT "centers_of_excellence_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."centers_of_excellence"("id") ON DELETE cascade;
  ALTER TABLE "payload"."centers_of_excellence_rels" ADD CONSTRAINT "centers_of_excellence_rels_doctors_fk" FOREIGN KEY ("doctors_id") REFERENCES "payload"."doctors"("id") ON DELETE cascade;
  ALTER TABLE "payload"."_centers_of_excellence_v" ADD CONSTRAINT "_centers_of_excellence_v_parent_id_centers_of_excellence_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."centers_of_excellence"("id") ON DELETE set null;
  ALTER TABLE "payload"."_centers_of_excellence_v" ADD CONSTRAINT "_centers_of_excellence_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null;
  ALTER TABLE "payload"."_centers_of_excellence_v" ADD CONSTRAINT "_centers_of_excellence_v_version_branch_id_branches_id_fk" FOREIGN KEY ("version_branch_id") REFERENCES "payload"."branches"("id") ON DELETE set null;
  ALTER TABLE "payload"."_centers_of_excellence_v_locales" ADD CONSTRAINT "_centers_of_excellence_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_centers_of_excellence_v"("id") ON DELETE cascade;
  ALTER TABLE "payload"."_centers_of_excellence_v_numbers" ADD CONSTRAINT "_centers_of_excellence_v_numbers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_centers_of_excellence_v"("id") ON DELETE cascade;
  ALTER TABLE "payload"."_centers_of_excellence_v_rels" ADD CONSTRAINT "_centers_of_excellence_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_centers_of_excellence_v"("id") ON DELETE cascade;
  ALTER TABLE "payload"."_centers_of_excellence_v_rels" ADD CONSTRAINT "_centers_of_excellence_v_rels_doctors_fk" FOREIGN KEY ("doctors_id") REFERENCES "payload"."doctors"("id") ON DELETE cascade;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_centers_of_excellence_fk" FOREIGN KEY ("centers_of_excellence_id") REFERENCES "payload"."centers_of_excellence"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "centers_of_excellence_thumbnail_idx" ON "payload"."centers_of_excellence" ("thumbnail_id");
CREATE UNIQUE INDEX IF NOT EXISTS "centers_of_excellence_slug_idx" ON "payload"."centers_of_excellence" ("slug");
CREATE INDEX IF NOT EXISTS "centers_of_excellence_branch_idx" ON "payload"."centers_of_excellence" ("branch_id");
CREATE INDEX IF NOT EXISTS "centers_of_excellence_updated_at_idx" ON "payload"."centers_of_excellence" ("updated_at");
CREATE INDEX IF NOT EXISTS "centers_of_excellence_created_at_idx" ON "payload"."centers_of_excellence" ("created_at");
CREATE INDEX IF NOT EXISTS "centers_of_excellence__status_idx" ON "payload"."centers_of_excellence" ("_status");
CREATE UNIQUE INDEX IF NOT EXISTS "centers_of_excellence_locales_locale_parent_id_unique" ON "payload"."centers_of_excellence_locales" ("_locale","_parent_id");
CREATE INDEX IF NOT EXISTS "centers_of_excellence_numbers_order_parent_idx" ON "payload"."centers_of_excellence_numbers" ("order","parent_id");
CREATE INDEX IF NOT EXISTS "centers_of_excellence_rels_order_idx" ON "payload"."centers_of_excellence_rels" ("order");
CREATE INDEX IF NOT EXISTS "centers_of_excellence_rels_parent_idx" ON "payload"."centers_of_excellence_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "centers_of_excellence_rels_path_idx" ON "payload"."centers_of_excellence_rels" ("path");
CREATE INDEX IF NOT EXISTS "centers_of_excellence_rels_doctors_id_idx" ON "payload"."centers_of_excellence_rels" ("doctors_id");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_parent_idx" ON "payload"."_centers_of_excellence_v" ("parent_id");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_version_version_thumbnail_idx" ON "payload"."_centers_of_excellence_v" ("version_thumbnail_id");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_version_version_slug_idx" ON "payload"."_centers_of_excellence_v" ("version_slug");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_version_version_branch_idx" ON "payload"."_centers_of_excellence_v" ("version_branch_id");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_version_version_updated_at_idx" ON "payload"."_centers_of_excellence_v" ("version_updated_at");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_version_version_created_at_idx" ON "payload"."_centers_of_excellence_v" ("version_created_at");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_version_version__status_idx" ON "payload"."_centers_of_excellence_v" ("version__status");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_created_at_idx" ON "payload"."_centers_of_excellence_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_updated_at_idx" ON "payload"."_centers_of_excellence_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_snapshot_idx" ON "payload"."_centers_of_excellence_v" ("snapshot");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_published_locale_idx" ON "payload"."_centers_of_excellence_v" ("published_locale");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_latest_idx" ON "payload"."_centers_of_excellence_v" ("latest");
CREATE UNIQUE INDEX IF NOT EXISTS "_centers_of_excellence_v_locales_locale_parent_id_unique" ON "payload"."_centers_of_excellence_v_locales" ("_locale","_parent_id");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_numbers_order_parent_idx" ON "payload"."_centers_of_excellence_v_numbers" ("order","parent_id");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_rels_order_idx" ON "payload"."_centers_of_excellence_v_rels" ("order");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_rels_parent_idx" ON "payload"."_centers_of_excellence_v_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_rels_path_idx" ON "payload"."_centers_of_excellence_v_rels" ("path");
CREATE INDEX IF NOT EXISTS "_centers_of_excellence_v_rels_doctors_id_idx" ON "payload"."_centers_of_excellence_v_rels" ("doctors_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_centers_of_excellence_id_idx" ON "payload"."payload_locked_documents_rels" ("centers_of_excellence_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload"."_centers_of_excellence_v_rels";
    DROP TABLE IF EXISTS "payload"."_centers_of_excellence_v_numbers";
    DROP TABLE IF EXISTS "payload"."_centers_of_excellence_v_locales";
    DROP TABLE IF EXISTS "payload"."_centers_of_excellence_v";
    DROP TABLE IF EXISTS "payload"."centers_of_excellence_rels";
    DROP TABLE IF EXISTS "payload"."centers_of_excellence_numbers";
    DROP TABLE IF EXISTS "payload"."centers_of_excellence_locales";
    DROP TABLE IF EXISTS "payload"."centers_of_excellence";
    ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "centers_of_excellence_id";
    DROP TYPE IF EXISTS "payload"."enum__centers_of_excellence_v_published_locale";
    DROP TYPE IF EXISTS "payload"."enum__centers_of_excellence_v_version_status";
    DROP TYPE IF EXISTS "payload"."enum_centers_of_excellence_status";
  `)
}
