const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking job_alerts table...');
    const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error accessing job_alerts:', error.message, error.code);
        if (error.code === '42P01') {
            console.log('Table job_alerts DOES NOT exist.');
        }
    } else {
        console.log('Successfully accessed job_alerts table.');
    }
}

checkTable();
