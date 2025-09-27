@echo off
echo 🚀 Creating new project from SaaS boilerplate...

set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p PROJECT_NAME="Enter your new project name: "
set /p PROJECT_DESCRIPTION="Enter project description: "

echo Creating new directory...
mkdir ..\%PROJECT_NAME%
cd ..\%PROJECT_NAME%

echo Cloning boilerplate...
git clone https://github.com/%GITHUB_USERNAME%/saas-boilerplate.git .

echo Removing boilerplate git history...
rmdir /s /q .git

echo Initializing new git repository...
git init
git add .
git commit -m "Initial commit: %PROJECT_DESCRIPTION%"

echo Creating new GitHub repository...
gh repo create %PROJECT_NAME% --public --description "%PROJECT_DESCRIPTION%"

echo Pushing to new repository...
git branch -M main
git remote add origin https://github.com/%GITHUB_USERNAME%/%PROJECT_NAME%.git
git push -u origin main

echo ✅ New project '%PROJECT_NAME%' created successfully!
echo 📁 Location: %CD%
echo 🌐 GitHub: https://github.com/%GITHUB_USERNAME%/%PROJECT_NAME%
echo.
echo Next steps:
echo 1. cd %PROJECT_NAME%
echo 2. npm run setup
echo 3. Follow the setup guide
pause
