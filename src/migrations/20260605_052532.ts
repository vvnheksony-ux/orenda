import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_announcements_priority" AS ENUM('low', 'medium', 'high', 'urgent');
  CREATE TYPE "payload"."enum_announcements_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__announcements_v_version_priority" AS ENUM('low', 'medium', 'high', 'urgent');
  CREATE TYPE "payload"."enum__announcements_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__announcements_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_health_tips_health_tip_category" AS ENUM('nutrition', 'exercise', 'mentalHealth', 'preventiveCare', 'chronicDisease');
  CREATE TYPE "payload"."enum_health_tips_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__health_tips_v_version_health_tip_category" AS ENUM('nutrition', 'exercise', 'mentalHealth', 'preventiveCare', 'chronicDisease');
  CREATE TYPE "payload"."enum__health_tips_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__health_tips_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_careers_career_employment_type" AS ENUM('full_time', 'part_time', 'contract', 'visiting');
  CREATE TYPE "payload"."enum_careers_experience_level" AS ENUM('entry', 'mid', 'senior');
  CREATE TYPE "payload"."enum_careers_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__careers_v_version_career_employment_type" AS ENUM('full_time', 'part_time', 'contract', 'visiting');
  CREATE TYPE "payload"."enum__careers_v_version_experience_level" AS ENUM('entry', 'mid', 'senior');
  CREATE TYPE "payload"."enum__careers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__careers_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_doctor_talks_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__doctor_talks_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__doctor_talks_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_insurance_updates_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__insurance_updates_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__insurance_updates_v_published_locale" AS ENUM('en', 'km', 'zh');
  ALTER TYPE "payload"."enum_analytics_events_event" ADD VALUE 'tour_scene_view' BEFORE 'doctor_click';
  ALTER TYPE "payload"."enum_analytics_events_event" ADD VALUE 'language_switch' BEFORE 'call_click';
  CREATE TABLE "payload"."announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"thumbnail_id" integer,
  	"author" varchar,
  	"legacy_news_id" numeric,
  	"legacy_slug" varchar,
  	"slug" varchar,
  	"priority" "payload"."enum_announcements_priority" DEFAULT 'medium',
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"is_banner" boolean DEFAULT false,
  	"banner_background_color" varchar,
  	"status" "payload"."enum_announcements_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_announcements_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."announcements_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_announcements_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_thumbnail_id" integer,
  	"version_author" varchar,
  	"version_legacy_news_id" numeric,
  	"version_legacy_slug" varchar,
  	"version_slug" varchar,
  	"version_priority" "payload"."enum__announcements_v_version_priority" DEFAULT 'medium',
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_is_banner" boolean DEFAULT false,
  	"version_banner_background_color" varchar,
  	"version_status" "payload"."enum__announcements_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__announcements_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__announcements_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_announcements_v_locales" (
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."health_tips_health_tip_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "payload"."health_tips" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"thumbnail_id" integer,
  	"author" varchar,
  	"legacy_news_id" numeric,
  	"legacy_slug" varchar,
  	"slug" varchar,
  	"health_tip_category" "payload"."enum_health_tips_health_tip_category",
  	"reading_time" numeric,
  	"status" "payload"."enum_health_tips_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_health_tips_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."health_tips_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_health_tips_v_version_health_tip_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_health_tips_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_thumbnail_id" integer,
  	"version_author" varchar,
  	"version_legacy_news_id" numeric,
  	"version_legacy_slug" varchar,
  	"version_slug" varchar,
  	"version_health_tip_category" "payload"."enum__health_tips_v_version_health_tip_category",
  	"version_reading_time" numeric,
  	"version_status" "payload"."enum__health_tips_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__health_tips_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__health_tips_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_health_tips_v_locales" (
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."careers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"thumbnail_id" integer,
  	"author" varchar,
  	"legacy_news_id" numeric,
  	"legacy_slug" varchar,
  	"slug" varchar,
  	"career_department_id" integer,
  	"career_location_id" integer,
  	"career_employment_type" "payload"."enum_careers_career_employment_type",
  	"experience_level" "payload"."enum_careers_experience_level",
  	"application_deadline" timestamp(3) with time zone,
  	"status" "payload"."enum_careers_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_careers_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."careers_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"excerpt" varchar,
  	"position" varchar,
  	"salary_range" varchar,
  	"career_requirements" jsonb,
  	"responsibilities" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_careers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_thumbnail_id" integer,
  	"version_author" varchar,
  	"version_legacy_news_id" numeric,
  	"version_legacy_slug" varchar,
  	"version_slug" varchar,
  	"version_career_department_id" integer,
  	"version_career_location_id" integer,
  	"version_career_employment_type" "payload"."enum__careers_v_version_career_employment_type",
  	"version_experience_level" "payload"."enum__careers_v_version_experience_level",
  	"version_application_deadline" timestamp(3) with time zone,
  	"version_status" "payload"."enum__careers_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__careers_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__careers_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_careers_v_locales" (
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_excerpt" varchar,
  	"version_position" varchar,
  	"version_salary_range" varchar,
  	"version_career_requirements" jsonb,
  	"version_responsibilities" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."doctor_talks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"thumbnail_id" integer,
  	"author" varchar,
  	"legacy_news_id" numeric,
  	"legacy_slug" varchar,
  	"slug" varchar,
  	"featured_doctor_id" integer,
  	"event_date" timestamp(3) with time zone,
  	"event_time" varchar,
  	"duration" numeric,
  	"is_virtual" boolean DEFAULT false,
  	"meeting_link" varchar,
  	"max_attendees" numeric,
  	"status" "payload"."enum_doctor_talks_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_doctor_talks_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."doctor_talks_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"excerpt" varchar,
  	"talk_topic" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_doctor_talks_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_thumbnail_id" integer,
  	"version_author" varchar,
  	"version_legacy_news_id" numeric,
  	"version_legacy_slug" varchar,
  	"version_slug" varchar,
  	"version_featured_doctor_id" integer,
  	"version_event_date" timestamp(3) with time zone,
  	"version_event_time" varchar,
  	"version_duration" numeric,
  	"version_is_virtual" boolean DEFAULT false,
  	"version_meeting_link" varchar,
  	"version_max_attendees" numeric,
  	"version_status" "payload"."enum__doctor_talks_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__doctor_talks_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__doctor_talks_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_doctor_talks_v_locales" (
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_excerpt" varchar,
  	"version_talk_topic" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."insurance_updates_insurance_plan_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"plan_type" varchar
  );
  
  CREATE TABLE "payload"."insurance_updates_required_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document" varchar
  );
  
  CREATE TABLE "payload"."insurance_updates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"thumbnail_id" integer,
  	"author" varchar,
  	"legacy_news_id" numeric,
  	"legacy_slug" varchar,
  	"slug" varchar,
  	"insurance_provider" varchar,
  	"insurance_contact_person" varchar,
  	"insurance_contact_phone" varchar,
  	"insurance_contact_email" varchar,
  	"effective_date" timestamp(3) with time zone,
  	"expiration_date" timestamp(3) with time zone,
  	"status" "payload"."enum_insurance_updates_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_insurance_updates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."insurance_updates_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"excerpt" varchar,
  	"coverage_details" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_insurance_updates_v_version_insurance_plan_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"plan_type" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_insurance_updates_v_version_required_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_insurance_updates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_thumbnail_id" integer,
  	"version_author" varchar,
  	"version_legacy_news_id" numeric,
  	"version_legacy_slug" varchar,
  	"version_slug" varchar,
  	"version_insurance_provider" varchar,
  	"version_insurance_contact_person" varchar,
  	"version_insurance_contact_phone" varchar,
  	"version_insurance_contact_email" varchar,
  	"version_effective_date" timestamp(3) with time zone,
  	"version_expiration_date" timestamp(3) with time zone,
  	"version_status" "payload"."enum__insurance_updates_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__insurance_updates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__insurance_updates_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_insurance_updates_v_locales" (
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_excerpt" varchar,
  	"version_coverage_details" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."content_search_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_collection" varchar NOT NULL,
  	"source_id" varchar NOT NULL,
  	"content_type" varchar NOT NULL,
  	"locale" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"canonical_path" varchar NOT NULL,
  	"excerpt" varchar,
  	"body_text" varchar,
  	"thumbnail_id" integer,
  	"status" varchar,
  	"published_at" timestamp(3) with time zone,
  	"legacy_news_id" numeric,
  	"legacy_slug" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "announcements_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "health_tips_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "careers_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "doctor_talks_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "insurance_updates_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "content_search_index_id" integer;
  ALTER TABLE "payload"."announcements" ADD CONSTRAINT "announcements_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."announcements_locales" ADD CONSTRAINT "announcements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_announcements_v" ADD CONSTRAINT "_announcements_v_parent_id_announcements_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."announcements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_announcements_v" ADD CONSTRAINT "_announcements_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_announcements_v_locales" ADD CONSTRAINT "_announcements_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_announcements_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."health_tips_health_tip_tags" ADD CONSTRAINT "health_tips_health_tip_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."health_tips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."health_tips" ADD CONSTRAINT "health_tips_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."health_tips_locales" ADD CONSTRAINT "health_tips_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."health_tips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_health_tips_v_version_health_tip_tags" ADD CONSTRAINT "_health_tips_v_version_health_tip_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_health_tips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_health_tips_v" ADD CONSTRAINT "_health_tips_v_parent_id_health_tips_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."health_tips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_health_tips_v" ADD CONSTRAINT "_health_tips_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_health_tips_v_locales" ADD CONSTRAINT "_health_tips_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_health_tips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."careers" ADD CONSTRAINT "careers_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."careers" ADD CONSTRAINT "careers_career_department_id_departments_id_fk" FOREIGN KEY ("career_department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."careers" ADD CONSTRAINT "careers_career_location_id_branches_id_fk" FOREIGN KEY ("career_location_id") REFERENCES "payload"."branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."careers_locales" ADD CONSTRAINT "careers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."careers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_careers_v" ADD CONSTRAINT "_careers_v_parent_id_careers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."careers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_careers_v" ADD CONSTRAINT "_careers_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_careers_v" ADD CONSTRAINT "_careers_v_version_career_department_id_departments_id_fk" FOREIGN KEY ("version_career_department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_careers_v" ADD CONSTRAINT "_careers_v_version_career_location_id_branches_id_fk" FOREIGN KEY ("version_career_location_id") REFERENCES "payload"."branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_careers_v_locales" ADD CONSTRAINT "_careers_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_careers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."doctor_talks" ADD CONSTRAINT "doctor_talks_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."doctor_talks" ADD CONSTRAINT "doctor_talks_featured_doctor_id_doctors_id_fk" FOREIGN KEY ("featured_doctor_id") REFERENCES "payload"."doctors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."doctor_talks_locales" ADD CONSTRAINT "doctor_talks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."doctor_talks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_doctor_talks_v" ADD CONSTRAINT "_doctor_talks_v_parent_id_doctor_talks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."doctor_talks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctor_talks_v" ADD CONSTRAINT "_doctor_talks_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctor_talks_v" ADD CONSTRAINT "_doctor_talks_v_version_featured_doctor_id_doctors_id_fk" FOREIGN KEY ("version_featured_doctor_id") REFERENCES "payload"."doctors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctor_talks_v_locales" ADD CONSTRAINT "_doctor_talks_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_doctor_talks_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."insurance_updates_insurance_plan_types" ADD CONSTRAINT "insurance_updates_insurance_plan_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."insurance_updates_required_documents" ADD CONSTRAINT "insurance_updates_required_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."insurance_updates" ADD CONSTRAINT "insurance_updates_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."insurance_updates_locales" ADD CONSTRAINT "insurance_updates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_insurance_updates_v_version_insurance_plan_types" ADD CONSTRAINT "_insurance_updates_v_version_insurance_plan_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_insurance_updates_v_version_required_documents" ADD CONSTRAINT "_insurance_updates_v_version_required_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_insurance_updates_v" ADD CONSTRAINT "_insurance_updates_v_parent_id_insurance_updates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_insurance_updates_v" ADD CONSTRAINT "_insurance_updates_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_insurance_updates_v_locales" ADD CONSTRAINT "_insurance_updates_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."content_search_index" ADD CONSTRAINT "content_search_index_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "announcements_thumbnail_idx" ON "payload"."announcements" USING btree ("thumbnail_id");
  CREATE UNIQUE INDEX "announcements_slug_idx" ON "payload"."announcements" USING btree ("slug");
  CREATE INDEX "announcements_updated_at_idx" ON "payload"."announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "payload"."announcements" USING btree ("created_at");
  CREATE INDEX "announcements__status_idx" ON "payload"."announcements" USING btree ("_status");
  CREATE UNIQUE INDEX "announcements_locales_locale_parent_id_unique" ON "payload"."announcements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_announcements_v_parent_idx" ON "payload"."_announcements_v" USING btree ("parent_id");
  CREATE INDEX "_announcements_v_version_version_thumbnail_idx" ON "payload"."_announcements_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_announcements_v_version_version_slug_idx" ON "payload"."_announcements_v" USING btree ("version_slug");
  CREATE INDEX "_announcements_v_version_version_updated_at_idx" ON "payload"."_announcements_v" USING btree ("version_updated_at");
  CREATE INDEX "_announcements_v_version_version_created_at_idx" ON "payload"."_announcements_v" USING btree ("version_created_at");
  CREATE INDEX "_announcements_v_version_version__status_idx" ON "payload"."_announcements_v" USING btree ("version__status");
  CREATE INDEX "_announcements_v_created_at_idx" ON "payload"."_announcements_v" USING btree ("created_at");
  CREATE INDEX "_announcements_v_updated_at_idx" ON "payload"."_announcements_v" USING btree ("updated_at");
  CREATE INDEX "_announcements_v_snapshot_idx" ON "payload"."_announcements_v" USING btree ("snapshot");
  CREATE INDEX "_announcements_v_published_locale_idx" ON "payload"."_announcements_v" USING btree ("published_locale");
  CREATE INDEX "_announcements_v_latest_idx" ON "payload"."_announcements_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_announcements_v_locales_locale_parent_id_unique" ON "payload"."_announcements_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "health_tips_health_tip_tags_order_idx" ON "payload"."health_tips_health_tip_tags" USING btree ("_order");
  CREATE INDEX "health_tips_health_tip_tags_parent_id_idx" ON "payload"."health_tips_health_tip_tags" USING btree ("_parent_id");
  CREATE INDEX "health_tips_thumbnail_idx" ON "payload"."health_tips" USING btree ("thumbnail_id");
  CREATE UNIQUE INDEX "health_tips_slug_idx" ON "payload"."health_tips" USING btree ("slug");
  CREATE INDEX "health_tips_updated_at_idx" ON "payload"."health_tips" USING btree ("updated_at");
  CREATE INDEX "health_tips_created_at_idx" ON "payload"."health_tips" USING btree ("created_at");
  CREATE INDEX "health_tips__status_idx" ON "payload"."health_tips" USING btree ("_status");
  CREATE UNIQUE INDEX "health_tips_locales_locale_parent_id_unique" ON "payload"."health_tips_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_health_tips_v_version_health_tip_tags_order_idx" ON "payload"."_health_tips_v_version_health_tip_tags" USING btree ("_order");
  CREATE INDEX "_health_tips_v_version_health_tip_tags_parent_id_idx" ON "payload"."_health_tips_v_version_health_tip_tags" USING btree ("_parent_id");
  CREATE INDEX "_health_tips_v_parent_idx" ON "payload"."_health_tips_v" USING btree ("parent_id");
  CREATE INDEX "_health_tips_v_version_version_thumbnail_idx" ON "payload"."_health_tips_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_health_tips_v_version_version_slug_idx" ON "payload"."_health_tips_v" USING btree ("version_slug");
  CREATE INDEX "_health_tips_v_version_version_updated_at_idx" ON "payload"."_health_tips_v" USING btree ("version_updated_at");
  CREATE INDEX "_health_tips_v_version_version_created_at_idx" ON "payload"."_health_tips_v" USING btree ("version_created_at");
  CREATE INDEX "_health_tips_v_version_version__status_idx" ON "payload"."_health_tips_v" USING btree ("version__status");
  CREATE INDEX "_health_tips_v_created_at_idx" ON "payload"."_health_tips_v" USING btree ("created_at");
  CREATE INDEX "_health_tips_v_updated_at_idx" ON "payload"."_health_tips_v" USING btree ("updated_at");
  CREATE INDEX "_health_tips_v_snapshot_idx" ON "payload"."_health_tips_v" USING btree ("snapshot");
  CREATE INDEX "_health_tips_v_published_locale_idx" ON "payload"."_health_tips_v" USING btree ("published_locale");
  CREATE INDEX "_health_tips_v_latest_idx" ON "payload"."_health_tips_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_health_tips_v_locales_locale_parent_id_unique" ON "payload"."_health_tips_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "careers_thumbnail_idx" ON "payload"."careers" USING btree ("thumbnail_id");
  CREATE UNIQUE INDEX "careers_slug_idx" ON "payload"."careers" USING btree ("slug");
  CREATE INDEX "careers_career_department_idx" ON "payload"."careers" USING btree ("career_department_id");
  CREATE INDEX "careers_career_location_idx" ON "payload"."careers" USING btree ("career_location_id");
  CREATE INDEX "careers_updated_at_idx" ON "payload"."careers" USING btree ("updated_at");
  CREATE INDEX "careers_created_at_idx" ON "payload"."careers" USING btree ("created_at");
  CREATE INDEX "careers__status_idx" ON "payload"."careers" USING btree ("_status");
  CREATE UNIQUE INDEX "careers_locales_locale_parent_id_unique" ON "payload"."careers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_careers_v_parent_idx" ON "payload"."_careers_v" USING btree ("parent_id");
  CREATE INDEX "_careers_v_version_version_thumbnail_idx" ON "payload"."_careers_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_careers_v_version_version_slug_idx" ON "payload"."_careers_v" USING btree ("version_slug");
  CREATE INDEX "_careers_v_version_version_career_department_idx" ON "payload"."_careers_v" USING btree ("version_career_department_id");
  CREATE INDEX "_careers_v_version_version_career_location_idx" ON "payload"."_careers_v" USING btree ("version_career_location_id");
  CREATE INDEX "_careers_v_version_version_updated_at_idx" ON "payload"."_careers_v" USING btree ("version_updated_at");
  CREATE INDEX "_careers_v_version_version_created_at_idx" ON "payload"."_careers_v" USING btree ("version_created_at");
  CREATE INDEX "_careers_v_version_version__status_idx" ON "payload"."_careers_v" USING btree ("version__status");
  CREATE INDEX "_careers_v_created_at_idx" ON "payload"."_careers_v" USING btree ("created_at");
  CREATE INDEX "_careers_v_updated_at_idx" ON "payload"."_careers_v" USING btree ("updated_at");
  CREATE INDEX "_careers_v_snapshot_idx" ON "payload"."_careers_v" USING btree ("snapshot");
  CREATE INDEX "_careers_v_published_locale_idx" ON "payload"."_careers_v" USING btree ("published_locale");
  CREATE INDEX "_careers_v_latest_idx" ON "payload"."_careers_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_careers_v_locales_locale_parent_id_unique" ON "payload"."_careers_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "doctor_talks_thumbnail_idx" ON "payload"."doctor_talks" USING btree ("thumbnail_id");
  CREATE UNIQUE INDEX "doctor_talks_slug_idx" ON "payload"."doctor_talks" USING btree ("slug");
  CREATE INDEX "doctor_talks_featured_doctor_idx" ON "payload"."doctor_talks" USING btree ("featured_doctor_id");
  CREATE INDEX "doctor_talks_updated_at_idx" ON "payload"."doctor_talks" USING btree ("updated_at");
  CREATE INDEX "doctor_talks_created_at_idx" ON "payload"."doctor_talks" USING btree ("created_at");
  CREATE INDEX "doctor_talks__status_idx" ON "payload"."doctor_talks" USING btree ("_status");
  CREATE UNIQUE INDEX "doctor_talks_locales_locale_parent_id_unique" ON "payload"."doctor_talks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_doctor_talks_v_parent_idx" ON "payload"."_doctor_talks_v" USING btree ("parent_id");
  CREATE INDEX "_doctor_talks_v_version_version_thumbnail_idx" ON "payload"."_doctor_talks_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_doctor_talks_v_version_version_slug_idx" ON "payload"."_doctor_talks_v" USING btree ("version_slug");
  CREATE INDEX "_doctor_talks_v_version_version_featured_doctor_idx" ON "payload"."_doctor_talks_v" USING btree ("version_featured_doctor_id");
  CREATE INDEX "_doctor_talks_v_version_version_updated_at_idx" ON "payload"."_doctor_talks_v" USING btree ("version_updated_at");
  CREATE INDEX "_doctor_talks_v_version_version_created_at_idx" ON "payload"."_doctor_talks_v" USING btree ("version_created_at");
  CREATE INDEX "_doctor_talks_v_version_version__status_idx" ON "payload"."_doctor_talks_v" USING btree ("version__status");
  CREATE INDEX "_doctor_talks_v_created_at_idx" ON "payload"."_doctor_talks_v" USING btree ("created_at");
  CREATE INDEX "_doctor_talks_v_updated_at_idx" ON "payload"."_doctor_talks_v" USING btree ("updated_at");
  CREATE INDEX "_doctor_talks_v_snapshot_idx" ON "payload"."_doctor_talks_v" USING btree ("snapshot");
  CREATE INDEX "_doctor_talks_v_published_locale_idx" ON "payload"."_doctor_talks_v" USING btree ("published_locale");
  CREATE INDEX "_doctor_talks_v_latest_idx" ON "payload"."_doctor_talks_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_doctor_talks_v_locales_locale_parent_id_unique" ON "payload"."_doctor_talks_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "insurance_updates_insurance_plan_types_order_idx" ON "payload"."insurance_updates_insurance_plan_types" USING btree ("_order");
  CREATE INDEX "insurance_updates_insurance_plan_types_parent_id_idx" ON "payload"."insurance_updates_insurance_plan_types" USING btree ("_parent_id");
  CREATE INDEX "insurance_updates_required_documents_order_idx" ON "payload"."insurance_updates_required_documents" USING btree ("_order");
  CREATE INDEX "insurance_updates_required_documents_parent_id_idx" ON "payload"."insurance_updates_required_documents" USING btree ("_parent_id");
  CREATE INDEX "insurance_updates_thumbnail_idx" ON "payload"."insurance_updates" USING btree ("thumbnail_id");
  CREATE UNIQUE INDEX "insurance_updates_slug_idx" ON "payload"."insurance_updates" USING btree ("slug");
  CREATE INDEX "insurance_updates_updated_at_idx" ON "payload"."insurance_updates" USING btree ("updated_at");
  CREATE INDEX "insurance_updates_created_at_idx" ON "payload"."insurance_updates" USING btree ("created_at");
  CREATE INDEX "insurance_updates__status_idx" ON "payload"."insurance_updates" USING btree ("_status");
  CREATE UNIQUE INDEX "insurance_updates_locales_locale_parent_id_unique" ON "payload"."insurance_updates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_insurance_updates_v_version_insurance_plan_types_order_idx" ON "payload"."_insurance_updates_v_version_insurance_plan_types" USING btree ("_order");
  CREATE INDEX "_insurance_updates_v_version_insurance_plan_types_parent_id_idx" ON "payload"."_insurance_updates_v_version_insurance_plan_types" USING btree ("_parent_id");
  CREATE INDEX "_insurance_updates_v_version_required_documents_order_idx" ON "payload"."_insurance_updates_v_version_required_documents" USING btree ("_order");
  CREATE INDEX "_insurance_updates_v_version_required_documents_parent_id_idx" ON "payload"."_insurance_updates_v_version_required_documents" USING btree ("_parent_id");
  CREATE INDEX "_insurance_updates_v_parent_idx" ON "payload"."_insurance_updates_v" USING btree ("parent_id");
  CREATE INDEX "_insurance_updates_v_version_version_thumbnail_idx" ON "payload"."_insurance_updates_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_insurance_updates_v_version_version_slug_idx" ON "payload"."_insurance_updates_v" USING btree ("version_slug");
  CREATE INDEX "_insurance_updates_v_version_version_updated_at_idx" ON "payload"."_insurance_updates_v" USING btree ("version_updated_at");
  CREATE INDEX "_insurance_updates_v_version_version_created_at_idx" ON "payload"."_insurance_updates_v" USING btree ("version_created_at");
  CREATE INDEX "_insurance_updates_v_version_version__status_idx" ON "payload"."_insurance_updates_v" USING btree ("version__status");
  CREATE INDEX "_insurance_updates_v_created_at_idx" ON "payload"."_insurance_updates_v" USING btree ("created_at");
  CREATE INDEX "_insurance_updates_v_updated_at_idx" ON "payload"."_insurance_updates_v" USING btree ("updated_at");
  CREATE INDEX "_insurance_updates_v_snapshot_idx" ON "payload"."_insurance_updates_v" USING btree ("snapshot");
  CREATE INDEX "_insurance_updates_v_published_locale_idx" ON "payload"."_insurance_updates_v" USING btree ("published_locale");
  CREATE INDEX "_insurance_updates_v_latest_idx" ON "payload"."_insurance_updates_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_insurance_updates_v_locales_locale_parent_id_unique" ON "payload"."_insurance_updates_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "content_search_index_thumbnail_idx" ON "payload"."content_search_index" USING btree ("thumbnail_id");
  CREATE INDEX "content_search_index_updated_at_idx" ON "payload"."content_search_index" USING btree ("updated_at");
  CREATE INDEX "content_search_index_created_at_idx" ON "payload"."content_search_index" USING btree ("created_at");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "payload"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_health_tips_fk" FOREIGN KEY ("health_tips_id") REFERENCES "payload"."health_tips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_careers_fk" FOREIGN KEY ("careers_id") REFERENCES "payload"."careers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_doctor_talks_fk" FOREIGN KEY ("doctor_talks_id") REFERENCES "payload"."doctor_talks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insurance_updates_fk" FOREIGN KEY ("insurance_updates_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_search_index_fk" FOREIGN KEY ("content_search_index_id") REFERENCES "payload"."content_search_index"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("announcements_id");
  CREATE INDEX "payload_locked_documents_rels_health_tips_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("health_tips_id");
  CREATE INDEX "payload_locked_documents_rels_careers_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("careers_id");
  CREATE INDEX "payload_locked_documents_rels_doctor_talks_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("doctor_talks_id");
  CREATE INDEX "payload_locked_documents_rels_insurance_updates_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("insurance_updates_id");
  CREATE INDEX "payload_locked_documents_rels_content_search_index_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("content_search_index_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."announcements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."announcements_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_announcements_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_announcements_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."health_tips_health_tip_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."health_tips" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."health_tips_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_health_tips_v_version_health_tip_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_health_tips_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_health_tips_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."careers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."careers_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_careers_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_careers_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."doctor_talks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."doctor_talks_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_doctor_talks_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_doctor_talks_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."insurance_updates_insurance_plan_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."insurance_updates_required_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."insurance_updates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."insurance_updates_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_insurance_updates_v_version_insurance_plan_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_insurance_updates_v_version_required_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_insurance_updates_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_insurance_updates_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."content_search_index" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."announcements" CASCADE;
  DROP TABLE "payload"."announcements_locales" CASCADE;
  DROP TABLE "payload"."_announcements_v" CASCADE;
  DROP TABLE "payload"."_announcements_v_locales" CASCADE;
  DROP TABLE "payload"."health_tips_health_tip_tags" CASCADE;
  DROP TABLE "payload"."health_tips" CASCADE;
  DROP TABLE "payload"."health_tips_locales" CASCADE;
  DROP TABLE "payload"."_health_tips_v_version_health_tip_tags" CASCADE;
  DROP TABLE "payload"."_health_tips_v" CASCADE;
  DROP TABLE "payload"."_health_tips_v_locales" CASCADE;
  DROP TABLE "payload"."careers" CASCADE;
  DROP TABLE "payload"."careers_locales" CASCADE;
  DROP TABLE "payload"."_careers_v" CASCADE;
  DROP TABLE "payload"."_careers_v_locales" CASCADE;
  DROP TABLE "payload"."doctor_talks" CASCADE;
  DROP TABLE "payload"."doctor_talks_locales" CASCADE;
  DROP TABLE "payload"."_doctor_talks_v" CASCADE;
  DROP TABLE "payload"."_doctor_talks_v_locales" CASCADE;
  DROP TABLE "payload"."insurance_updates_insurance_plan_types" CASCADE;
  DROP TABLE "payload"."insurance_updates_required_documents" CASCADE;
  DROP TABLE "payload"."insurance_updates" CASCADE;
  DROP TABLE "payload"."insurance_updates_locales" CASCADE;
  DROP TABLE "payload"."_insurance_updates_v_version_insurance_plan_types" CASCADE;
  DROP TABLE "payload"."_insurance_updates_v_version_required_documents" CASCADE;
  DROP TABLE "payload"."_insurance_updates_v" CASCADE;
  DROP TABLE "payload"."_insurance_updates_v_locales" CASCADE;
  DROP TABLE "payload"."content_search_index" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_announcements_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_health_tips_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_careers_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_doctor_talks_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_insurance_updates_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_content_search_index_fk";
  
  ALTER TABLE "payload"."analytics_events" ALTER COLUMN "event" SET DATA TYPE text;
  DROP TYPE "payload"."enum_analytics_events_event";
  CREATE TYPE "payload"."enum_analytics_events_event" AS ENUM('page_view', 'tour_view', 'doctor_click', 'inquiry_submit', 'call_click', 'map_interaction');
  ALTER TABLE "payload"."analytics_events" ALTER COLUMN "event" SET DATA TYPE "payload"."enum_analytics_events_event" USING "event"::"payload"."enum_analytics_events_event";
  DROP INDEX "payload"."payload_locked_documents_rels_announcements_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_health_tips_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_careers_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_doctor_talks_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_insurance_updates_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_content_search_index_id_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "announcements_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "health_tips_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "careers_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "doctor_talks_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "insurance_updates_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "content_search_index_id";
  DROP TYPE "payload"."enum_announcements_priority";
  DROP TYPE "payload"."enum_announcements_status";
  DROP TYPE "payload"."enum__announcements_v_version_priority";
  DROP TYPE "payload"."enum__announcements_v_version_status";
  DROP TYPE "payload"."enum__announcements_v_published_locale";
  DROP TYPE "payload"."enum_health_tips_health_tip_category";
  DROP TYPE "payload"."enum_health_tips_status";
  DROP TYPE "payload"."enum__health_tips_v_version_health_tip_category";
  DROP TYPE "payload"."enum__health_tips_v_version_status";
  DROP TYPE "payload"."enum__health_tips_v_published_locale";
  DROP TYPE "payload"."enum_careers_career_employment_type";
  DROP TYPE "payload"."enum_careers_experience_level";
  DROP TYPE "payload"."enum_careers_status";
  DROP TYPE "payload"."enum__careers_v_version_career_employment_type";
  DROP TYPE "payload"."enum__careers_v_version_experience_level";
  DROP TYPE "payload"."enum__careers_v_version_status";
  DROP TYPE "payload"."enum__careers_v_published_locale";
  DROP TYPE "payload"."enum_doctor_talks_status";
  DROP TYPE "payload"."enum__doctor_talks_v_version_status";
  DROP TYPE "payload"."enum__doctor_talks_v_published_locale";
  DROP TYPE "payload"."enum_insurance_updates_status";
  DROP TYPE "payload"."enum__insurance_updates_v_version_status";
  DROP TYPE "payload"."enum__insurance_updates_v_published_locale";`)
}
