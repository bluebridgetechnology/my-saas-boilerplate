import { supabaseAdmin } from '../lib/supabase/database';

async function addSubscriptionExpiresAtColumn() {
  try {
    console.log('Adding subscription_expires_at column to users table...');
    
    // Try to add the column by attempting to query it first
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('subscription_expires_at')
      .limit(1);

    if (error && error.message.includes('subscription_expires_at')) {
      console.log('Column does not exist, attempting to add it...');
      
      // Since we can't execute raw SQL directly, we'll need to use the migration file
      console.log('Please run the migration file: supabase/migrations/004_add_subscription_expires_at.sql');
      console.log('You can do this by running: npx supabase db push');
      return false;
    } else if (error) {
      console.error('Error checking column:', error);
      return false;
    } else {
      console.log('Column already exists');
      return true;
    }
  } catch (error) {
    console.error('Error in addSubscriptionExpiresAtColumn:', error);
    return false;
  }
}

// Run the check
addSubscriptionExpiresAtColumn()
  .then(success => {
    if (success) {
      console.log('Column check completed successfully');
      process.exit(0);
    } else {
      console.log('Column needs to be added via migration');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Check error:', error);
    process.exit(1);
  });
