// Test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhrbfbpwqzyqruwmlwrq.supabase.co';
const supabaseKey = 'sb_publishable_M3JeaUR_llT78uX-CnINKw_5mGTbaSe';

console.log('🔍 Testing Supabase connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if profiles table exists and is accessible
    console.log('📊 Test 1: Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      console.log('\n💡 You need to run the database schema first!');
      console.log('Go to Supabase Dashboard → SQL Editor → Run the schema.sql file\n');
      return false;
    }
    console.log('✅ Profiles table accessible!');

    // Test 2: Check ELO ratings table
    console.log('\n📊 Test 2: Checking elo_ratings table...');
    const { data: ratings, error: ratingsError } = await supabase
      .from('elo_ratings')
      .select('*')
      .limit(1);

    if (ratingsError) {
      console.error('❌ ELO ratings table error:', ratingsError.message);
      return false;
    }
    console.log('✅ ELO ratings table accessible!');

    // Test 3: Count profiles
    console.log('\n📊 Test 3: Counting registered users...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count error:', countError.message);
      return false;
    }
    console.log(`✅ Found ${count} registered user(s)`);

    // Test 4: Get leaderboard
    console.log('\n📊 Test 4: Fetching leaderboard...');
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('elo_ratings')
      .select(`
        *,
        profiles:user_id (
          username
        )
      `)
      .eq('game_mode', 'ranked')
      .order('rating', { ascending: false })
      .limit(5);

    if (leaderboardError) {
      console.error('❌ Leaderboard error:', leaderboardError.message);
      return false;
    }

    if (leaderboard && leaderboard.length > 0) {
      console.log('✅ Leaderboard data fetched!');
      console.log('\n🏆 Top Players:');
      leaderboard.forEach((player, index) => {
        console.log(`   ${index + 1}. ${player.profiles?.username || 'Unknown'} - ${player.rating} ELO`);
      });
    } else {
      console.log('ℹ️  No players on leaderboard yet');
    }

    console.log('\n✅ All tests passed! Supabase connection is working!\n');
    return true;

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Your Supabase is ready! Start the app with: npm run dev');
  } else {
    console.log('\n❌ Connection failed. Check:');
    console.log('   1. Did you run the SQL schema in Supabase?');
    console.log('   2. Are your credentials correct in .env?');
    console.log('   3. Is your Supabase project active?\n');
  }
});
