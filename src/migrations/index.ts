import * as migration_20260601_101608 from './20260601_101608';
import * as migration_20260601_112322 from './20260601_112322';
import * as migration_20260603_130000_split_news_variants from './20260603_130000_split_news_variants';
import * as migration_20260603_194500_add_payload_lock_columns from './20260603_194500_add_payload_lock_columns';
import * as migration_20260603_210000_fix_health_tips_schema_drift from './20260603_210000_fix_health_tips_schema_drift';
import * as migration_20260605_052532 from './20260605_052532';
import * as migration_20260608_123000_fix_news_rels_columns from './20260608_123000_fix_news_rels_columns';
import * as migration_20260609_000000_recreate_variant_tables from './20260609_000000_recreate_variant_tables';
import * as migration_20260610_000000_add_news_v_rels_table from './20260610_000000_add_news_v_rels_table';
import * as migration_20260611_000000_drop_insurance_provider from './20260611_000000_drop_insurance_provider';
import * as migration_20260611_120000_add_branch_to_tour_scenes from './20260611_120000_add_branch_to_tour_scenes';
import * as migration_20260611_140000_drop_legacy_news_fields from './20260611_140000_drop_legacy_news_fields';
import * as migration_20260611_150000_rename_health_tips_tags_table from './20260611_150000_rename_health_tips_tags_table';
import * as migration_20260616_000000_add_tour_scene_room_group from './20260616_000000_add_tour_scene_room_group';
import * as migration_20260618_000000_add_mekong_otp_challenges from './20260618_000000_add_mekong_otp_challenges';
import * as migration_20260619_000000_lock_public_rls from './20260619_000000_lock_public_rls';
import * as migration_20260619_010000_add_telegram_subscribers from './20260619_010000_add_telegram_subscribers';
import * as migration_20260624_000000_add_health_tips_images from './20260624_000000_add_health_tips_images';
import * as migration_20260624_010000_add_tour_hotspot_target_scene from './20260624_010000_add_tour_hotspot_target_scene';
import * as migration_20260624_064704_centers_of_excellence from './20260624_064704_centers_of_excellence';
import * as migration_20260624_070000_add_promotion_price from './20260624_070000_add_promotion_price';

export const migrations = [
  {
    up: migration_20260601_101608.up,
    down: migration_20260601_101608.down,
    name: '20260601_101608',
  },
  {
    up: migration_20260601_112322.up,
    down: migration_20260601_112322.down,
    name: '20260601_112322',
  },
  {
    up: migration_20260603_130000_split_news_variants.up,
    down: migration_20260603_130000_split_news_variants.down,
    name: '20260603_130000_split_news_variants',
  },
  {
    up: migration_20260603_194500_add_payload_lock_columns.up,
    down: migration_20260603_194500_add_payload_lock_columns.down,
    name: '20260603_194500_add_payload_lock_columns',
  },
  {
    up: migration_20260603_210000_fix_health_tips_schema_drift.up,
    down: migration_20260603_210000_fix_health_tips_schema_drift.down,
    name: '20260603_210000_fix_health_tips_schema_drift',
  },
  {
    up: migration_20260605_052532.up,
    down: migration_20260605_052532.down,
    name: '20260605_052532',
  },
  {
    up: migration_20260608_123000_fix_news_rels_columns.up,
    down: migration_20260608_123000_fix_news_rels_columns.down,
    name: '20260608_123000_fix_news_rels_columns',
  },
  {
    up: migration_20260609_000000_recreate_variant_tables.up,
    down: migration_20260609_000000_recreate_variant_tables.down,
    name: '20260609_000000_recreate_variant_tables',
  },
  {
    up: migration_20260610_000000_add_news_v_rels_table.up,
    down: migration_20260610_000000_add_news_v_rels_table.down,
    name: '20260610_000000_add_news_v_rels_table',
  },
  {
    up: migration_20260611_000000_drop_insurance_provider.up,
    down: migration_20260611_000000_drop_insurance_provider.down,
    name: '20260611_000000_drop_insurance_provider',
  },
  {
    up: migration_20260611_120000_add_branch_to_tour_scenes.up,
    down: migration_20260611_120000_add_branch_to_tour_scenes.down,
    name: '20260611_120000_add_branch_to_tour_scenes',
  },
  {
    up: migration_20260611_140000_drop_legacy_news_fields.up,
    down: migration_20260611_140000_drop_legacy_news_fields.down,
    name: '20260611_140000_drop_legacy_news_fields',
  },
  {
    up: migration_20260611_150000_rename_health_tips_tags_table.up,
    down: migration_20260611_150000_rename_health_tips_tags_table.down,
    name: '20260611_150000_rename_health_tips_tags_table',
  },
  {
    up: migration_20260616_000000_add_tour_scene_room_group.up,
    down: migration_20260616_000000_add_tour_scene_room_group.down,
    name: '20260616_000000_add_tour_scene_room_group',
  },
  {
    up: migration_20260618_000000_add_mekong_otp_challenges.up,
    down: migration_20260618_000000_add_mekong_otp_challenges.down,
    name: '20260618_000000_add_mekong_otp_challenges',
  },
  {
    up: migration_20260619_000000_lock_public_rls.up,
    down: migration_20260619_000000_lock_public_rls.down,
    name: '20260619_000000_lock_public_rls',
  },
  {
    up: migration_20260619_010000_add_telegram_subscribers.up,
    down: migration_20260619_010000_add_telegram_subscribers.down,
    name: '20260619_010000_add_telegram_subscribers',
  },
  {
    up: migration_20260624_000000_add_health_tips_images.up,
    down: migration_20260624_000000_add_health_tips_images.down,
    name: '20260624_000000_add_health_tips_images',
  },
  {
    up: migration_20260624_010000_add_tour_hotspot_target_scene.up,
    down: migration_20260624_010000_add_tour_hotspot_target_scene.down,
    name: '20260624_010000_add_tour_hotspot_target_scene',
  },
  {
    up: migration_20260624_064704_centers_of_excellence.up,
    down: migration_20260624_064704_centers_of_excellence.down,
    name: '20260624_064704_centers_of_excellence'
  },
  {
    up: migration_20260624_070000_add_promotion_price.up,
    down: migration_20260624_070000_add_promotion_price.down,
    name: '20260624_070000_add_promotion_price'
  },
];
