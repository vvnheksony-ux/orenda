import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Insert new RBAC features: appointments, purchases
  await db.execute(sql`
    INSERT INTO "payload"."permission_features" ("code", "sort_order", "status", "updated_at", "created_at") VALUES
      ('appointments', 30, 'active', now(), now()),
      ('purchases', 31, 'active', now(), now());
  `)

  // 2. Insert new permission pairs for the new features (feature × action)
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
    CROSS JOIN "payload"."permission_actions" a
    WHERE f.code IN ('appointments', 'purchases');
  `)

  // 3. Insert the 'sale' role
  await db.execute(sql`
    INSERT INTO "payload"."roles" ("code", "name", "description", "status", "data_scope", "updated_at", "created_at")
    VALUES
      ('sale', 'Sale', 'Appointment and purchase management access', 'active', 'all', now(), now())
    ON CONFLICT DO NOTHING;
  `)

  // 4. Grant sale role: full CRUD on appointments + purchases
  await db.execute(sql`
    INSERT INTO "payload"."roles_permissions" ("role_id", "permission_id", "enabled", "updated_at", "created_at")
    SELECT r.id, p.id, true, now(), now()
    FROM "payload"."roles" r
    CROSS JOIN "payload"."permissions" p
    JOIN "payload"."permission_features" f ON f.id = p.permission_feature_id
    WHERE r.code = 'sale'
      AND f.code IN ('appointments', 'purchases');
  `)

  // 5. Grant sale role: read-only on doctors, services, promotions (for dropdowns)
  await db.execute(sql`
    INSERT INTO "payload"."roles_permissions" ("role_id", "permission_id", "enabled", "updated_at", "created_at")
    SELECT r.id, p.id, true, now(), now()
    FROM "payload"."roles" r
    CROSS JOIN "payload"."permissions" p
    JOIN "payload"."permission_features" f ON f.id = p.permission_feature_id
    JOIN "payload"."permission_actions" a ON a.id = p.permission_action_id
    WHERE r.code = 'sale'
      AND f.code IN ('doctors', 'services', 'promotions')
      AND a.code = 'read';
  `)
}

export async function down({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "payload"."roles_permissions" WHERE "role_id" = (SELECT id FROM "payload"."roles" WHERE code = 'sale');
    DELETE FROM "payload"."roles" WHERE code = 'sale';
    DELETE FROM "payload"."permissions" WHERE name LIKE 'appointments:%' OR name LIKE 'purchases:%';
    DELETE FROM "payload"."permission_features" WHERE code IN ('appointments', 'purchases');
  `)
}
