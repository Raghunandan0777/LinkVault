import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const { data, error } = await supabase.from('links').select('id').limit(1);
  console.log('LINKS:', data ? 'EXISTS' : 'NO');
  const { data: d2, error: e2 } = await supabase.from('link_tags').select('*').limit(1);
  console.log('LINK_TAGS:', e2 ? e2.message : 'EXISTS');
  const { data: d3, error: e3 } = await supabase.from('link_clicks').select('*').limit(1);
  console.log('LINK_CLICKS:', e3 ? e3.message : 'EXISTS');
}

test();
