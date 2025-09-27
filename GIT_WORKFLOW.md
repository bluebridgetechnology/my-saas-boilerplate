# 🔄 Git Workflow Guide

This guide explains how to maintain your boilerplate while developing your actual product.

## 🎯 **Recommended Strategy**

### **Two Repository Approach:**

1. **Template Repository** (`saas-boilerplate`) - Your reusable boilerplate
2. **Product Repository** (`your-actual-product`) - Your specific application

## 📋 **Step-by-Step Setup**

### **Step 1: Create Template Repository**

1. **Go to GitHub** and create a new repository:
   - **Name**: `saas-boilerplate`
   - **Description**: `Modern SaaS boilerplate with Next.js 15, Supabase, and Stripe`
   - **Visibility**: Public (so others can use it)
   - **Don't** initialize with README

2. **Push your boilerplate**:
```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/saas-boilerplate.git
git branch -M main
git push -u origin main
```

### **Step 2: Create Your Product Repository**

#### **Option A: Using the Script (Recommended)**

**For Windows:**
```bash
# Run the batch script
scripts/create-new-project.bat
```

**For Mac/Linux:**
```bash
# Make script executable
chmod +x scripts/create-new-project.sh

# Run the script
./scripts/create-new-project.sh
```

#### **Option B: Manual Process**

```bash
# 1. Create new directory
mkdir my-actual-product
cd my-actual-product

# 2. Clone boilerplate
git clone https://github.com/YOUR_USERNAME/saas-boilerplate.git .

# 3. Remove boilerplate's git history
rm -rf .git

# 4. Initialize new repository
git init
git add .
git commit -m "Initial commit: My actual product"

# 5. Create GitHub repository
gh repo create my-actual-product --public --description "My actual SaaS product"

# 6. Push to new repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/my-actual-product.git
git push -u origin main
```

## 🔄 **Workflow for Future Projects**

### **Creating New Projects**

1. **Run the script**:
```bash
# Windows
scripts/create-new-project.bat

# Mac/Linux
./scripts/create-new-project.sh
```

2. **Follow the prompts**:
   - Enter GitHub username
   - Enter project name
   - Enter project description

3. **Setup your new project**:
```bash
cd your-new-project
npm run setup
```

### **Updating the Boilerplate**

When you improve the boilerplate:

1. **Go to boilerplate directory**:
```bash
cd saas-boilerplate
```

2. **Make improvements**:
   - Add new features
   - Fix bugs
   - Update documentation

3. **Commit and push**:
```bash
git add .
git commit -m "Add new feature: description"
git push origin main
```

4. **Update existing projects** (if needed):
```bash
# In your product directory
git remote add boilerplate https://github.com/YOUR_USERNAME/saas-boilerplate.git
git fetch boilerplate
git merge boilerplate/main
```

## 📁 **Repository Structure**

### **Template Repository** (`saas-boilerplate`)
```
saas-boilerplate/
├── app/                    # Next.js app
├── components/             # UI components
├── lib/                   # Utilities
├── scripts/               # Setup scripts
├── supabase/              # Database migrations
├── README.md              # Boilerplate documentation
├── SETUP_GUIDE.md         # Setup instructions
└── package.json           # Dependencies
```

### **Product Repository** (`your-product`)
```
your-product/
├── app/                    # Your specific app
├── components/             # Your components
├── lib/                   # Your utilities
├── scripts/               # Setup scripts
├── supabase/              # Your database
├── README.md              # Your product docs
└── package.json           # Your dependencies
```

## 🎯 **Best Practices**

### **Template Repository**
- ✅ Keep it generic and reusable
- ✅ Document all features
- ✅ Test thoroughly before pushing
- ✅ Use semantic versioning
- ✅ Keep dependencies updated

### **Product Repository**
- ✅ Customize for your specific needs
- ✅ Add your branding
- ✅ Implement your features
- ✅ Keep sensitive data secure
- ✅ Regular backups

## 🔧 **Advanced Workflow**

### **Syncing Improvements**

If you want to sync improvements from boilerplate to existing projects:

```bash
# In your product directory
git remote add boilerplate https://github.com/YOUR_USERNAME/saas-boilerplate.git
git fetch boilerplate

# Merge specific improvements
git merge boilerplate/main --no-ff -m "Merge boilerplate improvements"
```

### **Cherry-picking Features**

To get specific features from boilerplate:

```bash
# Get specific commits
git cherry-pick <commit-hash>

# Or get specific files
git checkout boilerplate/main -- path/to/file
```

## 🚀 **Quick Commands**

### **Create New Project**
```bash
# Windows
scripts/create-new-project.bat

# Mac/Linux
./scripts/create-new-project.sh
```

### **Update Boilerplate**
```bash
cd saas-boilerplate
# Make changes
git add .
git commit -m "Description"
git push origin main
```

### **Sync to Existing Project**
```bash
cd your-product
git remote add boilerplate https://github.com/YOUR_USERNAME/saas-boilerplate.git
git fetch boilerplate
git merge boilerplate/main
```

## 📚 **Benefits of This Approach**

1. **🔄 Reusability**: Use boilerplate for multiple projects
2. **🛡️ Isolation**: Each product has its own repository
3. **📈 Scalability**: Easy to maintain and update
4. **👥 Collaboration**: Team members can work on specific products
5. **🔒 Security**: Sensitive data stays in product repositories
6. **📊 Version Control**: Track changes separately

## 🎉 **You're Ready!**

With this setup, you can:
- ✅ Maintain a clean boilerplate
- ✅ Create new projects quickly
- ✅ Keep products separate
- ✅ Sync improvements when needed
- ✅ Scale to multiple SaaS products

---

**Happy coding! 🚀**
