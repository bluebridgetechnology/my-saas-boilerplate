#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

interface Config {
  appName: string;
  appDescription: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
}

function replacePlaceholders(content: string, config: Config): string {
  return content
    .replace(/\{\{APP_NAME\}\}/g, config.appName)
    .replace(/\{\{APP_DESCRIPTION\}\}/g, config.appDescription);
}

function updateEnvFile(config: Config) {
  const envPath = '.env.local';
  const envExamplePath = 'env.example';
  
  if (!existsSync(envPath)) {
    console.log('Creating .env.local from template...');
    let envContent = readFileSync(envExamplePath, 'utf-8');
    
    if (config.supabaseUrl) {
      envContent = envContent.replace('your_supabase_project_url', config.supabaseUrl);
    }
    if (config.supabaseAnonKey) {
      envContent = envContent.replace('your_supabase_anon_key', config.supabaseAnonKey);
    }
    if (config.stripeSecretKey) {
      envContent = envContent.replace('your_stripe_secret_key', config.stripeSecretKey);
    }
    if (config.stripePublishableKey) {
      envContent = envContent.replace('your_stripe_publishable_key', config.stripePublishableKey);
    }
    
    envContent = replacePlaceholders(envContent, config);
    writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local');
  } else {
    console.log('⚠️  .env.local already exists, skipping creation');
  }
}

function updateFiles(config: Config) {
  const filesToUpdate = [
    'app/layout.tsx',
    'README.md',
    'package.json'
  ];

  filesToUpdate.forEach(filePath => {
    if (existsSync(filePath)) {
      console.log(`Updating ${filePath}...`);
      const content = readFileSync(filePath, 'utf-8');
      const updatedContent = replacePlaceholders(content, config);
      writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated ${filePath}`);
    }
  });
}

function installDependencies() {
  console.log('Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error);
    process.exit(1);
  }
}

function generateDatabaseMigration() {
  console.log('Generating database migration...');
  try {
    execSync('npm run db:generate', { stdio: 'inherit' });
    console.log('✅ Database migration generated');
  } catch (error) {
    console.error('❌ Failed to generate migration:', error);
    console.log('⚠️  You can run this manually later with: npm run db:generate');
  }
}

async function main() {
  console.log('🚀 Setting up your SaaS template...\n');

  // Get configuration from user
  const config: Config = {
    appName: process.argv[2] || 'My SaaS App',
    appDescription: process.argv[3] || 'A modern SaaS application',
  };

  console.log(`App Name: ${config.appName}`);
  console.log(`App Description: ${config.appDescription}\n`);

  // Update files with configuration
  updateFiles(config);
  
  // Create environment file
  updateEnvFile(config);
  
  // Install dependencies
  installDependencies();
  
  // Generate database migration
  generateDatabaseMigration();

  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Update .env.local with your actual Supabase and Stripe credentials');
  console.log('2. Run database migrations: npm run db:migrate');
  console.log('3. Start development server: npm run dev');
  console.log('\n📚 Check README.md for detailed setup instructions');
}

main().catch(console.error);
