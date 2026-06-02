import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."_locales" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_users_role" AS ENUM('admin', 'editor', 'contributor');
  CREATE TYPE "payload"."enum_pages_blocks_section_image_position" AS ENUM('left', 'right');
  CREATE TYPE "payload"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__pages_v_blocks_section_image_position" AS ENUM('left', 'right');
  CREATE TYPE "payload"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__pages_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_doctors_sex" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');
  CREATE TYPE "payload"."enum_doctors_employment_type" AS ENUM('full_time', 'part_time', 'visiting', 'contract');
  CREATE TYPE "payload"."enum_doctors_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__doctors_v_version_sex" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');
  CREATE TYPE "payload"."enum__doctors_v_version_employment_type" AS ENUM('full_time', 'part_time', 'visiting', 'contract');
  CREATE TYPE "payload"."enum__doctors_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__doctors_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_departments_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__departments_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__departments_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_branches_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__branches_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__branches_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_doctor_schedules_day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "payload"."enum_doctor_schedules_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__doctor_schedules_v_version_day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "payload"."enum__doctor_schedules_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__doctor_schedules_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__services_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__news_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_promotions_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__promotions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__promotions_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_faqs_category" AS ENUM('general', 'appointments', 'services', 'insurance', 'other');
  CREATE TYPE "payload"."enum_faqs_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__faqs_v_version_category" AS ENUM('general', 'appointments', 'services', 'insurance', 'other');
  CREATE TYPE "payload"."enum__faqs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__faqs_v_published_locale" AS ENUM('en', 'km', 'zh');
  CREATE TYPE "payload"."enum_tour_scenes_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "payload"."enum_inquiries_status" AS ENUM('new', 'in-progress', 'resolved');
  CREATE TYPE "payload"."enum_analytics_events_event" AS ENUM('page_view', 'tour_view', 'doctor_click', 'inquiry_submit', 'call_click', 'map_interaction');
  CREATE TYPE "payload"."enum_kpi_snapshots_metric" AS ENUM('calls', 'inquiries', 'tour_views', 'doctor_clicks', 'map_interactions');
  CREATE TYPE "payload"."enum_kpi_snapshots_granularity" AS ENUM('day', 'week', 'month');
  CREATE TYPE "payload"."enum_ga_reports_report_type" AS ENUM('page_views', 'traffic_sources', 'user_demographics', 'device_breakdown');
  CREATE TYPE "payload"."enum_audit_logs_action" AS ENUM('created', 'updated', 'published', 'archived', 'deleted');
  CREATE TYPE "payload"."enum_audit_logs_user_role" AS ENUM('admin', 'editor', 'contributor');
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "payload"."enum_users_role" DEFAULT 'contributor' NOT NULL,
  	"avatar_id" integer,
  	"last_login_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."media_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT 'media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "payload"."media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_link" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages_blocks_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"image_position" "payload"."enum_pages_blocks_section_image_position" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"seo_image_id" integer,
  	"status" "payload"."enum_pages_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."pages_locales" (
  	"title" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"cta_text" varchar,
  	"cta_link" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v_blocks_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"image_position" "payload"."enum__pages_v_blocks_section_image_position" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_seo_image_id" integer,
  	"version_status" "payload"."enum__pages_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."doctors_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "payload"."doctors_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "payload"."doctors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"photo_id" integer,
  	"department_id" integer,
  	"phone" varchar,
  	"email" varchar,
  	"doctor_number" varchar,
  	"sex" "payload"."enum_doctors_sex",
  	"nationality" varchar,
  	"position_title" varchar,
  	"employment_start_date" timestamp(3) with time zone,
  	"employment_type" "payload"."enum_doctors_employment_type",
  	"total_clinical_experience_years" numeric,
  	"specialist_experience_years" numeric,
  	"order" numeric DEFAULT 0,
  	"status" "payload"."enum_doctors_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_doctors_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."doctors_locales" (
  	"name" varchar,
  	"bio" jsonb,
  	"specialty" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_doctors_v_version_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_doctors_v_version_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_doctors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_photo_id" integer,
  	"version_department_id" integer,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_doctor_number" varchar,
  	"version_sex" "payload"."enum__doctors_v_version_sex",
  	"version_nationality" varchar,
  	"version_position_title" varchar,
  	"version_employment_start_date" timestamp(3) with time zone,
  	"version_employment_type" "payload"."enum__doctors_v_version_employment_type",
  	"version_total_clinical_experience_years" numeric,
  	"version_specialist_experience_years" numeric,
  	"version_order" numeric DEFAULT 0,
  	"version_status" "payload"."enum__doctors_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__doctors_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__doctors_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_doctors_v_locales" (
  	"version_name" varchar,
  	"version_bio" jsonb,
  	"version_specialty" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"icon_id" integer,
  	"branch_id" integer,
  	"order" numeric DEFAULT 0,
  	"status" "payload"."enum_departments_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_departments_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."departments_locales" (
  	"name" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_departments_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_icon_id" integer,
  	"version_branch_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_status" "payload"."enum__departments_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__departments_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__departments_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_departments_v_locales" (
  	"version_name" varchar,
  	"version_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."branches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"map_url" varchar,
  	"image_id" integer,
  	"order" numeric DEFAULT 0,
  	"status" "payload"."enum_branches_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_branches_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."branches_locales" (
  	"name" varchar,
  	"description" jsonb,
  	"address" varchar,
  	"hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_branches_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_map_url" varchar,
  	"version_image_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_status" "payload"."enum__branches_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__branches_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__branches_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_branches_v_locales" (
  	"version_name" varchar,
  	"version_description" jsonb,
  	"version_address" varchar,
  	"version_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."doctor_schedules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"doctor_id" integer,
  	"department_id" integer,
  	"day_of_week" "payload"."enum_doctor_schedules_day_of_week",
  	"start_time" varchar,
  	"end_time" varchar,
  	"appointment_duration_minutes" numeric DEFAULT 30,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"status" "payload"."enum_doctor_schedules_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_doctor_schedules_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."doctor_schedules_locales" (
  	"room" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_doctor_schedules_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_label" varchar,
  	"version_doctor_id" integer,
  	"version_department_id" integer,
  	"version_day_of_week" "payload"."enum__doctor_schedules_v_version_day_of_week",
  	"version_start_time" varchar,
  	"version_end_time" varchar,
  	"version_appointment_duration_minutes" numeric DEFAULT 30,
  	"version_active" boolean DEFAULT true,
  	"version_order" numeric DEFAULT 0,
  	"version_status" "payload"."enum__doctor_schedules_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__doctor_schedules_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__doctor_schedules_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_doctor_schedules_v_locales" (
  	"version_room" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"department_id" integer,
  	"icon_id" integer,
  	"status" "payload"."enum_services_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."services_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_department_id" integer,
  	"version_icon_id" integer,
  	"version_status" "payload"."enum__services_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__services_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_services_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"thumbnail_id" integer,
  	"author" varchar,
  	"status" "payload"."enum_news_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."news_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_thumbnail_id" integer,
  	"version_author" varchar,
  	"version_status" "payload"."enum__news_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__news_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_news_v_locales" (
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"image_id" integer,
  	"valid_from" timestamp(3) with time zone,
  	"valid_to" timestamp(3) with time zone,
  	"status" "payload"."enum_promotions_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_promotions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."promotions_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_promotions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_image_id" integer,
  	"version_valid_from" timestamp(3) with time zone,
  	"version_valid_to" timestamp(3) with time zone,
  	"version_status" "payload"."enum__promotions_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__promotions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__promotions_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_promotions_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "payload"."enum_faqs_category",
  	"order" numeric DEFAULT 0,
  	"status" "payload"."enum_faqs_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_faqs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."faqs_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_faqs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category" "payload"."enum__faqs_v_version_category",
  	"version_order" numeric DEFAULT 0,
  	"version_status" "payload"."enum__faqs_v_version_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__faqs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__faqs_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_faqs_v_locales" (
  	"version_question" varchar,
  	"version_answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."tour_scenes_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pitch" numeric NOT NULL,
  	"yaw" numeric NOT NULL
  );
  
  CREATE TABLE "payload"."tour_scenes_hotspots_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."tour_scenes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"scene_number" numeric NOT NULL,
  	"thumbnail_image_id" integer,
  	"status" "payload"."enum_tour_scenes_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."tour_scenes_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"email" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"status" "payload"."enum_inquiries_status" DEFAULT 'new',
  	"assigned_to_id" integer,
  	"resolved_at" timestamp(3) with time zone,
  	"staff_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."analytics_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event" "payload"."enum_analytics_events_event" NOT NULL,
  	"slug" varchar,
  	"locale" varchar,
  	"scene" numeric,
  	"session_id" varchar,
  	"ip_hash" varchar,
  	"referrer" varchar,
  	"user_agent" varchar,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."kpi_snapshots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"metric" "payload"."enum_kpi_snapshots_metric" NOT NULL,
  	"value" numeric NOT NULL,
  	"locale" varchar,
  	"granularity" "payload"."enum_kpi_snapshots_granularity" NOT NULL,
  	"breakdown" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."ga_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"report_type" "payload"."enum_ga_reports_report_type" NOT NULL,
  	"date_range_start" timestamp(3) with time zone NOT NULL,
  	"date_range_end" timestamp(3) with time zone NOT NULL,
  	"data" jsonb NOT NULL,
  	"fetched_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "payload"."enum_audit_logs_action" NOT NULL,
  	"collection_slug" varchar NOT NULL,
  	"document_id" varchar NOT NULL,
  	"document_title" varchar,
  	"user_id" varchar,
  	"user_name" varchar,
  	"user_role" "payload"."enum_audit_logs_user_role",
  	"changed_fields" jsonb,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"doctors_id" integer,
  	"departments_id" integer,
  	"branches_id" integer,
  	"doctor_schedules_id" integer,
  	"services_id" integer,
  	"news_id" integer,
  	"promotions_id" integer,
  	"faqs_id" integer,
  	"tour_scenes_id" integer,
  	"inquiries_id" integer,
  	"analytics_events_id" integer,
  	"kpi_snapshots_id" integer,
  	"ga_reports_id" integer,
  	"audit_logs_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."site_settings_locales" (
  	"site_name" varchar NOT NULL,
  	"tagline" varchar,
  	"emergency_c_t_a_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."operational_settings_analytics_report_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar
  );
  
  CREATE TABLE "payload"."operational_settings_webhook_targets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."operational_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."navigation_main_menu_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."navigation_main_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."navigation_footer_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."social_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"facebook" varchar,
  	"instagram" varchar,
  	"youtube" varchar,
  	"tiktok" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."media_tags" ADD CONSTRAINT "media_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_section" ADD CONSTRAINT "_pages_v_blocks_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_blocks_section" ADD CONSTRAINT "_pages_v_blocks_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."doctors_languages" ADD CONSTRAINT "doctors_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."doctors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."doctors_education" ADD CONSTRAINT "doctors_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."doctors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."doctors" ADD CONSTRAINT "doctors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."doctors" ADD CONSTRAINT "doctors_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."doctors_locales" ADD CONSTRAINT "doctors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."doctors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_doctors_v_version_languages" ADD CONSTRAINT "_doctors_v_version_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_doctors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_doctors_v_version_education" ADD CONSTRAINT "_doctors_v_version_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_doctors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_doctors_v" ADD CONSTRAINT "_doctors_v_parent_id_doctors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."doctors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctors_v" ADD CONSTRAINT "_doctors_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctors_v" ADD CONSTRAINT "_doctors_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctors_v_locales" ADD CONSTRAINT "_doctors_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_doctors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."departments" ADD CONSTRAINT "departments_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."departments" ADD CONSTRAINT "departments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "payload"."branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."departments_locales" ADD CONSTRAINT "departments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_departments_v" ADD CONSTRAINT "_departments_v_parent_id_departments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_departments_v" ADD CONSTRAINT "_departments_v_version_icon_id_media_id_fk" FOREIGN KEY ("version_icon_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_departments_v" ADD CONSTRAINT "_departments_v_version_branch_id_branches_id_fk" FOREIGN KEY ("version_branch_id") REFERENCES "payload"."branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_departments_v_locales" ADD CONSTRAINT "_departments_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."branches" ADD CONSTRAINT "branches_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."branches_locales" ADD CONSTRAINT "branches_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_branches_v" ADD CONSTRAINT "_branches_v_parent_id_branches_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_branches_v" ADD CONSTRAINT "_branches_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_branches_v_locales" ADD CONSTRAINT "_branches_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_branches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "payload"."doctors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."doctor_schedules" ADD CONSTRAINT "doctor_schedules_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."doctor_schedules_locales" ADD CONSTRAINT "doctor_schedules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."doctor_schedules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_doctor_schedules_v" ADD CONSTRAINT "_doctor_schedules_v_parent_id_doctor_schedules_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."doctor_schedules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctor_schedules_v" ADD CONSTRAINT "_doctor_schedules_v_version_doctor_id_doctors_id_fk" FOREIGN KEY ("version_doctor_id") REFERENCES "payload"."doctors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctor_schedules_v" ADD CONSTRAINT "_doctor_schedules_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_doctor_schedules_v_locales" ADD CONSTRAINT "_doctor_schedules_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_doctor_schedules_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."services" ADD CONSTRAINT "services_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."services" ADD CONSTRAINT "services_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_services_v" ADD CONSTRAINT "_services_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "payload"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_services_v" ADD CONSTRAINT "_services_v_version_icon_id_media_id_fk" FOREIGN KEY ("version_icon_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."news" ADD CONSTRAINT "news_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."news_locales" ADD CONSTRAINT "news_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_news_v" ADD CONSTRAINT "_news_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_news_v_locales" ADD CONSTRAINT "_news_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."promotions" ADD CONSTRAINT "promotions_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."promotions_locales" ADD CONSTRAINT "promotions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_promotions_v" ADD CONSTRAINT "_promotions_v_parent_id_promotions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_promotions_v" ADD CONSTRAINT "_promotions_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_promotions_v_locales" ADD CONSTRAINT "_promotions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_promotions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_faqs_v" ADD CONSTRAINT "_faqs_v_parent_id_faqs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."faqs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_faqs_v_locales" ADD CONSTRAINT "_faqs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_faqs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."tour_scenes_hotspots" ADD CONSTRAINT "tour_scenes_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."tour_scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."tour_scenes_hotspots_locales" ADD CONSTRAINT "tour_scenes_hotspots_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."tour_scenes_hotspots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."tour_scenes" ADD CONSTRAINT "tour_scenes_thumbnail_image_id_media_id_fk" FOREIGN KEY ("thumbnail_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."tour_scenes_locales" ADD CONSTRAINT "tour_scenes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."tour_scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."inquiries" ADD CONSTRAINT "inquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_doctors_fk" FOREIGN KEY ("doctors_id") REFERENCES "payload"."doctors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "payload"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_branches_fk" FOREIGN KEY ("branches_id") REFERENCES "payload"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_doctor_schedules_fk" FOREIGN KEY ("doctor_schedules_id") REFERENCES "payload"."doctor_schedules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "payload"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "payload"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "payload"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "payload"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tour_scenes_fk" FOREIGN KEY ("tour_scenes_id") REFERENCES "payload"."tour_scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "payload"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_events_fk" FOREIGN KEY ("analytics_events_id") REFERENCES "payload"."analytics_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kpi_snapshots_fk" FOREIGN KEY ("kpi_snapshots_id") REFERENCES "payload"."kpi_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ga_reports_fk" FOREIGN KEY ("ga_reports_id") REFERENCES "payload"."ga_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "payload"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."operational_settings_analytics_report_recipients" ADD CONSTRAINT "operational_settings_analytics_report_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."operational_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."operational_settings_webhook_targets" ADD CONSTRAINT "operational_settings_webhook_targets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."operational_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."navigation_main_menu_items_children" ADD CONSTRAINT "navigation_main_menu_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."navigation_main_menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."navigation_main_menu_items" ADD CONSTRAINT "navigation_main_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."navigation_footer_menu_items" ADD CONSTRAINT "navigation_footer_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_avatar_idx" ON "payload"."users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE INDEX "media_tags_order_idx" ON "payload"."media_tags" USING btree ("_order");
  CREATE INDEX "media_tags_parent_id_idx" ON "payload"."media_tags" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload"."media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "payload"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "payload"."media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "payload"."media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "payload"."media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "payload"."pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "payload"."pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "payload"."pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "payload"."pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_background_image_idx" ON "payload"."pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "pages_blocks_section_order_idx" ON "payload"."pages_blocks_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_parent_id_idx" ON "payload"."pages_blocks_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_path_idx" ON "payload"."pages_blocks_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_section_locale_idx" ON "payload"."pages_blocks_section" USING btree ("_locale");
  CREATE INDEX "pages_blocks_section_image_idx" ON "payload"."pages_blocks_section" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "payload"."pages" USING btree ("slug");
  CREATE INDEX "pages_seo_image_idx" ON "payload"."pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "payload"."pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "payload"."pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "payload"."pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "payload"."pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_background_image_idx" ON "payload"."_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_blocks_section_order_idx" ON "payload"."_pages_v_blocks_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_section_parent_id_idx" ON "payload"."_pages_v_blocks_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_section_path_idx" ON "payload"."_pages_v_blocks_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_section_locale_idx" ON "payload"."_pages_v_blocks_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_section_image_idx" ON "payload"."_pages_v_blocks_section" USING btree ("image_id");
  CREATE INDEX "_pages_v_parent_idx" ON "payload"."_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "payload"."_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_seo_image_idx" ON "payload"."_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "payload"."_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "payload"."_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "payload"."_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "payload"."_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "payload"."_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "payload"."_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "payload"."_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "payload"."_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "payload"."_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "doctors_languages_order_idx" ON "payload"."doctors_languages" USING btree ("_order");
  CREATE INDEX "doctors_languages_parent_id_idx" ON "payload"."doctors_languages" USING btree ("_parent_id");
  CREATE INDEX "doctors_education_order_idx" ON "payload"."doctors_education" USING btree ("_order");
  CREATE INDEX "doctors_education_parent_id_idx" ON "payload"."doctors_education" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "doctors_slug_idx" ON "payload"."doctors" USING btree ("slug");
  CREATE INDEX "doctors_photo_idx" ON "payload"."doctors" USING btree ("photo_id");
  CREATE INDEX "doctors_department_idx" ON "payload"."doctors" USING btree ("department_id");
  CREATE UNIQUE INDEX "doctors_doctor_number_idx" ON "payload"."doctors" USING btree ("doctor_number");
  CREATE INDEX "doctors_updated_at_idx" ON "payload"."doctors" USING btree ("updated_at");
  CREATE INDEX "doctors_created_at_idx" ON "payload"."doctors" USING btree ("created_at");
  CREATE INDEX "doctors__status_idx" ON "payload"."doctors" USING btree ("_status");
  CREATE UNIQUE INDEX "doctors_locales_locale_parent_id_unique" ON "payload"."doctors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_doctors_v_version_languages_order_idx" ON "payload"."_doctors_v_version_languages" USING btree ("_order");
  CREATE INDEX "_doctors_v_version_languages_parent_id_idx" ON "payload"."_doctors_v_version_languages" USING btree ("_parent_id");
  CREATE INDEX "_doctors_v_version_education_order_idx" ON "payload"."_doctors_v_version_education" USING btree ("_order");
  CREATE INDEX "_doctors_v_version_education_parent_id_idx" ON "payload"."_doctors_v_version_education" USING btree ("_parent_id");
  CREATE INDEX "_doctors_v_parent_idx" ON "payload"."_doctors_v" USING btree ("parent_id");
  CREATE INDEX "_doctors_v_version_version_slug_idx" ON "payload"."_doctors_v" USING btree ("version_slug");
  CREATE INDEX "_doctors_v_version_version_photo_idx" ON "payload"."_doctors_v" USING btree ("version_photo_id");
  CREATE INDEX "_doctors_v_version_version_department_idx" ON "payload"."_doctors_v" USING btree ("version_department_id");
  CREATE INDEX "_doctors_v_version_version_doctor_number_idx" ON "payload"."_doctors_v" USING btree ("version_doctor_number");
  CREATE INDEX "_doctors_v_version_version_updated_at_idx" ON "payload"."_doctors_v" USING btree ("version_updated_at");
  CREATE INDEX "_doctors_v_version_version_created_at_idx" ON "payload"."_doctors_v" USING btree ("version_created_at");
  CREATE INDEX "_doctors_v_version_version__status_idx" ON "payload"."_doctors_v" USING btree ("version__status");
  CREATE INDEX "_doctors_v_created_at_idx" ON "payload"."_doctors_v" USING btree ("created_at");
  CREATE INDEX "_doctors_v_updated_at_idx" ON "payload"."_doctors_v" USING btree ("updated_at");
  CREATE INDEX "_doctors_v_snapshot_idx" ON "payload"."_doctors_v" USING btree ("snapshot");
  CREATE INDEX "_doctors_v_published_locale_idx" ON "payload"."_doctors_v" USING btree ("published_locale");
  CREATE INDEX "_doctors_v_latest_idx" ON "payload"."_doctors_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_doctors_v_locales_locale_parent_id_unique" ON "payload"."_doctors_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "departments_slug_idx" ON "payload"."departments" USING btree ("slug");
  CREATE INDEX "departments_icon_idx" ON "payload"."departments" USING btree ("icon_id");
  CREATE INDEX "departments_branch_idx" ON "payload"."departments" USING btree ("branch_id");
  CREATE INDEX "departments_updated_at_idx" ON "payload"."departments" USING btree ("updated_at");
  CREATE INDEX "departments_created_at_idx" ON "payload"."departments" USING btree ("created_at");
  CREATE INDEX "departments__status_idx" ON "payload"."departments" USING btree ("_status");
  CREATE UNIQUE INDEX "departments_locales_locale_parent_id_unique" ON "payload"."departments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_parent_idx" ON "payload"."_departments_v" USING btree ("parent_id");
  CREATE INDEX "_departments_v_version_version_slug_idx" ON "payload"."_departments_v" USING btree ("version_slug");
  CREATE INDEX "_departments_v_version_version_icon_idx" ON "payload"."_departments_v" USING btree ("version_icon_id");
  CREATE INDEX "_departments_v_version_version_branch_idx" ON "payload"."_departments_v" USING btree ("version_branch_id");
  CREATE INDEX "_departments_v_version_version_updated_at_idx" ON "payload"."_departments_v" USING btree ("version_updated_at");
  CREATE INDEX "_departments_v_version_version_created_at_idx" ON "payload"."_departments_v" USING btree ("version_created_at");
  CREATE INDEX "_departments_v_version_version__status_idx" ON "payload"."_departments_v" USING btree ("version__status");
  CREATE INDEX "_departments_v_created_at_idx" ON "payload"."_departments_v" USING btree ("created_at");
  CREATE INDEX "_departments_v_updated_at_idx" ON "payload"."_departments_v" USING btree ("updated_at");
  CREATE INDEX "_departments_v_snapshot_idx" ON "payload"."_departments_v" USING btree ("snapshot");
  CREATE INDEX "_departments_v_published_locale_idx" ON "payload"."_departments_v" USING btree ("published_locale");
  CREATE INDEX "_departments_v_latest_idx" ON "payload"."_departments_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_departments_v_locales_locale_parent_id_unique" ON "payload"."_departments_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "branches_slug_idx" ON "payload"."branches" USING btree ("slug");
  CREATE INDEX "branches_image_idx" ON "payload"."branches" USING btree ("image_id");
  CREATE INDEX "branches_updated_at_idx" ON "payload"."branches" USING btree ("updated_at");
  CREATE INDEX "branches_created_at_idx" ON "payload"."branches" USING btree ("created_at");
  CREATE INDEX "branches__status_idx" ON "payload"."branches" USING btree ("_status");
  CREATE UNIQUE INDEX "branches_locales_locale_parent_id_unique" ON "payload"."branches_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_branches_v_parent_idx" ON "payload"."_branches_v" USING btree ("parent_id");
  CREATE INDEX "_branches_v_version_version_slug_idx" ON "payload"."_branches_v" USING btree ("version_slug");
  CREATE INDEX "_branches_v_version_version_image_idx" ON "payload"."_branches_v" USING btree ("version_image_id");
  CREATE INDEX "_branches_v_version_version_updated_at_idx" ON "payload"."_branches_v" USING btree ("version_updated_at");
  CREATE INDEX "_branches_v_version_version_created_at_idx" ON "payload"."_branches_v" USING btree ("version_created_at");
  CREATE INDEX "_branches_v_version_version__status_idx" ON "payload"."_branches_v" USING btree ("version__status");
  CREATE INDEX "_branches_v_created_at_idx" ON "payload"."_branches_v" USING btree ("created_at");
  CREATE INDEX "_branches_v_updated_at_idx" ON "payload"."_branches_v" USING btree ("updated_at");
  CREATE INDEX "_branches_v_snapshot_idx" ON "payload"."_branches_v" USING btree ("snapshot");
  CREATE INDEX "_branches_v_published_locale_idx" ON "payload"."_branches_v" USING btree ("published_locale");
  CREATE INDEX "_branches_v_latest_idx" ON "payload"."_branches_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_branches_v_locales_locale_parent_id_unique" ON "payload"."_branches_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "doctor_schedules_doctor_idx" ON "payload"."doctor_schedules" USING btree ("doctor_id");
  CREATE INDEX "doctor_schedules_department_idx" ON "payload"."doctor_schedules" USING btree ("department_id");
  CREATE INDEX "doctor_schedules_updated_at_idx" ON "payload"."doctor_schedules" USING btree ("updated_at");
  CREATE INDEX "doctor_schedules_created_at_idx" ON "payload"."doctor_schedules" USING btree ("created_at");
  CREATE INDEX "doctor_schedules__status_idx" ON "payload"."doctor_schedules" USING btree ("_status");
  CREATE UNIQUE INDEX "doctor_schedules_locales_locale_parent_id_unique" ON "payload"."doctor_schedules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_doctor_schedules_v_parent_idx" ON "payload"."_doctor_schedules_v" USING btree ("parent_id");
  CREATE INDEX "_doctor_schedules_v_version_version_doctor_idx" ON "payload"."_doctor_schedules_v" USING btree ("version_doctor_id");
  CREATE INDEX "_doctor_schedules_v_version_version_department_idx" ON "payload"."_doctor_schedules_v" USING btree ("version_department_id");
  CREATE INDEX "_doctor_schedules_v_version_version_updated_at_idx" ON "payload"."_doctor_schedules_v" USING btree ("version_updated_at");
  CREATE INDEX "_doctor_schedules_v_version_version_created_at_idx" ON "payload"."_doctor_schedules_v" USING btree ("version_created_at");
  CREATE INDEX "_doctor_schedules_v_version_version__status_idx" ON "payload"."_doctor_schedules_v" USING btree ("version__status");
  CREATE INDEX "_doctor_schedules_v_created_at_idx" ON "payload"."_doctor_schedules_v" USING btree ("created_at");
  CREATE INDEX "_doctor_schedules_v_updated_at_idx" ON "payload"."_doctor_schedules_v" USING btree ("updated_at");
  CREATE INDEX "_doctor_schedules_v_snapshot_idx" ON "payload"."_doctor_schedules_v" USING btree ("snapshot");
  CREATE INDEX "_doctor_schedules_v_published_locale_idx" ON "payload"."_doctor_schedules_v" USING btree ("published_locale");
  CREATE INDEX "_doctor_schedules_v_latest_idx" ON "payload"."_doctor_schedules_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_doctor_schedules_v_locales_locale_parent_id_unique" ON "payload"."_doctor_schedules_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "payload"."services" USING btree ("slug");
  CREATE INDEX "services_department_idx" ON "payload"."services" USING btree ("department_id");
  CREATE INDEX "services_icon_idx" ON "payload"."services" USING btree ("icon_id");
  CREATE INDEX "services_updated_at_idx" ON "payload"."services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "payload"."services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "payload"."services" USING btree ("_status");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "payload"."services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "payload"."_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "payload"."_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_department_idx" ON "payload"."_services_v" USING btree ("version_department_id");
  CREATE INDEX "_services_v_version_version_icon_idx" ON "payload"."_services_v" USING btree ("version_icon_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "payload"."_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "payload"."_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "payload"."_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "payload"."_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "payload"."_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "payload"."_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "payload"."_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "payload"."_services_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "payload"."_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "payload"."news" USING btree ("slug");
  CREATE INDEX "news_thumbnail_idx" ON "payload"."news" USING btree ("thumbnail_id");
  CREATE INDEX "news_updated_at_idx" ON "payload"."news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "payload"."news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "payload"."news" USING btree ("_status");
  CREATE UNIQUE INDEX "news_locales_locale_parent_id_unique" ON "payload"."news_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_news_v_parent_idx" ON "payload"."_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "payload"."_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_thumbnail_idx" ON "payload"."_news_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "payload"."_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "payload"."_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "payload"."_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "payload"."_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "payload"."_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_snapshot_idx" ON "payload"."_news_v" USING btree ("snapshot");
  CREATE INDEX "_news_v_published_locale_idx" ON "payload"."_news_v" USING btree ("published_locale");
  CREATE INDEX "_news_v_latest_idx" ON "payload"."_news_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_news_v_locales_locale_parent_id_unique" ON "payload"."_news_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "promotions_slug_idx" ON "payload"."promotions" USING btree ("slug");
  CREATE INDEX "promotions_image_idx" ON "payload"."promotions" USING btree ("image_id");
  CREATE INDEX "promotions_updated_at_idx" ON "payload"."promotions" USING btree ("updated_at");
  CREATE INDEX "promotions_created_at_idx" ON "payload"."promotions" USING btree ("created_at");
  CREATE INDEX "promotions__status_idx" ON "payload"."promotions" USING btree ("_status");
  CREATE UNIQUE INDEX "promotions_locales_locale_parent_id_unique" ON "payload"."promotions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_promotions_v_parent_idx" ON "payload"."_promotions_v" USING btree ("parent_id");
  CREATE INDEX "_promotions_v_version_version_slug_idx" ON "payload"."_promotions_v" USING btree ("version_slug");
  CREATE INDEX "_promotions_v_version_version_image_idx" ON "payload"."_promotions_v" USING btree ("version_image_id");
  CREATE INDEX "_promotions_v_version_version_updated_at_idx" ON "payload"."_promotions_v" USING btree ("version_updated_at");
  CREATE INDEX "_promotions_v_version_version_created_at_idx" ON "payload"."_promotions_v" USING btree ("version_created_at");
  CREATE INDEX "_promotions_v_version_version__status_idx" ON "payload"."_promotions_v" USING btree ("version__status");
  CREATE INDEX "_promotions_v_created_at_idx" ON "payload"."_promotions_v" USING btree ("created_at");
  CREATE INDEX "_promotions_v_updated_at_idx" ON "payload"."_promotions_v" USING btree ("updated_at");
  CREATE INDEX "_promotions_v_snapshot_idx" ON "payload"."_promotions_v" USING btree ("snapshot");
  CREATE INDEX "_promotions_v_published_locale_idx" ON "payload"."_promotions_v" USING btree ("published_locale");
  CREATE INDEX "_promotions_v_latest_idx" ON "payload"."_promotions_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_promotions_v_locales_locale_parent_id_unique" ON "payload"."_promotions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_updated_at_idx" ON "payload"."faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "payload"."faqs" USING btree ("created_at");
  CREATE INDEX "faqs__status_idx" ON "payload"."faqs" USING btree ("_status");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "payload"."faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_faqs_v_parent_idx" ON "payload"."_faqs_v" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_version_version_updated_at_idx" ON "payload"."_faqs_v" USING btree ("version_updated_at");
  CREATE INDEX "_faqs_v_version_version_created_at_idx" ON "payload"."_faqs_v" USING btree ("version_created_at");
  CREATE INDEX "_faqs_v_version_version__status_idx" ON "payload"."_faqs_v" USING btree ("version__status");
  CREATE INDEX "_faqs_v_created_at_idx" ON "payload"."_faqs_v" USING btree ("created_at");
  CREATE INDEX "_faqs_v_updated_at_idx" ON "payload"."_faqs_v" USING btree ("updated_at");
  CREATE INDEX "_faqs_v_snapshot_idx" ON "payload"."_faqs_v" USING btree ("snapshot");
  CREATE INDEX "_faqs_v_published_locale_idx" ON "payload"."_faqs_v" USING btree ("published_locale");
  CREATE INDEX "_faqs_v_latest_idx" ON "payload"."_faqs_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_faqs_v_locales_locale_parent_id_unique" ON "payload"."_faqs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tour_scenes_hotspots_order_idx" ON "payload"."tour_scenes_hotspots" USING btree ("_order");
  CREATE INDEX "tour_scenes_hotspots_parent_id_idx" ON "payload"."tour_scenes_hotspots" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tour_scenes_hotspots_locales_locale_parent_id_unique" ON "payload"."tour_scenes_hotspots_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "tour_scenes_scene_number_idx" ON "payload"."tour_scenes" USING btree ("scene_number");
  CREATE INDEX "tour_scenes_thumbnail_image_idx" ON "payload"."tour_scenes" USING btree ("thumbnail_image_id");
  CREATE INDEX "tour_scenes_updated_at_idx" ON "payload"."tour_scenes" USING btree ("updated_at");
  CREATE INDEX "tour_scenes_created_at_idx" ON "payload"."tour_scenes" USING btree ("created_at");
  CREATE UNIQUE INDEX "tour_scenes_locales_locale_parent_id_unique" ON "payload"."tour_scenes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "inquiries_assigned_to_idx" ON "payload"."inquiries" USING btree ("assigned_to_id");
  CREATE INDEX "inquiries_updated_at_idx" ON "payload"."inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "payload"."inquiries" USING btree ("created_at");
  CREATE INDEX "analytics_events_updated_at_idx" ON "payload"."analytics_events" USING btree ("updated_at");
  CREATE INDEX "analytics_events_created_at_idx" ON "payload"."analytics_events" USING btree ("created_at");
  CREATE INDEX "kpi_snapshots_updated_at_idx" ON "payload"."kpi_snapshots" USING btree ("updated_at");
  CREATE INDEX "kpi_snapshots_created_at_idx" ON "payload"."kpi_snapshots" USING btree ("created_at");
  CREATE INDEX "ga_reports_updated_at_idx" ON "payload"."ga_reports" USING btree ("updated_at");
  CREATE INDEX "ga_reports_created_at_idx" ON "payload"."ga_reports" USING btree ("created_at");
  CREATE INDEX "audit_logs_updated_at_idx" ON "payload"."audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "payload"."audit_logs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_doctors_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("doctors_id");
  CREATE INDEX "payload_locked_documents_rels_departments_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("departments_id");
  CREATE INDEX "payload_locked_documents_rels_branches_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("branches_id");
  CREATE INDEX "payload_locked_documents_rels_doctor_schedules_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("doctor_schedules_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_promotions_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_tour_scenes_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("tour_scenes_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_events_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("analytics_events_id");
  CREATE INDEX "payload_locked_documents_rels_kpi_snapshots_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("kpi_snapshots_id");
  CREATE INDEX "payload_locked_documents_rels_ga_reports_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("ga_reports_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_idx" ON "payload"."site_settings" USING btree ("logo_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "payload"."site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "operational_settings_analytics_report_recipients_order_idx" ON "payload"."operational_settings_analytics_report_recipients" USING btree ("_order");
  CREATE INDEX "operational_settings_analytics_report_recipients_parent_id_idx" ON "payload"."operational_settings_analytics_report_recipients" USING btree ("_parent_id");
  CREATE INDEX "operational_settings_webhook_targets_order_idx" ON "payload"."operational_settings_webhook_targets" USING btree ("_order");
  CREATE INDEX "operational_settings_webhook_targets_parent_id_idx" ON "payload"."operational_settings_webhook_targets" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_menu_items_children_order_idx" ON "payload"."navigation_main_menu_items_children" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_items_children_parent_id_idx" ON "payload"."navigation_main_menu_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_menu_items_children_locale_idx" ON "payload"."navigation_main_menu_items_children" USING btree ("_locale");
  CREATE INDEX "navigation_main_menu_items_order_idx" ON "payload"."navigation_main_menu_items" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_items_parent_id_idx" ON "payload"."navigation_main_menu_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_menu_items_locale_idx" ON "payload"."navigation_main_menu_items" USING btree ("_locale");
  CREATE INDEX "navigation_footer_menu_items_order_idx" ON "payload"."navigation_footer_menu_items" USING btree ("_order");
  CREATE INDEX "navigation_footer_menu_items_parent_id_idx" ON "payload"."navigation_footer_menu_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_menu_items_locale_idx" ON "payload"."navigation_footer_menu_items" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."media_tags" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."media_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_hero" CASCADE;
  DROP TABLE "payload"."pages_blocks_section" CASCADE;
  DROP TABLE "payload"."pages" CASCADE;
  DROP TABLE "payload"."pages_locales" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_hero" CASCADE;
  DROP TABLE "payload"."_pages_v_blocks_section" CASCADE;
  DROP TABLE "payload"."_pages_v" CASCADE;
  DROP TABLE "payload"."_pages_v_locales" CASCADE;
  DROP TABLE "payload"."doctors_languages" CASCADE;
  DROP TABLE "payload"."doctors_education" CASCADE;
  DROP TABLE "payload"."doctors" CASCADE;
  DROP TABLE "payload"."doctors_locales" CASCADE;
  DROP TABLE "payload"."_doctors_v_version_languages" CASCADE;
  DROP TABLE "payload"."_doctors_v_version_education" CASCADE;
  DROP TABLE "payload"."_doctors_v" CASCADE;
  DROP TABLE "payload"."_doctors_v_locales" CASCADE;
  DROP TABLE "payload"."departments" CASCADE;
  DROP TABLE "payload"."departments_locales" CASCADE;
  DROP TABLE "payload"."_departments_v" CASCADE;
  DROP TABLE "payload"."_departments_v_locales" CASCADE;
  DROP TABLE "payload"."branches" CASCADE;
  DROP TABLE "payload"."branches_locales" CASCADE;
  DROP TABLE "payload"."_branches_v" CASCADE;
  DROP TABLE "payload"."_branches_v_locales" CASCADE;
  DROP TABLE "payload"."doctor_schedules" CASCADE;
  DROP TABLE "payload"."doctor_schedules_locales" CASCADE;
  DROP TABLE "payload"."_doctor_schedules_v" CASCADE;
  DROP TABLE "payload"."_doctor_schedules_v_locales" CASCADE;
  DROP TABLE "payload"."services" CASCADE;
  DROP TABLE "payload"."services_locales" CASCADE;
  DROP TABLE "payload"."_services_v" CASCADE;
  DROP TABLE "payload"."_services_v_locales" CASCADE;
  DROP TABLE "payload"."news" CASCADE;
  DROP TABLE "payload"."news_locales" CASCADE;
  DROP TABLE "payload"."_news_v" CASCADE;
  DROP TABLE "payload"."_news_v_locales" CASCADE;
  DROP TABLE "payload"."promotions" CASCADE;
  DROP TABLE "payload"."promotions_locales" CASCADE;
  DROP TABLE "payload"."_promotions_v" CASCADE;
  DROP TABLE "payload"."_promotions_v_locales" CASCADE;
  DROP TABLE "payload"."faqs" CASCADE;
  DROP TABLE "payload"."faqs_locales" CASCADE;
  DROP TABLE "payload"."_faqs_v" CASCADE;
  DROP TABLE "payload"."_faqs_v_locales" CASCADE;
  DROP TABLE "payload"."tour_scenes_hotspots" CASCADE;
  DROP TABLE "payload"."tour_scenes_hotspots_locales" CASCADE;
  DROP TABLE "payload"."tour_scenes" CASCADE;
  DROP TABLE "payload"."tour_scenes_locales" CASCADE;
  DROP TABLE "payload"."inquiries" CASCADE;
  DROP TABLE "payload"."analytics_events" CASCADE;
  DROP TABLE "payload"."kpi_snapshots" CASCADE;
  DROP TABLE "payload"."ga_reports" CASCADE;
  DROP TABLE "payload"."audit_logs" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TABLE "payload"."site_settings" CASCADE;
  DROP TABLE "payload"."site_settings_locales" CASCADE;
  DROP TABLE "payload"."operational_settings_analytics_report_recipients" CASCADE;
  DROP TABLE "payload"."operational_settings_webhook_targets" CASCADE;
  DROP TABLE "payload"."operational_settings" CASCADE;
  DROP TABLE "payload"."navigation_main_menu_items_children" CASCADE;
  DROP TABLE "payload"."navigation_main_menu_items" CASCADE;
  DROP TABLE "payload"."navigation_footer_menu_items" CASCADE;
  DROP TABLE "payload"."navigation" CASCADE;
  DROP TABLE "payload"."social_links" CASCADE;
  DROP TYPE "payload"."_locales";
  DROP TYPE "payload"."enum_users_role";
  DROP TYPE "payload"."enum_pages_blocks_section_image_position";
  DROP TYPE "payload"."enum_pages_status";
  DROP TYPE "payload"."enum__pages_v_blocks_section_image_position";
  DROP TYPE "payload"."enum__pages_v_version_status";
  DROP TYPE "payload"."enum__pages_v_published_locale";
  DROP TYPE "payload"."enum_doctors_sex";
  DROP TYPE "payload"."enum_doctors_employment_type";
  DROP TYPE "payload"."enum_doctors_status";
  DROP TYPE "payload"."enum__doctors_v_version_sex";
  DROP TYPE "payload"."enum__doctors_v_version_employment_type";
  DROP TYPE "payload"."enum__doctors_v_version_status";
  DROP TYPE "payload"."enum__doctors_v_published_locale";
  DROP TYPE "payload"."enum_departments_status";
  DROP TYPE "payload"."enum__departments_v_version_status";
  DROP TYPE "payload"."enum__departments_v_published_locale";
  DROP TYPE "payload"."enum_branches_status";
  DROP TYPE "payload"."enum__branches_v_version_status";
  DROP TYPE "payload"."enum__branches_v_published_locale";
  DROP TYPE "payload"."enum_doctor_schedules_day_of_week";
  DROP TYPE "payload"."enum_doctor_schedules_status";
  DROP TYPE "payload"."enum__doctor_schedules_v_version_day_of_week";
  DROP TYPE "payload"."enum__doctor_schedules_v_version_status";
  DROP TYPE "payload"."enum__doctor_schedules_v_published_locale";
  DROP TYPE "payload"."enum_services_status";
  DROP TYPE "payload"."enum__services_v_version_status";
  DROP TYPE "payload"."enum__services_v_published_locale";
  DROP TYPE "payload"."enum_news_status";
  DROP TYPE "payload"."enum__news_v_version_status";
  DROP TYPE "payload"."enum__news_v_published_locale";
  DROP TYPE "payload"."enum_promotions_status";
  DROP TYPE "payload"."enum__promotions_v_version_status";
  DROP TYPE "payload"."enum__promotions_v_published_locale";
  DROP TYPE "payload"."enum_faqs_category";
  DROP TYPE "payload"."enum_faqs_status";
  DROP TYPE "payload"."enum__faqs_v_version_category";
  DROP TYPE "payload"."enum__faqs_v_version_status";
  DROP TYPE "payload"."enum__faqs_v_published_locale";
  DROP TYPE "payload"."enum_tour_scenes_status";
  DROP TYPE "payload"."enum_inquiries_status";
  DROP TYPE "payload"."enum_analytics_events_event";
  DROP TYPE "payload"."enum_kpi_snapshots_metric";
  DROP TYPE "payload"."enum_kpi_snapshots_granularity";
  DROP TYPE "payload"."enum_ga_reports_report_type";
  DROP TYPE "payload"."enum_audit_logs_action";
  DROP TYPE "payload"."enum_audit_logs_user_role";`)
}
