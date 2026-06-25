import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Create RBAC tables (correct names without rbac_ prefix)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."permission_features" (
      "id" serial PRIMARY KEY,
      "code" varchar,
      "sort_order" numeric,
      "status" varchar DEFAULT 'active',
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."permission_actions" (
      "id" serial PRIMARY KEY,
      "code" varchar,
      "sort_order" numeric,
      "type" varchar DEFAULT 'main',
      "status" varchar DEFAULT 'active',
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."permissions" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL DEFAULT '',
      "permission_feature_id" integer REFERENCES "payload"."permission_features"("id") ON DELETE SET NULL,
      "permission_action_id" integer REFERENCES "payload"."permission_actions"("id") ON DELETE SET NULL,
      "sort_order" numeric DEFAULT 0,
      "status" varchar DEFAULT 'active',
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."roles" (
      "id" serial PRIMARY KEY,
      "code" varchar,
      "name" varchar,
      "description" varchar,
      "status" varchar DEFAULT 'active',
      "data_scope" varchar DEFAULT 'all',
      "permission_matrix_draft" jsonb,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."roles_permissions" (
      "id" serial PRIMARY KEY,
      "role_id" integer REFERENCES "payload"."roles"("id") ON DELETE CASCADE,
      "permission_id" integer REFERENCES "payload"."permissions"("id") ON DELETE CASCADE,
      "enabled" boolean DEFAULT false,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload"."users_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action,
      "path" varchar NOT NULL,
      "roles_id" integer REFERENCES "payload"."roles"("id") ON DELETE cascade ON UPDATE no action,
      "users_id" integer REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action
    );

    CREATE INDEX IF NOT EXISTS "permission_features_status_idx" ON "payload"."permission_features" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "permission_actions_status_idx" ON "payload"."permission_actions" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "permissions_permission_feature_idx" ON "payload"."permissions" USING btree ("permission_feature_id");
    CREATE INDEX IF NOT EXISTS "permissions_permission_action_idx" ON "payload"."permissions" USING btree ("permission_action_id");
    CREATE INDEX IF NOT EXISTS "permissions_status_idx" ON "payload"."permissions" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "roles_status_idx" ON "payload"."roles" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "roles_permissions_role_idx" ON "payload"."roles_permissions" USING btree ("role_id");
    CREATE INDEX IF NOT EXISTS "roles_permissions_permission_idx" ON "payload"."roles_permissions" USING btree ("permission_id");
    CREATE INDEX IF NOT EXISTS "users_rels_order_idx" ON "payload"."users_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "users_rels_parent_idx" ON "payload"."users_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "users_rels_path_idx" ON "payload"."users_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "users_rels_roles_idx" ON "payload"."users_rels" USING btree ("roles_id");
    CREATE INDEX IF NOT EXISTS "users_rels_users_idx" ON "payload"."users_rels" USING btree ("users_id");
  `)

  // 2. Add is_super_admin, parent_id, parent_path to users
  await db.execute(sql`
    ALTER TABLE "payload"."users"
      ADD COLUMN IF NOT EXISTS "is_super_admin" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "parent_id" integer REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action,
      ADD COLUMN IF NOT EXISTS "parent_path" varchar;
    CREATE INDEX IF NOT EXISTS "users_parent_idx" ON "payload"."users" USING btree ("parent_id");
  `)

  // 3. Convert users.role and audit_logs.user_role from enum to text
  await db.execute(sql`
    ALTER TABLE "payload"."users" ALTER COLUMN "role" DROP DEFAULT;
    ALTER TABLE "payload"."users" ALTER COLUMN "role" TYPE text USING "role"::text;
    ALTER TABLE "payload"."users" ALTER COLUMN "role" SET DEFAULT 'contributor';
    ALTER TABLE "payload"."audit_logs" ALTER COLUMN "user_role" DROP DEFAULT;
    ALTER TABLE "payload"."audit_logs" ALTER COLUMN "user_role" TYPE text USING "user_role"::text;
    DROP TYPE IF EXISTS "payload"."enum_users_role";
    DROP TYPE IF EXISTS "payload"."enum_audit_logs_user_role";
  `)

  // 4. Seed roles
  await db.execute(sql`
    INSERT INTO "payload"."roles" ("code", "name", "description", "status", "data_scope", "updated_at", "created_at")
    VALUES
      ('admin', 'Admin', 'Full system access', 'active', 'all', now(), now()),
      ('editor', 'Editor', 'Content management access', 'active', 'all', now(), now()),
      ('contributor', 'Contributor', 'Basic read access', 'active', 'own', now(), now())
    ON CONFLICT DO NOTHING;

    UPDATE "payload"."users" SET "is_super_admin" = true WHERE "role" = 'admin';

    INSERT INTO "payload"."users_rels" ("order", "parent_id", "path", "roles_id")
    SELECT 0, u.id, 'roles', r.id
    FROM "payload"."users" u
    JOIN "payload"."roles" r ON r.code = u."role"
    ON CONFLICT DO NOTHING;
  `)

  // 5. Seed permission features
  await db.execute(sql`
    INSERT INTO "payload"."permission_features" ("code", "sort_order", "status", "updated_at", "created_at") VALUES
      ('users', 1, 'active', now(), now()),
      ('media', 2, 'active', now(), now()),
      ('pages', 3, 'active', now(), now()),
      ('doctors', 4, 'active', now(), now()),
      ('departments', 5, 'active', now(), now()),
      ('branches', 6, 'active', now(), now()),
      ('doctor-schedules', 7, 'active', now(), now()),
      ('services', 8, 'active', now(), now()),
      ('service-packages', 9, 'active', now(), now()),
      ('news', 10, 'active', now(), now()),
      ('announcements', 11, 'active', now(), now()),
      ('health-tips', 12, 'active', now(), now()),
      ('careers', 13, 'active', now(), now()),
      ('doctor-talks', 14, 'active', now(), now()),
      ('insurance-updates', 15, 'active', now(), now()),
      ('content-search-index', 16, 'active', now(), now()),
      ('promotions', 17, 'active', now(), now()),
      ('faqs', 18, 'active', now(), now()),
      ('tourScenes', 19, 'active', now(), now()),
      ('inquiries', 20, 'active', now(), now()),
      ('analyticsEvents', 21, 'active', now(), now()),
      ('kpiSnapshots', 22, 'active', now(), now()),
      ('gaReports', 23, 'active', now(), now()),
      ('auditLogs', 24, 'active', now(), now()),
      ('content', 25, 'active', now(), now()),
      ('navigation', 26, 'active', now(), now()),
      ('socialLinks', 27, 'active', now(), now()),
      ('siteSettings', 28, 'active', now(), now()),
      ('operationalSettings', 29, 'active', now(), now());
  `)

  // 6. Seed permission actions
  await db.execute(sql`
    INSERT INTO "payload"."permission_actions" ("code", "type", "sort_order", "status", "updated_at", "created_at") VALUES
      ('create', 'main', 1, 'active', now(), now()),
      ('read', 'main', 2, 'active', now(), now()),
      ('update', 'main', 3, 'active', now(), now()),
      ('delete', 'main', 4, 'active', now(), now()),
      ('viewDrafts', 'sub', 5, 'active', now(), now());
  `)

  // 7. Seed permission pairs (feature × action)
  await db.execute(sql`
    INSERT INTO "payload"."permissions" ("name", "permission_feature_id", "permission_action_id", "status", "updated_at", "created_at")
    SELECT
      f.code || ':' || a.code,
      f.id,
      a.id,
      'active',
      now(),
      now()
    FROM "payload"."permission_features" f
    CROSS JOIN "payload"."permission_actions" a;
  `)

  // 8. Seed role-permission mappings
  await db.execute(sql`
    -- Admin: all permissions
    INSERT INTO "payload"."roles_permissions" ("role_id", "permission_id", "enabled", "updated_at", "created_at")
    SELECT (SELECT id FROM payload.roles WHERE code = 'admin'), p.id, true, now(), now()
    FROM "payload"."permissions" p;

    -- Editor: content CRUD + viewDrafts, read on system
    INSERT INTO "payload"."roles_permissions" ("role_id", "permission_id", "enabled", "updated_at", "created_at")
    SELECT (SELECT id FROM payload.roles WHERE code = 'editor'), p.id, true, now(), now()
    FROM "payload"."permissions" p
    JOIN "payload"."permission_features" f ON f.id = p.permission_feature_id
    JOIN "payload"."permission_actions" a ON a.id = p.permission_action_id
    WHERE (f.code IN ('pages','doctors','departments','branches','services','service-packages','news','announcements','health-tips','careers','doctor-talks','insurance-updates','promotions','faqs','tourScenes','inquiries','media','content','navigation','socialLinks'))
      OR (a.code = 'read' AND f.code IN ('users','analyticsEvents','kpiSnapshots','gaReports','auditLogs','content-search-index','doctor-schedules','siteSettings','operationalSettings'));

    -- Contributor: read only on content
    INSERT INTO "payload"."roles_permissions" ("role_id", "permission_id", "enabled", "updated_at", "created_at")
    SELECT (SELECT id FROM payload.roles WHERE code = 'contributor'), p.id, true, now(), now()
    FROM "payload"."permissions" p
    JOIN "payload"."permission_features" f ON f.id = p.permission_feature_id
    JOIN "payload"."permission_actions" a ON a.id = p.permission_action_id
    WHERE a.code = 'read' AND f.code IN ('pages','doctors','departments','branches','services','service-packages','news','announcements','health-tips','careers','doctor-talks','insurance-updates','promotions','faqs','tourScenes','media','content');
  `)
}

export async function down({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload"."users_rels";
    DROP TABLE IF EXISTS "payload"."roles_permissions";
    DROP TABLE IF EXISTS "payload"."permissions";
    DROP TABLE IF EXISTS "payload"."permission_actions";
    DROP TABLE IF EXISTS "payload"."permission_features";
    DROP TABLE IF EXISTS "payload"."roles";
    ALTER TABLE "payload"."users" DROP COLUMN IF EXISTS "is_super_admin";
    ALTER TABLE "payload"."users" DROP COLUMN IF EXISTS "parent_id";
    ALTER TABLE "payload"."users" DROP COLUMN IF EXISTS "parent_path";
  `)
}
