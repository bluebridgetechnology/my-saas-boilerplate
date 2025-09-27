#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

async function createNewProject() {
  console.log('🚀 Creating new project from SaaS boilerplate...\n');

  try {
    // Get project details
    const githubUsername = await question('Enter your GitHub username: ');
    const projectName = await question('Enter your new project name: ');
    const projectDescription = await question('Enter project description: ');

    console.log('\n📁 Creating project directory...');
    
    // Create new directory
    const projectPath = path.join('..', projectName);
    if (fs.existsSync(projectPath)) {
      console.log(`❌ Directory ${projectName} already exists!`);
      process.exit(1);
    }

    // Clone the boilerplate
    console.log('📥 Cloning boilerplate...');
    execSync(`git clone https://github.com/${githubUsername}/saas-boilerplate.git "${projectPath}"`, { stdio: 'inherit' });

    // Change to project directory
    process.chdir(projectPath);

    // Remove boilerplate's git history
    console.log('🗑️ Removing boilerplate git history...');
    execSync('rm -rf .git', { stdio: 'inherit' });

    // Initialize new git repository
    console.log('🔄 Initializing new git repository...');
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "Initial commit: ${projectDescription}"`, { stdio: 'inherit' });

    // Create new GitHub repository
    console.log('🌐 Creating GitHub repository...');
    try {
      execSync(`gh repo create ${projectName} --public --description "${projectDescription}"`, { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Could not create GitHub repository automatically. Please create it manually.');
      console.log(`   Repository name: ${projectName}`);
      console.log(`   Description: ${projectDescription}`);
    }

    // Push to new repository
    console.log('📤 Pushing to new repository...');
    execSync('git branch -M main', { stdio: 'inherit' });
    execSync(`git remote add origin https://github.com/${githubUsername}/${projectName}.git`, { stdio: 'inherit' });
    
    try {
      execSync('git push -u origin main', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Could not push automatically. Please push manually after creating the repository.');
    }

    console.log('\n✅ New project created successfully!');
    console.log(`📁 Location: ${path.resolve(projectPath)}`);
    console.log(`🌐 GitHub: https://github.com/${githubUsername}/${projectName}`);
    console.log('\n📋 Next steps:');
    console.log(`1. cd ${projectName}`);
    console.log('2. npm run setup');
    console.log('3. Follow the setup guide');
    console.log('4. Start developing your product! 🚀');

  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createNewProject();
