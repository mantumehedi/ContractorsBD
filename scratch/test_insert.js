
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const { data, error } = await supabase
        .from('projects')
        .insert({ name: 'Test Project', status: 'running' })
        .select();
    
    if (error) {
        console.error('Insert failed:', error.message);
    } else {
        console.log('Insert successful:', data);
    }
}

testInsert();
