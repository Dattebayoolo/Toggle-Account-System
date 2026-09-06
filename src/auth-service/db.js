import { Pool } from 'pg';

import { config } from '../common/config.js';

export const db = new Pool({
  connectionString: config.databaseUrl
});
