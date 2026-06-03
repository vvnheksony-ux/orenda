import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."health_tips"
      ADD COLUMN IF NOT EXISTS "health_tip_category" varchar;

    ALTER TABLE "payload"."_health_tips_v"
      ADD COLUMN IF NOT EXISTS "version_health_tip_category" varchar;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'payload'
          AND table_name = 'health_tips_locales'
          AND column_name = 'health_tip_category'
      ) THEN
        UPDATE "payload"."health_tips" h
        SET "health_tip_category" = src."health_tip_category"
        FROM (
          SELECT "_parent_id", "health_tip_category"
          FROM "payload"."health_tips_locales"
          WHERE "health_tip_category" IS NOT NULL
            AND "_locale" = 'en'::"payload"."_locales"
        ) src
        WHERE h."id" = src."_parent_id"
          AND h."health_tip_category" IS NULL;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'payload'
          AND table_name = '_health_tips_v_locales'
          AND column_name = 'version_health_tip_category'
      ) THEN
        UPDATE "payload"."_health_tips_v" h
        SET "version_health_tip_category" = src."version_health_tip_category"
        FROM (
          SELECT "_parent_id", "version_health_tip_category"
          FROM "payload"."_health_tips_v_locales"
          WHERE "version_health_tip_category" IS NOT NULL
            AND "_locale" = 'en'::"payload"."_locales"
        ) src
        WHERE h."id" = src."_parent_id"
          AND h."version_health_tip_category" IS NULL;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_health_tips_v_tags'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_health_tips_v_version_health_tip_tags'
      ) THEN
        ALTER TABLE "payload"."_health_tips_v_tags"
          RENAME TO "_health_tips_v_version_health_tip_tags";
      END IF;
    END $$;

    ALTER TABLE "payload"."_health_tips_v_version_health_tip_tags"
      DROP CONSTRAINT IF EXISTS "_health_tips_v_tags_parent_id_fk";

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_health_tips_v_version_health_tip_tags_parent_id_fk'
      ) THEN
        ALTER TABLE "payload"."_health_tips_v_version_health_tip_tags"
          ADD CONSTRAINT "_health_tips_v_version_health_tip_tags_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "payload"."_health_tips_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "_health_tips_v_version_health_tip_tags_parent_id_idx"
      ON "payload"."_health_tips_v_version_health_tip_tags" USING btree ("_parent_id");

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_plan_types'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_version_insurance_plan_types'
      ) THEN
        ALTER TABLE "payload"."_insurance_updates_v_plan_types"
          RENAME TO "_insurance_updates_v_version_insurance_plan_types";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_required_documents'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_version_required_documents'
      ) THEN
        ALTER TABLE "payload"."_insurance_updates_v_required_documents"
          RENAME TO "_insurance_updates_v_version_required_documents";
      END IF;
    END $$;

    ALTER TABLE "payload"."_insurance_updates_v_version_insurance_plan_types"
      DROP CONSTRAINT IF EXISTS "_insurance_updates_v_plan_types_parent_id_fk";

    ALTER TABLE "payload"."_insurance_updates_v_version_required_documents"
      DROP CONSTRAINT IF EXISTS "_insurance_updates_v_required_documents_parent_id_fk";

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_insurance_updates_v_version_insurance_plan_types_parent_id_fk'
      ) THEN
        ALTER TABLE "payload"."_insurance_updates_v_version_insurance_plan_types"
          ADD CONSTRAINT "_insurance_updates_v_version_insurance_plan_types_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_insurance_updates_v_version_required_documents_parent_id_fk'
      ) THEN
        ALTER TABLE "payload"."_insurance_updates_v_version_required_documents"
          ADD CONSTRAINT "_insurance_updates_v_version_required_documents_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "_insurance_updates_v_version_insurance_plan_types_parent_id_idx"
      ON "payload"."_insurance_updates_v_version_insurance_plan_types" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "_insurance_updates_v_version_required_documents_parent_id_idx"
      ON "payload"."_insurance_updates_v_version_required_documents" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload"."_insurance_updates_v_version_required_documents_parent_id_idx";
    DROP INDEX IF EXISTS "payload"."_insurance_updates_v_version_insurance_plan_types_parent_id_idx";
    DROP INDEX IF EXISTS "payload"."_health_tips_v_version_health_tip_tags_parent_id_idx";

    ALTER TABLE "payload"."_insurance_updates_v_version_required_documents"
      DROP CONSTRAINT IF EXISTS "_insurance_updates_v_version_required_documents_parent_id_fk";

    ALTER TABLE "payload"."_insurance_updates_v_version_insurance_plan_types"
      DROP CONSTRAINT IF EXISTS "_insurance_updates_v_version_insurance_plan_types_parent_id_fk";

    ALTER TABLE "payload"."_health_tips_v_version_health_tip_tags"
      DROP CONSTRAINT IF EXISTS "_health_tips_v_version_health_tip_tags_parent_id_fk";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_version_required_documents'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_required_documents'
      ) THEN
        ALTER TABLE "payload"."_insurance_updates_v_version_required_documents"
          RENAME TO "_insurance_updates_v_required_documents";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_version_insurance_plan_types'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_plan_types'
      ) THEN
        ALTER TABLE "payload"."_insurance_updates_v_version_insurance_plan_types"
          RENAME TO "_insurance_updates_v_plan_types";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_required_documents'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_insurance_updates_v_required_documents_parent_id_fk'
      ) THEN
        ALTER TABLE "payload"."_insurance_updates_v_required_documents"
          ADD CONSTRAINT "_insurance_updates_v_required_documents_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_insurance_updates_v_plan_types'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_insurance_updates_v_plan_types_parent_id_fk'
      ) THEN
        ALTER TABLE "payload"."_insurance_updates_v_plan_types"
          ADD CONSTRAINT "_insurance_updates_v_plan_types_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "payload"."_insurance_updates_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_health_tips_v_version_health_tip_tags'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_health_tips_v_tags'
      ) THEN
        ALTER TABLE "payload"."_health_tips_v_version_health_tip_tags"
          RENAME TO "_health_tips_v_tags";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'payload'
          AND table_name = '_health_tips_v_tags'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = '_health_tips_v_tags_parent_id_fk'
      ) THEN
        ALTER TABLE "payload"."_health_tips_v_tags"
          ADD CONSTRAINT "_health_tips_v_tags_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "payload"."_health_tips_v"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    ALTER TABLE "payload"."_health_tips_v"
      DROP COLUMN IF EXISTS "version_health_tip_category";

    ALTER TABLE "payload"."health_tips"
      DROP COLUMN IF EXISTS "health_tip_category";
  `)
}
