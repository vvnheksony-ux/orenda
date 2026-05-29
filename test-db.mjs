import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing insert into emergency_logs with Service Role Key...');
  
  const { data, error } = await supabase
    .from('emergency_logs')
    .insert([{ contact_info: 'test_script', message: 'Testing permissions' }])
    .select();
    
  if (error) {
    console.error('\n❌ FAILED:', error.message);
    if (error.message.includes('permission denied')) {
      console.error('\nDiagnoses: Your Service Role Key lacks PostgreSQL table permissions.');
      console.error('You MUST run the GRANT ALL SQL script in your Supabase dashboard.');
    }
  } else {
    console.log('\n✅ SUCCESS! Data inserted:');
    console.log(data);
    console.log('\nDiagnoses: The database is completely fine. Next.js just needs to be restarted to use the fixed code.');
  }
}

test();
