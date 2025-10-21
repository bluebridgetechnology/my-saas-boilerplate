import { supabaseAdmin } from './lib/supabase/database';

async function addSubscriptionExpiresAtColumn() {
  try {
    console.log('Adding subscription_expires_at column to users table...');
    
    // Add the column using raw SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at ON users(subscription_expires_at);
      `
    });

    if (error) {
      console.error('Error adding column:', error);
      return false;
    }

    console.log('Successfully added subscription_expires_at column');
    return true;
  } catch (error) {
    console.error('Error in addSubscriptionExpiresAtColumn:', error);
    return false;
  }
}

// Run the migration
addSubscriptionExpiresAtColumn()
  .then(success => {
    if (success) {
      console.log('Migration completed successfully');
      process.exit(0);
    } else {
      console.log('Migration failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
  });
