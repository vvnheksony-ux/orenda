import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "public"."purchases" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "public"."inquiries" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;

    REVOKE ALL ON TABLE "public"."profiles" FROM anon, authenticated;
    REVOKE ALL ON TABLE "public"."appointments" FROM anon, authenticated;
    REVOKE ALL ON TABLE "public"."purchases" FROM anon, authenticated;
    REVOKE ALL ON TABLE "public"."inquiries" FROM anon, authenticated;
    REVOKE ALL ON TABLE "public"."feedback" FROM anon, authenticated;

    GRANT SELECT, INSERT, UPDATE ON TABLE "public"."profiles" TO authenticated;
    GRANT SELECT ON TABLE "public"."appointments" TO authenticated;
    GRANT SELECT ON TABLE "public"."purchases" TO authenticated;

    DROP POLICY IF EXISTS "profiles_select_own" ON "public"."profiles";
    CREATE POLICY "profiles_select_own"
      ON "public"."profiles"
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    DROP POLICY IF EXISTS "profiles_insert_own" ON "public"."profiles";
    CREATE POLICY "profiles_insert_own"
      ON "public"."profiles"
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "profiles_update_own" ON "public"."profiles";
    CREATE POLICY "profiles_update_own"
      ON "public"."profiles"
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "appointments_select_own" ON "public"."appointments";
    CREATE POLICY "appointments_select_own"
      ON "public"."appointments"
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "purchases_select_own" ON "public"."purchases";
    CREATE POLICY "purchases_select_own"
      ON "public"."purchases"
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP POLICY IF EXISTS "purchases_select_own" ON "public"."purchases";
    DROP POLICY IF EXISTS "appointments_select_own" ON "public"."appointments";
    DROP POLICY IF EXISTS "profiles_update_own" ON "public"."profiles";
    DROP POLICY IF EXISTS "profiles_insert_own" ON "public"."profiles";
    DROP POLICY IF EXISTS "profiles_select_own" ON "public"."profiles";

    GRANT SELECT, INSERT, UPDATE ON TABLE "public"."profiles" TO anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."appointments" TO anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."purchases" TO anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."inquiries" TO anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."feedback" TO anon, authenticated;
  `)
}
