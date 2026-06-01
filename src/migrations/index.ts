import * as migration_20260601_101608 from './20260601_101608';
import * as migration_20260601_112322 from './20260601_112322';

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
];
