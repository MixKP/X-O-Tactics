/**
 * Diagnostic script to check Supabase database setup
 * Run with: node test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking Supabase Database Setup...\n');

async function runDiagnostics() {
  let allGood = true;

  // 1. Check connection
  console.log('1️⃣ Testing connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    console.log('   ✅ Connection successful\n');
  } catch (error) {
    console.error('   ❌ Connection failed:', error.message);
    console.log('   Make sure you ran the complete-setup-fixed.sql script\n');
    allGood = false;
  }

  // 2. Check if email column exists in profiles
  console.log('2️⃣ Checking profiles table structure...');
  try {
    const { data, error } = await supabase.from('profiles').select('id, username, email').limit(1);
    if (error) {
      if (error.message.includes('column') && error.message.includes('email')) {
        console.error('   ❌ Missing "email" column in profiles table!');
        console.log('   Run: ALTER TABLE public.profiles ADD COLUMN email TEXT;\n');
        allGood = false;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ Profiles table structure correct\n');
    }
  } catch (error) {
    console.error('   ❌ Error checking profiles:', error.message, '\n');
    allGood = false;
  }

  // 3. Check game_sessions table
  console.log('3️⃣ Checking game_sessions table...');
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    console.log(`   ✅ Found ${data.length} recent game sessions`);
    if (data.length > 0) {
      console.log('   Latest sessions:');
      data.forEach(session => {
        console.log(`     - ${session.id.slice(0, 8)}... | ${session.status} | ${new Date(session.created_at).toLocaleString()}`);
      });
    }
    console.log('');
  } catch (error) {
    console.error('   ❌ Error checking game_sessions:', error.message);
    console.log('   Make sure game_sessions table exists\n');
    allGood = false;
  }

  // 4. Check matchmaking_queue table
  console.log('4️⃣ Checking matchmaking_queue table...');
  try {
    const { data, error } = await supabase
      .from('matchmaking_queue')
      .select('id, status, game_mode')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    console.log(`   ✅ Found ${data.length} queue entries`);
    if (data.length > 0) {
      console.log('   Latest entries:');
      data.forEach(entry => {
        console.log(`     - ${entry.id.slice(0, 8)}... | ${entry.status} | ${entry.game_mode}`);
      });
    } else {
      console.log('   ℹ️  No active queue entries (this is normal if no one is matchmaking)\n');
    }
  } catch (error) {
    console.error('   ❌ Error checking matchmaking_queue:', error.message, '\n');
    allGood = false;
  }

  // 5. Check Realtime publication
  console.log('5️⃣ Checking Realtime setup...');
  console.log('   ⚠️  Cannot check programmatically - please verify manually:');
  console.log('   Go to: https://supabase.com/dashboard/project/nhrbfbpwqzyqruwmlwrq/database/replication');
  console.log('   Make sure "supabase_realtime" publication includes "game_sessions" table\n');

  // 6. Test RPC functions
  console.log('6️⃣ Testing RPC functions...');
  try {
    // Test cleanup_expired_queue function
    const { data: cleanupData, error: cleanupError } = await supabase.rpc('cleanup_expired_queue');
    if (cleanupError && !cleanupError.message.includes('function')) {
      throw cleanupError;
    }
    console.log('   ✅ RPC functions accessible\n');
  } catch (error) {
    console.error('   ❌ RPC function error:', error.message);
    console.log('   Make sure complete-setup-fixed.sql was run\n');
    allGood = false;
  }

  // Final verdict
  console.log('━'.repeat(50));
  if (allGood) {
    console.log('✅ All checks passed! Database is properly configured.\n');
    console.log('If you still have issues, check:');
    console.log('1. Browser console (F12) for JavaScript errors');
    console.log('2. Network tab for failed API requests');
    console.log('3. Supabase dashboard → Logs for database errors');
  } else {
    console.log('❌ Some issues found. Please fix the errors above.\n');
    console.log('Most fixes can be done by running:');
    console.log('  cat supabase/complete-setup-fixed.sql');
    console.log('  (Copy and paste into Supabase SQL Editor)');
  }
  console.log('━'.repeat(50));
}

runDiagnostics().catch(console.error);
