import * as migration_20260601_101608 from './20260601_101608';
import * as migration_20260601_112322 from './20260601_112322';
import * as migration_20260603_130000 from './20260603_130000_split_news_variants';
import * as migration_20260603_194500 from './20260603_194500_add_payload_lock_columns';
import * as migration_20260603_210000 from './20260603_210000_fix_health_tips_schema_drift';

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
];
