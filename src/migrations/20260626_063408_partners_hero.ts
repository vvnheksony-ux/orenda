import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_partners_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__partners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__partners_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_hero_background_type" AS ENUM('video', 'image');
  CREATE TABLE "payload"."partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"website" varchar,
  	"order" numeric DEFAULT 0,
  	"status" "payload"."enum_partners_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_partners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_partners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_logo_id" integer,
  	"version_website" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_status" "payload"."enum__partners_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__partners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__partners_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"background_type" "payload"."enum_hero_background_type" DEFAULT 'video',
  	"background_video_id" integer,
  	"background_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."hero_locales" (
  	"testimonial_name" varchar,
  	"testimonial_role" varchar,
  	"testimonial_quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "payload"."partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_partners_v" ADD CONSTRAINT "_partners_v_parent_id_partners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_partners_v" ADD CONSTRAINT "_partners_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."hero" ADD CONSTRAINT "hero_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."hero" ADD CONSTRAINT "hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."hero_locales" ADD CONSTRAINT "hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."hero"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "partners_logo_idx" ON "payload"."partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "payload"."partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "payload"."partners" USING btree ("created_at");
  CREATE INDEX "partners__status_idx" ON "payload"."partners" USING btree ("_status");
  CREATE INDEX "_partners_v_parent_idx" ON "payload"."_partners_v" USING btree ("parent_id");
  CREATE INDEX "_partners_v_version_version_logo_idx" ON "payload"."_partners_v" USING btree ("version_logo_id");
  CREATE INDEX "_partners_v_version_version_updated_at_idx" ON "payload"."_partners_v" USING btree ("version_updated_at");
  CREATE INDEX "_partners_v_version_version_created_at_idx" ON "payload"."_partners_v" USING btree ("version_created_at");
  CREATE INDEX "_partners_v_version_version__status_idx" ON "payload"."_partners_v" USING btree ("version__status");
  CREATE INDEX "_partners_v_created_at_idx" ON "payload"."_partners_v" USING btree ("created_at");
  CREATE INDEX "_partners_v_updated_at_idx" ON "payload"."_partners_v" USING btree ("updated_at");
  CREATE INDEX "_partners_v_snapshot_idx" ON "payload"."_partners_v" USING btree ("snapshot");
  CREATE INDEX "_partners_v_published_locale_idx" ON "payload"."_partners_v" USING btree ("published_locale");
  CREATE INDEX "_partners_v_latest_idx" ON "payload"."_partners_v" USING btree ("latest");
  CREATE INDEX "hero_background_video_idx" ON "payload"."hero" USING btree ("background_video_id");
  CREATE INDEX "hero_background_image_idx" ON "payload"."hero" USING btree ("background_image_id");
  CREATE UNIQUE INDEX "hero_locales_locale_parent_id_unique" ON "payload"."hero_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "payload"."partners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("partners_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_partners_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."hero_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."partners" CASCADE;
  DROP TABLE "payload"."_partners_v" CASCADE;
  DROP TABLE "payload"."hero" CASCADE;
  DROP TABLE "payload"."hero_locales" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_partners_fk";
  
  DROP INDEX "payload"."payload_locked_documents_rels_partners_id_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "partners_id";
  DROP TYPE "payload"."enum_partners_status";
  DROP TYPE "payload"."enum__partners_v_version_status";
  DROP TYPE "payload"."enum__partners_v_published_locale";
  DROP TYPE "payload"."enum_hero_background_type";`)
}
