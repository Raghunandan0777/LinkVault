import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const { data, error } = await supabase
      .from('link_clicks')
      .select('clicked_at, link_id')
      .in('link_id', []);
  console.log('DATA2:', data);
  console.log('ERROR2:', error?.message);
}

test();
