import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('Make sure you have VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const testUser = {
    email: 'testuser@campground.app',
    password: 'testpass123',
    email_confirm: true,
    user_metadata: {
      username: 'test_camper',
      full_name: 'Test Camper'
    }
  };

  console.log('Creating test user...');

  const { data, error } = await supabase.auth.admin.createUser({
    email: testUser.email,
    password: testUser.password,
    email_confirm: testUser.email_confirm,
    user_metadata: testUser.user_metadata
  });

  if (error) {
    console.error('Error creating user:', error);
    return;
  }

  console.log('✅ Test user created successfully!');
  console.log('\nLogin credentials:');
  console.log('Email:', testUser.email);
  console.log('Password:', testUser.password);
  console.log('Username:', testUser.user_metadata.username);
  console.log('\nUser ID:', data.user.id);
}

createTestUser();
