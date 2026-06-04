import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."announcements" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar,
      "thumbnail_id" integer,
      "author" varchar,
      "legacy_news_id" integer,
      "legacy_slug" varchar,
      "priority" varchar DEFAULT 'medium',
      "start_date" timestamp(3) with time zone,
      "end_date" timestamp(3) with time zone,
      "is_banner" boolean DEFAULT false,
      "banner_background_color" varchar,
      "status" varchar DEFAULT 'draft',
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" varchar DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "payload"."announcements_locales" (
      "title" varchar,
      "body" jsonb,
      "excerpt" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "payload"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."_announcements_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_slug" varchar,
      "version_thumbnail_id" integer,
      "version_author" varchar,
      "version_legacy_news_id" integer,
      "version_legacy_slug" varchar,
      "version_priority" varchar DEFAULT 'medium',
      "version_start_date" timestamp(3) with time zone,
      "version_end_date" timestamp(3) with time zone,
      "version_is_banner" boolean DEFAULT false,
      "version_banner_background_color" varchar,
      "version_status" varchar DEFAULT 'draft',
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" varchar DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" varchar,
      "latest" boolean
    );

    CREATE TABLE IF NOT EXISTS "payload"."_announcements_v_locales" (
      "version_title" varchar,
      "version_body" jsonb,
      "version_excerpt" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "payload"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."health_tips" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar,
      "thumbnail_id" integer,
      "author" varchar,
      "legacy_news_id" integer,
      "legacy_slug" varchar,
      "health_tip_category" varchar,
      "reading_time" numeric,
      "status" varchar DEFAULT 'draft',
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" varchar DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "payload"."health_tips_locales" (
      "title" varchar,
      "body" jsonb,
      "excerpt" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "payload"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."health_tips_tags" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "tag" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."_health_tips_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_slug" varchar,
      "version_thumbnail_id" integer,
      "version_author" varchar,
      "version_legacy_news_id" integer,
      "version_legacy_slug" varchar,
      "version_health_tip_category" varchar,
      "version_reading_time" numeric,
      "version_status" varchar DEFAULT 'draft',
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" varchar DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" varchar,
      "latest" boolean
    );

    CREATE TABLE IF NOT EXISTS "payload"."_health_tips_v_locales" (
      "version_title" varchar,
      "version_body" jsonb,
      "version_excerpt" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "payload"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."_health_tips_v_version_health_tip_tags" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "tag" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."careers" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar,
      "thumbnail_id" integer,
      "author" varchar,
      "legacy_news_id" integer,
      "legacy_slug" varchar,
      "career_department_id" integer,
      "career_location_id" integer,
      "career_employment_type" varchar,
      "experience_level" varchar,
      "application_deadline" timestamp(3) with time zone,
      "status" varchar DEFAULT 'draft',
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" varchar DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "payload"."careers_locales" (
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

    CREATE TABLE IF NOT EXISTS "payload"."_careers_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_slug" varchar,
      "version_thumbnail_id" integer,
      "version_author" varchar,
      "version_legacy_news_id" integer,
      "version_legacy_slug" varchar,
      "version_career_department_id" integer,
      "version_career_location_id" integer,
      "version_career_employment_type" varchar,
      "version_experience_level" varchar,
      "version_application_deadline" timestamp(3) with time zone,
      "version_status" varchar DEFAULT 'draft',
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" varchar DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" varchar,
      "latest" boolean
    );

    CREATE TABLE IF NOT EXISTS "payload"."_careers_v_locales" (
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

    CREATE TABLE IF NOT EXISTS "payload"."doctor_talks" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar,
      "thumbnail_id" integer,
      "author" varchar,
      "legacy_news_id" integer,
      "legacy_slug" varchar,
      "featured_doctor_id" integer,
      "event_date" timestamp(3) with time zone,
      "event_time" varchar,
      "duration" numeric,
      "is_virtual" boolean DEFAULT false,
      "meeting_link" varchar,
      "max_attendees" numeric,
      "status" varchar DEFAULT 'draft',
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" varchar DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "payload"."doctor_talks_locales" (
      "title" varchar,
      "body" jsonb,
      "excerpt" varchar,
      "talk_topic" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "payload"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."_doctor_talks_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_slug" varchar,
      "version_thumbnail_id" integer,
      "version_author" varchar,
      "version_legacy_news_id" integer,
      "version_legacy_slug" varchar,
      "version_featured_doctor_id" integer,
      "version_event_date" timestamp(3) with time zone,
      "version_event_time" varchar,
      "version_duration" numeric,
      "version_is_virtual" boolean DEFAULT false,
      "version_meeting_link" varchar,
      "version_max_attendees" numeric,
      "version_status" varchar DEFAULT 'draft',
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" varchar DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" varchar,
      "latest" boolean
    );

    CREATE TABLE IF NOT EXISTS "payload"."_doctor_talks_v_locales" (
      "version_title" varchar,
      "version_body" jsonb,
      "version_excerpt" varchar,
      "version_talk_topic" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "payload"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."insurance_updates" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar,
      "thumbnail_id" integer,
      "author" varchar,
      "legacy_news_id" integer,
      "legacy_slug" varchar,
      "insurance_provider" varchar,
      "insurance_contact_person" varchar,
      "insurance_contact_phone" varchar,
      "insurance_contact_email" varchar,
      "effective_date" timestamp(3) with time zone,
      "expiration_date" timestamp(3) with time zone,
      "status" varchar DEFAULT 'draft',
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" varchar DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "payload"."insurance_updates_locales" (
      "title" varchar,
      "body" jsonb,
      "excerpt" varchar,
      "coverage_details" jsonb,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "payload"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."insurance_updates_plan_types" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "plan_type" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."insurance_updates_required_documents" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "document" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."_insurance_updates_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_slug" varchar,
      "version_thumbnail_id" integer,
      "version_author" varchar,
      "version_legacy_news_id" integer,
      "version_legacy_slug" varchar,
      "version_insurance_provider" varchar,
      "version_insurance_contact_person" varchar,
      "version_insurance_contact_phone" varchar,
      "version_insurance_contact_email" varchar,
      "version_effective_date" timestamp(3) with time zone,
      "version_expiration_date" timestamp(3) with time zone,
      "version_status" varchar DEFAULT 'draft',
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" varchar DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "snapshot" boolean,
      "published_locale" varchar,
      "latest" boolean
    );

    CREATE TABLE IF NOT EXISTS "payload"."_insurance_updates_v_locales" (
      "version_title" varchar,
      "version_body" jsonb,
      "version_excerpt" varchar,
      "version_coverage_details" jsonb,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "payload"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."_insurance_updates_v_version_insurance_plan_types" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "plan_type" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."_insurance_updates_v_version_required_documents" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "document" varchar,
      "_uuid" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."content_search_index" (
      "id" serial PRIMARY KEY NOT NULL,
      "source_collection" varchar NOT NULL,
      "source_id" varchar NOT NULL,
      "content_type" varchar NOT NULL,
      "locale" varchar NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "canonical_path" varchar NOT NULL,
      "excerpt" varchar,
      "body_text" text,
      "thumbnail_id" integer,
      "status" varchar,
      "published_at" timestamp(3) with time zone,
      "legacy_news_id" integer,
      "legacy_slug" varchar,
      "metadata" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload"."announcements" ADD CONSTRAINT "announcements_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."announcements_locales" ADD CONSTRAINT "announcements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."announcements"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."_announcements_v" ADD CONSTRAINT "_announcements_v_parent_id_announcements_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."announcements"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."_announcements_v" ADD CONSTRAINT "_announcements_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."_announcements_v_locales" ADD CONSTRAINT "_announcements_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_announcements_v"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload"."health_tips" ADD CONSTRAINT "health_tips_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."health_tips_locales" ADD CONSTRAINT "health_tips_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."health_tips"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."health_tips_tags" ADD CONSTRAINT "health_tips_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."health_tips"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."_health_tips_v" ADD CONSTRAINT "_health_tips_v_parent_id_health_tips_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."health_tips"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."_health_tips_v" ADD CONSTRAINT "_health_tips_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."_health_tips_v_locales" ADD CONSTRAINT "_health_tips_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_health_tips_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."_health_tips_v_version_health_tip_tags" ADD CONSTRAINT "_health_tips_v_version_health_tip_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_health_tips_v"("id") ON DELETE cascade ON UPDATE no action;

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

    ALTER TABLE "payload"."insurance_updates" ADD CONSTRAINT "insurance_updates_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."insurance_updates_locales" ADD CONSTRAINT "insurance_updates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."insurance_updates_plan_types" ADD CONSTRAINT "insurance_updates_plan_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."insurance_updates_required_documents" ADD CONSTRAINT "insurance_updates_required_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."_insurance_updates_v" ADD CONSTRAINT "_insurance_updates_v_parent_id_insurance_updates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."insurance_updates"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."_insurance_updates_v" ADD CONSTRAINT "_insurance_updates_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload"."_insurance_updates_v_locales" ADD CONSTRAINT "_insurance_updates_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."_insurance_updates_v_version_insurance_plan_types" ADD CONSTRAINT "_insurance_updates_v_version_insurance_plan_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload"."_insurance_updates_v_version_required_documents" ADD CONSTRAINT "_insurance_updates_v_version_required_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload"."content_search_index" ADD CONSTRAINT "content_search_index_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;

    CREATE UNIQUE INDEX IF NOT EXISTS "announcements_slug_idx" ON "payload"."announcements" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "announcements_locales_locale_parent_id_unique" ON "payload"."announcements_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "announcements_thumbnail_idx" ON "payload"."announcements" USING btree ("thumbnail_id");
    CREATE INDEX IF NOT EXISTS "announcements__status_idx" ON "payload"."announcements" USING btree ("_status");

    CREATE UNIQUE INDEX IF NOT EXISTS "health_tips_slug_idx" ON "payload"."health_tips" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "health_tips_locales_locale_parent_id_unique" ON "payload"."health_tips_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "health_tips_thumbnail_idx" ON "payload"."health_tips" USING btree ("thumbnail_id");
    CREATE INDEX IF NOT EXISTS "health_tips__status_idx" ON "payload"."health_tips" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "health_tips_tags_parent_idx" ON "payload"."health_tips_tags" USING btree ("_parent_id");

    CREATE UNIQUE INDEX IF NOT EXISTS "careers_slug_idx" ON "payload"."careers" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "careers_locales_locale_parent_id_unique" ON "payload"."careers_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "careers_thumbnail_idx" ON "payload"."careers" USING btree ("thumbnail_id");
    CREATE INDEX IF NOT EXISTS "careers_department_idx" ON "payload"."careers" USING btree ("career_department_id");
    CREATE INDEX IF NOT EXISTS "careers_location_idx" ON "payload"."careers" USING btree ("career_location_id");
    CREATE INDEX IF NOT EXISTS "careers__status_idx" ON "payload"."careers" USING btree ("_status");

    CREATE UNIQUE INDEX IF NOT EXISTS "doctor_talks_slug_idx" ON "payload"."doctor_talks" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "doctor_talks_locales_locale_parent_id_unique" ON "payload"."doctor_talks_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "doctor_talks_thumbnail_idx" ON "payload"."doctor_talks" USING btree ("thumbnail_id");
    CREATE INDEX IF NOT EXISTS "doctor_talks_featured_doctor_idx" ON "payload"."doctor_talks" USING btree ("featured_doctor_id");
    CREATE INDEX IF NOT EXISTS "doctor_talks__status_idx" ON "payload"."doctor_talks" USING btree ("_status");

    CREATE UNIQUE INDEX IF NOT EXISTS "insurance_updates_slug_idx" ON "payload"."insurance_updates" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "insurance_updates_locales_locale_parent_id_unique" ON "payload"."insurance_updates_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "insurance_updates_thumbnail_idx" ON "payload"."insurance_updates" USING btree ("thumbnail_id");
    CREATE INDEX IF NOT EXISTS "insurance_updates__status_idx" ON "payload"."insurance_updates" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "insurance_updates_plan_types_parent_idx" ON "payload"."insurance_updates_plan_types" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "insurance_updates_required_documents_parent_idx" ON "payload"."insurance_updates_required_documents" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "content_search_index_source_idx" ON "payload"."content_search_index" USING btree ("source_collection", "source_id");
    CREATE INDEX IF NOT EXISTS "content_search_index_type_idx" ON "payload"."content_search_index" USING btree ("content_type");
    CREATE INDEX IF NOT EXISTS "content_search_index_locale_idx" ON "payload"."content_search_index" USING btree ("locale");
    CREATE INDEX IF NOT EXISTS "content_search_index_slug_idx" ON "payload"."content_search_index" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "content_search_index_published_at_idx" ON "payload"."content_search_index" USING btree ("published_at");
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'payload' AND table_name = 'news' AND column_name = 'content_type'
      ) THEN
        RAISE EXCEPTION 'split_news_variants requires payload.news.content_type before running';
      END IF;

      INSERT INTO "payload"."announcements" ("slug", "thumbnail_id", "author", "legacy_news_id", "legacy_slug", "priority", "start_date", "end_date", "is_banner", "banner_background_color", "status", "published_at", "updated_at", "created_at", "_status")
      SELECT n."slug", n."thumbnail_id", n."author", n."id", n."slug", n."priority", n."start_date", n."end_date", COALESCE(n."is_banner", false), n."banner_background_color", n."status", n."published_at", n."updated_at", n."created_at", n."_status"
      FROM "payload"."news" n
      WHERE COALESCE(n."content_type", 'announcement') = 'announcement'
        AND NOT EXISTS (SELECT 1 FROM "payload"."announcements" a WHERE a."legacy_news_id" = n."id");

      INSERT INTO "payload"."health_tips" ("slug", "thumbnail_id", "author", "legacy_news_id", "legacy_slug", "health_tip_category", "reading_time", "status", "published_at", "updated_at", "created_at", "_status")
      SELECT n."slug", n."thumbnail_id", n."author", n."id", n."slug", l."health_tip_category", n."reading_time", n."status", n."published_at", n."updated_at", n."created_at", n."_status"
      FROM "payload"."news" n
      LEFT JOIN "payload"."news_locales" l ON l."_parent_id" = n."id" AND l."_locale" = 'en'::"payload"."_locales"
      WHERE n."content_type" = 'healthtip'
        AND NOT EXISTS (SELECT 1 FROM "payload"."health_tips" h WHERE h."legacy_news_id" = n."id");

      INSERT INTO "payload"."careers" ("slug", "thumbnail_id", "author", "legacy_news_id", "legacy_slug", "career_department_id", "career_location_id", "career_employment_type", "experience_level", "application_deadline", "status", "published_at", "updated_at", "created_at", "_status")
      SELECT n."slug", n."thumbnail_id", n."author", n."id", n."slug", n."career_department_id", n."career_location_id", n."career_employment_type", n."experience_level", n."application_deadline", n."status", n."published_at", n."updated_at", n."created_at", n."_status"
      FROM "payload"."news" n
      WHERE n."content_type" = 'career'
        AND NOT EXISTS (SELECT 1 FROM "payload"."careers" c WHERE c."legacy_news_id" = n."id");

      INSERT INTO "payload"."doctor_talks" ("slug", "thumbnail_id", "author", "legacy_news_id", "legacy_slug", "featured_doctor_id", "event_date", "event_time", "duration", "is_virtual", "meeting_link", "max_attendees", "status", "published_at", "updated_at", "created_at", "_status")
      SELECT n."slug", n."thumbnail_id", n."author", n."id", n."slug", n."featured_doctor_id", n."event_date", n."event_time", n."duration", COALESCE(n."is_virtual", false), n."meeting_link", n."max_attendees", n."status", n."published_at", n."updated_at", n."created_at", n."_status"
      FROM "payload"."news" n
      WHERE n."content_type" = 'doctorsTalk'
        AND NOT EXISTS (SELECT 1 FROM "payload"."doctor_talks" d WHERE d."legacy_news_id" = n."id");

      INSERT INTO "payload"."insurance_updates" ("slug", "thumbnail_id", "author", "legacy_news_id", "legacy_slug", "insurance_provider", "insurance_contact_person", "insurance_contact_phone", "insurance_contact_email", "effective_date", "expiration_date", "status", "published_at", "updated_at", "created_at", "_status")
      SELECT n."slug", n."thumbnail_id", n."author", n."id", n."slug", l."insurance_provider", n."insurance_contact_person", n."insurance_contact_phone", n."insurance_contact_email", n."effective_date", n."expiration_date", n."status", n."published_at", n."updated_at", n."created_at", n."_status"
      FROM "payload"."news" n
      LEFT JOIN "payload"."news_locales" l ON l."_parent_id" = n."id" AND l."_locale" = 'en'::"payload"."_locales"
      WHERE n."content_type" = 'insurance'
        AND NOT EXISTS (SELECT 1 FROM "payload"."insurance_updates" i WHERE i."legacy_news_id" = n."id");

      INSERT INTO "payload"."announcements_locales" ("title", "body", "excerpt", "_locale", "_parent_id")
      SELECT l."title", l."body", l."excerpt", l."_locale", a."id"
      FROM "payload"."news_locales" l
      INNER JOIN "payload"."announcements" a ON a."legacy_news_id" = l."_parent_id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "payload"."announcements_locales" al
        WHERE al."_parent_id" = a."id" AND al."_locale" = l."_locale"
      );

      INSERT INTO "payload"."health_tips_locales" ("title", "body", "excerpt", "_locale", "_parent_id")
        SELECT l."title", l."body", l."excerpt", l."_locale", h."id"
        FROM "payload"."news_locales" l
        INNER JOIN "payload"."health_tips" h ON h."legacy_news_id" = l."_parent_id"
        WHERE NOT EXISTS (
          SELECT 1 FROM "payload"."health_tips_locales" hl
          WHERE hl."_parent_id" = h."id" AND hl."_locale" = l."_locale"
        );

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'payload' AND table_name = 'news_health_tip_tags') THEN
        INSERT INTO "payload"."health_tips_tags" ("_order", "_parent_id", "id", "tag")
        SELECT t."_order", h."id", t."id", t."tag"
        FROM "payload"."news_health_tip_tags" t
        INNER JOIN "payload"."health_tips" h ON h."legacy_news_id" = t."_parent_id"
        WHERE NOT EXISTS (
          SELECT 1 FROM "payload"."health_tips_tags" ht WHERE ht."id" = t."id"
        );
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'payload' AND table_name = 'news_locales' AND column_name = 'position') THEN
        INSERT INTO "payload"."careers_locales" ("title", "body", "excerpt", "position", "salary_range", "career_requirements", "responsibilities", "_locale", "_parent_id")
        SELECT l."title", l."body", l."excerpt", l."position", l."salary_range", NULL, NULL, l."_locale", c."id"
        FROM "payload"."news_locales" l
        INNER JOIN "payload"."careers" c ON c."legacy_news_id" = l."_parent_id"
        WHERE NOT EXISTS (
          SELECT 1 FROM "payload"."careers_locales" cl
          WHERE cl."_parent_id" = c."id" AND cl."_locale" = l."_locale"
        );
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'payload' AND table_name = 'news_locales' AND column_name = 'talk_topic') THEN
        INSERT INTO "payload"."doctor_talks_locales" ("title", "body", "excerpt", "talk_topic", "_locale", "_parent_id")
        SELECT l."title", l."body", l."excerpt", l."talk_topic", l."_locale", d."id"
        FROM "payload"."news_locales" l
        INNER JOIN "payload"."doctor_talks" d ON d."legacy_news_id" = l."_parent_id"
        WHERE NOT EXISTS (
          SELECT 1 FROM "payload"."doctor_talks_locales" dl
          WHERE dl."_parent_id" = d."id" AND dl."_locale" = l."_locale"
        );
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'payload' AND table_name = 'news_locales' AND column_name = 'coverage_details') THEN
        INSERT INTO "payload"."insurance_updates_locales" ("title", "body", "excerpt", "coverage_details", "_locale", "_parent_id")
        SELECT l."title", l."body", l."excerpt", l."coverage_details", l."_locale", i."id"
        FROM "payload"."news_locales" l
        INNER JOIN "payload"."insurance_updates" i ON i."legacy_news_id" = l."_parent_id"
        WHERE NOT EXISTS (
          SELECT 1 FROM "payload"."insurance_updates_locales" il
          WHERE il."_parent_id" = i."id" AND il."_locale" = l."_locale"
        );
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'payload' AND table_name = 'news_insurance_plan_types') THEN
        INSERT INTO "payload"."insurance_updates_plan_types" ("_order", "_parent_id", "id", "plan_type")
        SELECT t."_order", i."id", t."id", t."plan_type"
        FROM "payload"."news_insurance_plan_types" t
        INNER JOIN "payload"."insurance_updates" i ON i."legacy_news_id" = t."_parent_id"
        WHERE NOT EXISTS (
          SELECT 1 FROM "payload"."insurance_updates_plan_types" ip WHERE ip."id" = t."id"
        );
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'payload' AND table_name = 'news_required_documents') THEN
        INSERT INTO "payload"."insurance_updates_required_documents" ("_order", "_parent_id", "id", "document")
        SELECT t."_order", i."id", t."id", t."document"
        FROM "payload"."news_required_documents" t
        INNER JOIN "payload"."insurance_updates" i ON i."legacy_news_id" = t."_parent_id"
        WHERE NOT EXISTS (
          SELECT 1 FROM "payload"."insurance_updates_required_documents" ir WHERE ir."id" = t."id"
        );
      END IF;

      INSERT INTO "payload"."content_search_index" ("source_collection", "source_id", "content_type", "locale", "title", "slug", "canonical_path", "excerpt", "body_text", "thumbnail_id", "status", "published_at", "legacy_news_id", "legacy_slug", "metadata")
      SELECT 'announcements', a."id"::varchar, 'announcement', l."_locale", l."title", a."slug", '/announcements/' || a."slug", l."excerpt", l."body"::text, a."thumbnail_id", a."status", a."published_at", a."legacy_news_id", a."legacy_slug", jsonb_build_object('priority', a."priority", 'isBanner', a."is_banner")
      FROM "payload"."announcements" a
      INNER JOIN "payload"."announcements_locales" l ON l."_parent_id" = a."id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "payload"."content_search_index" c
        WHERE c."source_collection" = 'announcements' AND c."source_id" = a."id"::varchar AND c."locale" = l."_locale"::varchar
      );

      INSERT INTO "payload"."content_search_index" ("source_collection", "source_id", "content_type", "locale", "title", "slug", "canonical_path", "excerpt", "body_text", "thumbnail_id", "status", "published_at", "legacy_news_id", "legacy_slug", "metadata")
      SELECT 'health-tips', h."id"::varchar, 'health-tip', l."_locale", l."title", h."slug", '/health-tips/' || h."slug", l."excerpt", l."body"::text, h."thumbnail_id", h."status", h."published_at", h."legacy_news_id", h."legacy_slug", jsonb_build_object('healthTipCategory', h."health_tip_category", 'readingTime', h."reading_time")
      FROM "payload"."health_tips" h
      INNER JOIN "payload"."health_tips_locales" l ON l."_parent_id" = h."id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "payload"."content_search_index" c
        WHERE c."source_collection" = 'health-tips' AND c."source_id" = h."id"::varchar AND c."locale" = l."_locale"::varchar
      );

      INSERT INTO "payload"."content_search_index" ("source_collection", "source_id", "content_type", "locale", "title", "slug", "canonical_path", "excerpt", "body_text", "thumbnail_id", "status", "published_at", "legacy_news_id", "legacy_slug", "metadata")
      SELECT 'careers', c."id"::varchar, 'career', l."_locale", l."title", c."slug", '/careers/' || c."slug", l."excerpt", l."body"::text, c."thumbnail_id", c."status", c."published_at", c."legacy_news_id", c."legacy_slug", jsonb_build_object('position', l."position", 'experienceLevel', c."experience_level")
      FROM "payload"."careers" c
      INNER JOIN "payload"."careers_locales" l ON l."_parent_id" = c."id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "payload"."content_search_index" s
        WHERE s."source_collection" = 'careers' AND s."source_id" = c."id"::varchar AND s."locale" = l."_locale"::varchar
      );

      INSERT INTO "payload"."content_search_index" ("source_collection", "source_id", "content_type", "locale", "title", "slug", "canonical_path", "excerpt", "body_text", "thumbnail_id", "status", "published_at", "legacy_news_id", "legacy_slug", "metadata")
      SELECT 'doctor-talks', d."id"::varchar, 'doctor-talk', l."_locale", l."title", d."slug", '/doctor-talks/' || d."slug", l."excerpt", l."body"::text, d."thumbnail_id", d."status", d."published_at", d."legacy_news_id", d."legacy_slug", jsonb_build_object('talkTopic', l."talk_topic", 'eventDate', d."event_date")
      FROM "payload"."doctor_talks" d
      INNER JOIN "payload"."doctor_talks_locales" l ON l."_parent_id" = d."id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "payload"."content_search_index" s
        WHERE s."source_collection" = 'doctor-talks' AND s."source_id" = d."id"::varchar AND s."locale" = l."_locale"::varchar
      );

      INSERT INTO "payload"."content_search_index" ("source_collection", "source_id", "content_type", "locale", "title", "slug", "canonical_path", "excerpt", "body_text", "thumbnail_id", "status", "published_at", "legacy_news_id", "legacy_slug", "metadata")
      SELECT 'insurance-updates', i."id"::varchar, 'insurance-update', l."_locale", l."title", i."slug", '/insurance-updates/' || i."slug", l."excerpt", l."body"::text, i."thumbnail_id", i."status", i."published_at", i."legacy_news_id", i."legacy_slug", jsonb_build_object('insuranceProvider', i."insurance_provider")
      FROM "payload"."insurance_updates" i
      INNER JOIN "payload"."insurance_updates_locales" l ON l."_parent_id" = i."id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "payload"."content_search_index" s
        WHERE s."source_collection" = 'insurance-updates' AND s."source_id" = i."id"::varchar AND s."locale" = l."_locale"::varchar
      );
    END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "payload"."news" DROP CONSTRAINT IF EXISTS "news_featured_doctor_id_doctors_id_fk";
    ALTER TABLE "payload"."news" DROP CONSTRAINT IF EXISTS "news_career_department_id_departments_id_fk";
    ALTER TABLE "payload"."news" DROP CONSTRAINT IF EXISTS "news_career_location_id_branches_id_fk";

    DROP INDEX IF EXISTS "payload"."news_content_type_idx";
    DROP INDEX IF EXISTS "payload"."news_featured_doctor_idx";
    DROP INDEX IF EXISTS "payload"."news_career_department_idx";
    DROP INDEX IF EXISTS "payload"."news_career_location_idx";
    DROP TABLE IF EXISTS "payload"."news_health_tip_tags" CASCADE;
    DROP TABLE IF EXISTS "payload"."news_insurance_plan_types" CASCADE;
    DROP TABLE IF EXISTS "payload"."news_required_documents" CASCADE;
    DROP TABLE IF EXISTS "payload"."_news_v_version_health_tip_tags" CASCADE;
    DROP TABLE IF EXISTS "payload"."_news_v_version_insurance_plan_types" CASCADE;
    DROP TABLE IF EXISTS "payload"."_news_v_version_required_documents" CASCADE;

    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "content_type";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "reading_time";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "priority";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "start_date";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "end_date";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "is_banner";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "banner_background_color";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "featured_doctor_id";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "event_date";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "event_time";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "duration";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "is_virtual";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "meeting_link";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "max_attendees";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "career_department_id";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "career_location_id";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "career_employment_type";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "experience_level";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "application_deadline";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "insurance_contact_person";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "insurance_contact_phone";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "insurance_contact_email";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "effective_date";
    ALTER TABLE "payload"."news" DROP COLUMN IF EXISTS "expiration_date";

    ALTER TABLE "payload"."news_locales" DROP COLUMN IF EXISTS "position";
    ALTER TABLE "payload"."news_locales" DROP COLUMN IF EXISTS "health_tip_category";
    ALTER TABLE "payload"."news_locales" DROP COLUMN IF EXISTS "salary_range";
    ALTER TABLE "payload"."news_locales" DROP COLUMN IF EXISTS "talk_topic";
    ALTER TABLE "payload"."news_locales" DROP COLUMN IF EXISTS "coverage_details";
    ALTER TABLE "payload"."news_locales" DROP COLUMN IF EXISTS "insurance_provider";

    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_content_type";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_reading_time";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_priority";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_start_date";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_end_date";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_is_banner";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_banner_background_color";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_featured_doctor_id";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_event_date";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_event_time";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_duration";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_is_virtual";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_meeting_link";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_max_attendees";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_career_department_id";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_career_location_id";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_career_employment_type";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_experience_level";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_application_deadline";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_insurance_contact_person";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_insurance_contact_phone";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_insurance_contact_email";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_effective_date";
    ALTER TABLE "payload"."_news_v" DROP COLUMN IF EXISTS "version_expiration_date";

    ALTER TABLE "payload"."_news_v_locales" DROP COLUMN IF EXISTS "version_position";
    ALTER TABLE "payload"."_news_v_locales" DROP COLUMN IF EXISTS "version_health_tip_category";
    ALTER TABLE "payload"."_news_v_locales" DROP COLUMN IF EXISTS "version_salary_range";
    ALTER TABLE "payload"."_news_v_locales" DROP COLUMN IF EXISTS "version_talk_topic";
    ALTER TABLE "payload"."_news_v_locales" DROP COLUMN IF EXISTS "version_coverage_details";
    ALTER TABLE "payload"."_news_v_locales" DROP COLUMN IF EXISTS "version_insurance_provider";

    DROP TYPE IF EXISTS "payload"."enum_news_content_type";
    DROP TYPE IF EXISTS "payload"."enum_news_priority";
    DROP TYPE IF EXISTS "payload"."enum_news_career_employment_type";
    DROP TYPE IF EXISTS "payload"."enum_news_experience_level";
    DROP TYPE IF EXISTS "payload"."enum_news_health_tip_category";
    DROP TYPE IF EXISTS "payload"."enum__news_v_version_content_type";
    DROP TYPE IF EXISTS "payload"."enum__news_v_version_priority";
    DROP TYPE IF EXISTS "payload"."enum__news_v_version_career_employment_type";
    DROP TYPE IF EXISTS "payload"."enum__news_v_version_experience_level";
    DROP TYPE IF EXISTS "payload"."enum__news_v_version_health_tip_category";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload"."content_search_index" CASCADE;
    DROP TABLE IF EXISTS "payload"."_insurance_updates_v_version_required_documents" CASCADE;
    DROP TABLE IF EXISTS "payload"."_insurance_updates_v_version_insurance_plan_types" CASCADE;
    DROP TABLE IF EXISTS "payload"."_insurance_updates_v_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."_insurance_updates_v" CASCADE;
    DROP TABLE IF EXISTS "payload"."insurance_updates_required_documents" CASCADE;
    DROP TABLE IF EXISTS "payload"."insurance_updates_plan_types" CASCADE;
    DROP TABLE IF EXISTS "payload"."insurance_updates_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."insurance_updates" CASCADE;
    DROP TABLE IF EXISTS "payload"."_doctor_talks_v_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."_doctor_talks_v" CASCADE;
    DROP TABLE IF EXISTS "payload"."doctor_talks_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."doctor_talks" CASCADE;
    DROP TABLE IF EXISTS "payload"."_careers_v_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."_careers_v" CASCADE;
    DROP TABLE IF EXISTS "payload"."careers_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."careers" CASCADE;
    DROP TABLE IF EXISTS "payload"."_health_tips_v_version_health_tip_tags" CASCADE;
    DROP TABLE IF EXISTS "payload"."_health_tips_v_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."_health_tips_v" CASCADE;
    DROP TABLE IF EXISTS "payload"."health_tips_tags" CASCADE;
    DROP TABLE IF EXISTS "payload"."health_tips_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."health_tips" CASCADE;
    DROP TABLE IF EXISTS "payload"."_announcements_v_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."_announcements_v" CASCADE;
    DROP TABLE IF EXISTS "payload"."announcements_locales" CASCADE;
    DROP TABLE IF EXISTS "payload"."announcements" CASCADE;
  `)
}
