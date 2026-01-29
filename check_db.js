const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ftsufrzwilxlinwjmxqh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c3Vmcnp3aWx4bGlud2pteHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTY0NjIsImV4cCI6MjA4NDk5MjQ2Mn0.rq48hBxlqVNdNuohAc6SMBc7suJOEpyjgsovHVc_eSw');

async function check() {
    const { data, error } = await supabase
        .from('candidate_profiles')
        .select(`
      id,
      job_title,
      candidate_skills(skills(name)),
      candidate_languages(languages(name)),
      candidate_qualifications(qualifications(name))
    `)
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
