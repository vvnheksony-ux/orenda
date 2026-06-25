import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "payload"."permission_features" ("code", "sort_order", "status", "updated_at", "created_at")
    SELECT feature.code, feature.sort_order, 'active', now(), now()
    FROM (
      VALUES
        ('feedback', 32),
        ('patients', 33),
        ('profiles', 34),
        ('testimonials', 35)
    ) AS feature(code, sort_order)
    WHERE NOT EXISTS (
      SELECT 1
      FROM "payload"."permission_features" existing
      WHERE existing.code = feature.code
    );
  `)

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
    WHERE f.code IN ('feedback', 'patients', 'profiles', 'testimonials')
      AND NOT EXISTS (
        SELECT 1
        FROM "payload"."permissions" existing
        WHERE existing.permission_feature_id = f.id
          AND existing.permission_action_id = a.id
      );
  `)

  await db.execute(sql`
    UPDATE "payload"."roles_permissions" rp
    SET "enabled" = true,
        "updated_at" = now()
    FROM "payload"."roles" r,
         "payload"."permissions" p,
         "payload"."permission_features" f
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
      AND p.permission_feature_id = f.id
      AND r.code = 'admin'
      AND f.code IN ('appointments', 'purchases', 'inquiries', 'feedback', 'patients', 'profiles', 'testimonials');
  `)

  await db.execute(sql`
    INSERT INTO "payload"."roles_permissions" ("role_id", "permission_id", "enabled", "updated_at", "created_at")
    SELECT r.id, p.id, true, now(), now()
    FROM "payload"."roles" r
    JOIN "payload"."permissions" p ON true
    JOIN "payload"."permission_features" f ON f.id = p.permission_feature_id
    WHERE r.code = 'admin'
      AND f.code IN ('appointments', 'purchases', 'inquiries', 'feedback', 'patients', 'profiles', 'testimonials')
      AND NOT EXISTS (
        SELECT 1
        FROM "payload"."roles_permissions" existing
        WHERE existing.role_id = r.id
          AND existing.permission_id = p.id
      );
  `)

  await db.execute(sql`
    UPDATE "payload"."roles_permissions" rp
    SET "enabled" = true,
        "updated_at" = now()
    FROM "payload"."roles" r,
     "payload"."permissions" p,
     "payload"."permission_features" f
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
      AND p.permission_feature_id = f.id
      AND r.code = 'sale'
      AND f.code IN ('appointments', 'purchases', 'inquiries', 'feedback', 'users');
  `)

  await db.execute(sql`
    INSERT INTO "payload"."roles_permissions" ("role_id", "permission_id", "enabled", "updated_at", "created_at")
    SELECT r.id, p.id, true, now(), now()
    FROM "payload"."roles" r
    JOIN "payload"."permissions" p ON true
    JOIN "payload"."permission_features" f ON f.id = p.permission_feature_id
    WHERE r.code = 'sale'
      AND f.code IN ('appointments', 'purchases', 'inquiries', 'feedback', 'users')
      AND NOT EXISTS (
        SELECT 1
        FROM "payload"."roles_permissions" existing
        WHERE existing.role_id = r.id
          AND existing.permission_id = p.id
      );
  `)

  await db.execute(sql`
    UPDATE "payload"."roles" r
    SET "permission_matrix_draft" = matrix.data,
        "updated_at" = now()
    FROM (
      SELECT
        role.id AS role_id,
        jsonb_object_agg(permission.id::text, COALESCE(role_permission.enabled, false) ORDER BY permission.id) AS data
      FROM "payload"."roles" role
      CROSS JOIN "payload"."permissions" permission
      LEFT JOIN "payload"."roles_permissions" role_permission
        ON role_permission.role_id = role.id
       AND role_permission.permission_id = permission.id
      WHERE role.code IN ('admin', 'sale')
      GROUP BY role.id
    ) AS matrix
    WHERE r.id = matrix.role_id;
  `)
}

export async function down({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "payload"."roles_permissions"
    WHERE "permission_id" IN (
      SELECT p.id
      FROM "payload"."permissions" p
      JOIN "payload"."permission_features" f ON f.id = p.permission_feature_id
      WHERE f.code IN ('feedback', 'patients', 'profiles', 'testimonials')
    );

    DELETE FROM "payload"."permissions"
    WHERE "permission_feature_id" IN (
      SELECT id
      FROM "payload"."permission_features"
      WHERE code IN ('feedback', 'patients', 'profiles', 'testimonials')
    );

    DELETE FROM "payload"."permission_features"
    WHERE code IN ('feedback', 'patients', 'profiles', 'testimonials');
  `)
}
