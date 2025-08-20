# Deployment Checklist

## Environment Variables
Ensure the following environment variables are set in your deployment environment:

### Required Database Variables
- `DB_HOST` - Database hostname
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port (default: 3307)
- `DB_SSL` - Set to "true" if SSL is required (default: false)

### Required Admin Variables
- `ADMIN_USERNAME` - Admin user login
- `ADMIN_PASSWORD` - Admin user password

### Required NextAuth Variables
- `NEXTAUTH_URL` - Your deployed application URL
- `NEXTAUTH_SECRET` - Secure random string for JWT encryption

## Image Assets
✅ All images have been organized into proper directories:
- Product images: `/public/images/products/`
- Badge images: `/public/images/badges/`
- Avatar images: `/public/images/avatars/`
- Ingredient images: `/public/images/ingredients/`

## Fixed Issues
✅ ProductHero error with null-safe getElementById handling
✅ PreviewPage params handling (async/await)
✅ Database connection error handling
✅ Image path resolution for deployment
✅ SafeImage component error handling
✅ Proper fallback system for missing images

## Database Setup
The application will automatically:
1. Create the database if it doesn't exist
2. Initialize required tables
3. Create admin user if not exists

## Image Configuration
- Images are set to `unoptimized: true` in next.config.mjs for deployment
- SafeImage component provides robust fallback handling
- All image paths are properly resolved using utility functions

## Build Process
Ensure your deployment platform:
1. Runs `npm install` or `pnpm install`
2. Runs `npm run build` or `pnpm build`
3. Starts with `npm start` or `pnpm start`

## Common Deployment Issues Resolved
1. **Image 404 errors**: Fixed by organizing images in proper directories and updating path resolution
2. **Database connection**: Enhanced error handling and environment variable validation
3. **Runtime errors**: Fixed null safety issues in ProductHero component
4. **Build errors**: Proper TypeScript and ESLint configuration

## Testing Before Deployment
1. Test database connection with provided test scripts
2. Verify all images load correctly
3. Test admin login functionality
4. Check all product pages render correctly
