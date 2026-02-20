# Database Setup Instructions

Follow these steps to set up your Supabase database:

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name**: campground-app (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait for the project to be provisioned (~2 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")
3. Add these to your `.env.local` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 3. Run SQL Scripts

In your Supabase dashboard, go to **SQL Editor** and run each script in order:

1. **01_create_tables.sql** - Creates all database tables
2. **02_create_indexes.sql** - Adds performance indexes
3. **03_create_views.sql** - Creates helpful views for stats
4. **04_enable_rls.sql** - Enables Row Level Security
5. **05_create_rls_policies.sql** - Sets up security policies
6. **06_create_triggers.sql** - Adds automatic timestamp updates and profile creation

**How to run:**
- Click "New query" in SQL Editor
- Copy the contents of a script file
- Paste into the editor
- Click "Run" or press Cmd/Ctrl + Enter
- Repeat for each file in order

## 4. Setup Storage

1. In Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Bucket details:
   - **Name**: `campground-photos`
   - **Public bucket**: Toggle ON (make it public)
4. Click "Create bucket"

### Storage Policies

After creating the bucket, set up storage policies:

1. Click on the `campground-photos` bucket
2. Go to **Policies** tab
3. Add these policies:

**Policy 1: Public Access (SELECT)**
```sql
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'campground-photos');
```

**Policy 2: Authenticated Upload (INSERT)**
```sql
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campground-photos'
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Users Delete Own Photos (DELETE)**
```sql
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'campground-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 5. Configure Authentication

1. Go to **Authentication** > **Providers**
2. Ensure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize confirmation and reset password emails

## 6. Verify Setup

After running all scripts, verify:

1. **Tables**: Go to **Table Editor** - you should see 5 tables (profiles, campgrounds, journal_entries, reviews, photos)
2. **Storage**: Go to **Storage** - you should see the `campground-photos` bucket
3. **RLS**: Each table should show "RLS enabled" with policies

## Troubleshooting

**Error: relation does not exist**
- Make sure you ran scripts in order
- Check that previous scripts completed successfully

**Error: permission denied**
- Verify you're using the SQL Editor in your Supabase dashboard
- Ensure you have admin access to the project

**Storage upload fails**
- Check that bucket is public
- Verify storage policies are created
- Check that `campground-photos` bucket name matches code

## Next Steps

Once database setup is complete:
- Verify credentials are in `.env.local`
- Test the connection by running the dev server
- Proceed to Google Maps API setup
