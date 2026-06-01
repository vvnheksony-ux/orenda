import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_service_packages_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__service_packages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__service_packages_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TABLE "payload"."service_packages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"department_id" integer,
  	"promotion_id" integer,
  	"image_id" integer,
  	"order" numeric DEFAULT 0,
  	"status" "payload"."enum_service_packages_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_service_packages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."service_packages_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"price_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."service_packages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  CREATE TABLE "payload"."_service_packages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_department_id" integer,
  	"version_promotion_id" integer,
  	"version_image_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_status" "payload"."enum__service_packages_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__service_packages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__service_packages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_service_packages_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"version_price_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_service_packages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "service_packages_id" integer;
  ALTER TABLE "payload"."service_packages" ADD CONSTRAINT "service_packages_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."service_packages" ADD CONSTRAINT "service_packages_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "payload"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."service_packages" ADD CONSTRAINT "service_packages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."service_packages_locales" ADD CONSTRAINT "service_packages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."service_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."service_packages_rels" ADD CONSTRAINT "service_packages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."service_packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."service_packages_rels" ADD CONSTRAINT "service_packages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "payload"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_service_packages_v" ADD CONSTRAINT "_service_packages_v_parent_id_service_packages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."service_packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_service_packages_v" ADD CONSTRAINT "_service_packages_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_service_packages_v" ADD CONSTRAINT "_service_packages_v_version_promotion_id_promotions_id_fk" FOREIGN KEY ("version_promotion_id") REFERENCES "payload"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_service_packages_v" ADD CONSTRAINT "_service_packages_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_service_packages_v_locales" ADD CONSTRAINT "_service_packages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_service_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_service_packages_v_rels" ADD CONSTRAINT "_service_packages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_service_packages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_service_packages_v_rels" ADD CONSTRAINT "_service_packages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "payload"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "service_packages_slug_idx" ON "payload"."service_packages" USING btree ("slug");
  CREATE INDEX "service_packages_department_idx" ON "payload"."service_packages" USING btree ("department_id");
  CREATE INDEX "service_packages_promotion_idx" ON "payload"."service_packages" USING btree ("promotion_id");
  CREATE INDEX "service_packages_image_idx" ON "payload"."service_packages" USING btree ("image_id");
  CREATE INDEX "service_packages_updated_at_idx" ON "payload"."service_packages" USING btree ("updated_at");
  CREATE INDEX "service_packages_created_at_idx" ON "payload"."service_packages" USING btree ("created_at");
  CREATE INDEX "service_packages__status_idx" ON "payload"."service_packages" USING btree ("_status");
  CREATE UNIQUE INDEX "service_packages_locales_locale_parent_id_unique" ON "payload"."service_packages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "service_packages_rels_order_idx" ON "payload"."service_packages_rels" USING btree ("order");
  CREATE INDEX "service_packages_rels_parent_idx" ON "payload"."service_packages_rels" USING btree ("parent_id");
  CREATE INDEX "service_packages_rels_path_idx" ON "payload"."service_packages_rels" USING btree ("path");
  CREATE INDEX "service_packages_rels_services_id_idx" ON "payload"."service_packages_rels" USING btree ("services_id");
  CREATE INDEX "_service_packages_v_parent_idx" ON "payload"."_service_packages_v" USING btree ("parent_id");
  CREATE INDEX "_service_packages_v_version_version_slug_idx" ON "payload"."_service_packages_v" USING btree ("version_slug");
  CREATE INDEX "_service_packages_v_version_version_department_idx" ON "payload"."_service_packages_v" USING btree ("version_department_id");
  CREATE INDEX "_service_packages_v_version_version_promotion_idx" ON "payload"."_service_packages_v" USING btree ("version_promotion_id");
  CREATE INDEX "_service_packages_v_version_version_image_idx" ON "payload"."_service_packages_v" USING btree ("version_image_id");
  CREATE INDEX "_service_packages_v_version_version_updated_at_idx" ON "payload"."_service_packages_v" USING btree ("version_updated_at");
  CREATE INDEX "_service_packages_v_version_version_created_at_idx" ON "payload"."_service_packages_v" USING btree ("version_created_at");
  CREATE INDEX "_service_packages_v_version_version__status_idx" ON "payload"."_service_packages_v" USING btree ("version__status");
  CREATE INDEX "_service_packages_v_created_at_idx" ON "payload"."_service_packages_v" USING btree ("created_at");
  CREATE INDEX "_service_packages_v_updated_at_idx" ON "payload"."_service_packages_v" USING btree ("updated_at");
  CREATE INDEX "_service_packages_v_snapshot_idx" ON "payload"."_service_packages_v" USING btree ("snapshot");
  CREATE INDEX "_service_packages_v_published_locale_idx" ON "payload"."_service_packages_v" USING btree ("published_locale");
  CREATE INDEX "_service_packages_v_latest_idx" ON "payload"."_service_packages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_service_packages_v_locales_locale_parent_id_unique" ON "payload"."_service_packages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_service_packages_v_rels_order_idx" ON "payload"."_service_packages_v_rels" USING btree ("order");
  CREATE INDEX "_service_packages_v_rels_parent_idx" ON "payload"."_service_packages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_service_packages_v_rels_path_idx" ON "payload"."_service_packages_v_rels" USING btree ("path");
  CREATE INDEX "_service_packages_v_rels_services_id_idx" ON "payload"."_service_packages_v_rels" USING btree ("services_id");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_packages_fk" FOREIGN KEY ("service_packages_id") REFERENCES "payload"."service_packages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_service_packages_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("service_packages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."service_packages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."service_packages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."service_packages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_service_packages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_service_packages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_service_packages_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."service_packages" CASCADE;
  DROP TABLE "payload"."service_packages_locales" CASCADE;
  DROP TABLE "payload"."service_packages_rels" CASCADE;
  DROP TABLE "payload"."_service_packages_v" CASCADE;
  DROP TABLE "payload"."_service_packages_v_locales" CASCADE;
  DROP TABLE "payload"."_service_packages_v_rels" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_service_packages_fk";
  
  DROP INDEX "payload"."payload_locked_documents_rels_service_packages_id_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "service_packages_id";
  DROP TYPE "payload"."enum_service_packages_status";
  DROP TYPE "payload"."enum__service_packages_v_version_status";
  DROP TYPE "payload"."enum__service_packages_v_published_locale";`)
}
