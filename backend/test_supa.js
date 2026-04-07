import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const { data, error } = await supabase
      .from('link_tags')
      .select('tags(name), count')
      .limit(1);
  console.log('DATA:', data);
  console.log('ERROR:', error);
}

test();
