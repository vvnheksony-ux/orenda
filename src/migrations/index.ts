import * as migration_20260601_101608 from './20260601_101608';
import * as migration_20260601_112322 from './20260601_112322';
import * as migration_20260603_130000 from './20260603_130000_split_news_variants';
import * as migration_20260603_194500 from './20260603_194500_add_payload_lock_columns';
import * as migration_20260603_210000 from './20260603_210000_fix_health_tips_schema_drift';
import * as migration_20260609_000000 from './20260609_000000_recreate_variant_tables';
import * as migration_20260610_000000 from './20260610_000000_add_news_v_rels_table';
import * as migration_20260611_000000 from './20260611_000000_drop_insurance_provider';
import * as migration_20260611_120000 from './20260611_120000_add_branch_to_tour_scenes';

export const migrations = [
  {
    up: migration_20260601_101608.up,
    down: migration_20260601_101608.down,
    name: '20260601_101608',
  },
  {
    up: migration_20260601_112322.up,
    down: migration_20260601_112322.down,
    name: '20260601_112322'
  },
  {
    up: migration_20260603_130000.up,
    down: migration_20260603_130000.down,
    name: '20260603_130000'
  },
  {
    up: migration_20260603_194500.up,
    down: migration_20260603_194500.down,
    name: '20260603_194500'
  },
  {
    up: migration_20260603_210000.up,
    down: migration_20260603_210000.down,
    name: '20260603_210000'
  },
  {
    up: migration_20260609_000000.up,
    down: migration_20260609_000000.down,
    name: '20260609_000000'
  },
  {
    up: migration_20260610_000000.up,
    down: migration_20260610_000000.down,
    name: '20260610_000000'
  },
  {
    up: migration_20260611_000000.up,
    down: migration_20260611_000000.down,
    name: '20260611_000000'
  },
  {
    up: migration_20260611_120000.up,
    down: migration_20260611_120000.down,
    name: '20260611_120000'
  },
];
