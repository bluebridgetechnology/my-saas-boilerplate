# Migration Guide: From Team-Based to User-Based SaaS

This guide helps you migrate from the original team-based architecture to the new user-based architecture.

## 🔄 What Changed

### Database Schema Changes
- **Removed**: `teams`, `team_members`, `invitations` tables
- **Updated**: `users` table now includes Stripe subscription fields
- **Simplified**: `activity_logs` now references users directly

### Authentication Changes
- **From**: Custom JWT with bcryptjs
- **To**: Supabase Auth with built-in features
- **Benefits**: Social auth, email verification, password reset

### Package Manager
- **From**: pnpm
- **To**: npm (standard)

## 📋 Migration Steps

### 1. Backup Your Data
```bash
# Export your current database
pg_dump your_database > backup.sql
```

### 2. Update Dependencies
```bash
# Remove old dependencies
npm uninstall bcryptjs jose

# Install new dependencies
npm install @supabase/supabase-js
```

### 3. Environment Variables
Update your `.env.local`:
```bash
# Remove old auth variables
# AUTH_SECRET=...

# Add Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_database_url
```

### 4. Database Migration
Create a migration script to transform your data:

```sql
-- Create new users table structure
CREATE TABLE users_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_product_id TEXT,
  plan_name VARCHAR(50),
  subscription_status VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Migrate team owners to users
INSERT INTO users_new (id, name, email, stripe_customer_id, stripe_subscription_id, stripe_product_id, plan_name, subscription_status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  u.name,
  u.email,
  t.stripe_customer_id,
  t.stripe_subscription_id,
  t.stripe_product_id,
  t.plan_name,
  t.subscription_status,
  u.created_at,
  NOW()
FROM users u
JOIN team_members tm ON u.id = tm.user_id
JOIN teams t ON tm.team_id = t.id
WHERE tm.role = 'owner';

-- Update activity logs
UPDATE activity_logs 
SET user_id = (
  SELECT un.id 
  FROM users_new un 
  JOIN users u ON un.email = u.email 
  WHERE u.id = activity_logs.user_id
);

-- Drop old tables
DROP TABLE invitations;
DROP TABLE team_members;
DROP TABLE teams;
DROP TABLE users;

-- Rename new table
ALTER TABLE users_new RENAME TO users;
```

### 5. Update Application Code

#### Authentication
Replace custom auth with Supabase:
```typescript
// Before
import { getUser } from '@/lib/db/queries';

// After
import { getUser } from '@/lib/auth/supabase';
```

#### User Management
Update user-related functions:
```typescript
// Before
const team = await getTeamForUser();

// After
const user = await getUser();
```

### 6. Update Stripe Integration
- Update webhook handlers to work with users instead of teams
- Update checkout sessions to use user IDs
- Update subscription management

### 7. Test Migration
1. **Authentication**: Test sign in/up flows
2. **Database**: Verify data integrity
3. **Payments**: Test subscription flows
4. **UI**: Check all user-facing features

## ⚠️ Important Notes

### Data Loss Considerations
- **Team Members**: Only team owners are migrated
- **Invitations**: All pending invitations are lost
- **Team-Specific Data**: Any team-specific customizations need manual migration

### Breaking Changes
- API endpoints changed from `/api/team` to `/api/user`
- User object structure changed
- Authentication flow completely different

### Rollback Plan
If migration fails:
1. Restore database from backup
2. Revert code changes
3. Reinstall old dependencies

## 🚀 Post-Migration

### 1. Update Documentation
- Update API documentation
- Update user guides
- Update deployment instructions

### 2. Notify Users
- Send migration notification
- Update user onboarding flow
- Provide migration support

### 3. Monitor
- Watch for authentication errors
- Monitor payment processing
- Check user activity logs

## 📞 Support

If you encounter issues during migration:
1. Check the migration logs
2. Verify environment variables
3. Test with a small dataset first
4. Contact support if needed

---

**Note**: This migration is irreversible. Make sure to test thoroughly in a staging environment before applying to production.
