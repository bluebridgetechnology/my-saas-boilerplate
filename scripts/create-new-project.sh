#!/bin/bash

# This script helps you create a new project from the boilerplate

echo "🚀 Creating new project from SaaS boilerplate..."

# Get project details
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your new project name: " PROJECT_NAME
read -p "Enter project description: " PROJECT_DESCRIPTION

# Create new directory
mkdir ../$PROJECT_NAME
cd ../$PROJECT_NAME

# Clone the boilerplate
git clone https://github.com/$GITHUB_USERNAME/saas-boilerplate.git .

# Remove the boilerplate's git history
rm -rf .git

# Initialize new git repository
git init
git add .
git commit -m "Initial commit: $PROJECT_DESCRIPTION"

# Create new GitHub repository
gh repo create $PROJECT_NAME --public --description "$PROJECT_DESCRIPTION"

# Push to new repository
git branch -M main
git remote add origin https://github.com/$GITHUB_USERNAME/$PROJECT_NAME.git
git push -u origin main

echo "✅ New project '$PROJECT_NAME' created successfully!"
echo "📁 Location: $(pwd)"
echo "🌐 GitHub: https://github.com/$GITHUB_USERNAME/$PROJECT_NAME"
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. npm run setup"
echo "3. Follow the setup guide"
