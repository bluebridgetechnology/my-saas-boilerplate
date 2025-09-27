#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupProject() {
  console.log('🚀 Welcome to the SaaS Boilerplate Setup!');
  console.log('This will help you configure your new project.\n');

  // Get project details
  const appName = await question('What is your app name? ');
  const appDescription = await question('What is your app description? ');
  const baseUrl = await question('What is your base URL? (default: http://localhost:3000) ') || 'http://localhost:3000';

  console.log('\n📋 Now we need your Supabase credentials:');
  const supabaseUrl = await question('Supabase Project URL: ');
  const supabaseAnonKey = await question('Supabase Anon Key: ');
  const supabaseServiceKey = await question('Supabase Service Role Key: ');

  console.log('\n💳 Now we need your Stripe credentials:');
  const stripeSecretKey = await question('Stripe Secret Key: ');
  const stripePublishableKey = await question('Stripe Publishable Key: ');
  const stripeWebhookSecret = await question('Stripe Webhook Secret: ');

  // Create .env.local file
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Stripe Configuration
STRIPE_SECRET_KEY=${stripeSecretKey}
STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}

# Application Configuration
BASE_URL=${baseUrl}
APP_NAME=${appName}
APP_DESCRIPTION=${appDescription}
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('\n✅ Created .env.local file');

  // Update package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.name = appName.toLowerCase().replace(/\s+/g, '-');
  packageJson.description = appDescription;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');

  // Update app/layout.tsx
  const layoutPath = 'app/layout.tsx';
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  layoutContent = layoutContent.replace('{{APP_NAME}}', appName);
  layoutContent = layoutContent.replace('{{APP_DESCRIPTION}}', appDescription);
  fs.writeFileSync(layoutPath, layoutContent);
  console.log('✅ Updated app metadata');

  console.log('\n🎉 Setup complete! Next steps:');
  console.log('1. Run the SQL migration in your Supabase dashboard (see SUPABASE_SETUP.md)');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run dev');
  console.log('4. Visit: http://localhost:3000');
  console.log('\n📚 Check SUPABASE_SETUP.md for detailed database setup instructions.');

  rl.close();
}

setupProject().catch(console.error);
