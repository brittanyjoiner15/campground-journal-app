import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgdngaaatfzttkywstkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZG5nYWFhdGZ6dHRreXdzdGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDMwMjMsImV4cCI6MjA4NzExOTAyM30.QlnRoZj-mM70WngF5gGQjpLPZZCj0mtwHdsDy4K_jd4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createProfile() {
  const userId = 'ab332a0c-c33f-4efa-9cb9-4fb4617128ec';
  const username = process.argv[2];

  if (!username) {
    console.log('Usage: node create-profile.js <username>');
    console.log('Example: node create-profile.js britt');
    process.exit(1);
  }

  console.log('Creating profile for user:', userId);
  console.log('Username:', username);

  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      username: username,
      full_name: 'Brittany',
      bio: null,
      avatar_url: null,
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating profile:', error.message);
    console.error('Details:', error);
  } else {
    console.log('✅ Profile created successfully!');
    console.log('Profile:', data);
    console.log('\nNow refresh your browser!');
  }
}

createProfile().catch(console.error);
