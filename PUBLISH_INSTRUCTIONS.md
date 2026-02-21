# Publish Instructions for Shopify Client SDK

## 📦 Package Name: `shopify-client-sdk`

## 🚀 Step-by-Step Publish Process

### 1. Prerequisites

- **npm Account**: You need to have an npm account
- **npm Login**: You must be logged in to npm
- **Git Repository**: Package should be in a git repository with a remote (optional but recommended)

### 2. Login to npm

```bash
npm login
```

You will be prompted for:
- Username
- Password
- Email address (public or private)
- One-time password (OTP) if 2FA is enabled

### 3. Verify Build

Ensure the package builds successfully:

```bash
npm run build
```

### 4. Publish to npm Registry

```bash
npm publish
```

**Note**: If this is your first time publishing, you may need to create an organization or verify your email address.

### 5. Verify Published Package

Check if the package is available:

```bash
npm view shopify-client-sdk versions
npm view shopify-client-sdk description
npm view shopify-client-sdk repository
```

### 6. Update Package Version for Next Release

For subsequent releases, update the version:

```bash
# Patch release (bug fixes, backward compatible):
npm version patch
npm publish

# Minor release (new features, backward compatible):
npm version minor
npm publish

# Major release (breaking changes):
npm version major
npm publish
```

### 7. Test the Published Package

Create a test directory and install the package:

```bash
mkdir test-package && cd test-package
npm init -y
npm install shopify-client-sdk
```

Create a test file:

```typescript
// test.js
const { ShopifySDK } = require('shopify-client-sdk');

const config = {
  storeDomain: 'your-store.myshopify.com',
  apiVersion: '2023-10',
  accessToken: 'your-access-token'
};

const shopify = new ShopifySDK(config);

console.log('Shopify Client SDK installed successfully');
console.log('Version:', require('shopify-client-sdk/package.json').version);
```

Run the test:

```bash
node test.js
```

## 📄 What's Published

The following files are included in the published package:

```
shopify-client-sdk/
├── dist/                # Compiled JavaScript files
│   ├── index.js         # Main entry point
│   ├── index.d.ts       # TypeScript definitions
│   ├── core/            # Core functionality
│   ├── services/        # Service modules
│   └── utils/           # Utility functions
├── package.json         # Package metadata
├── .npmignore           # Ignored files
└── README.md            # Documentation
```

## ❌ Files Excluded from Publishing

```
src/                    # Source TypeScript files
examples/               # Usage examples
__tests__/              # Test files
*.md                    # Other documentation files
*.log                   # Log files
.idea/                  # IDE files
.vscode/                # VSCode settings
.gitignore              # Git configuration
tsconfig.json           # TypeScript configuration
jest.config.js          # Jest configuration
.eslintrc.json          # ESLint configuration
package-lock.json       # Dependency lock file
```

## 🔒 Security Checks

- All dependencies are up-to-date
- No known vulnerabilities (npm audit passed)
- Proper error handling 
- No hardcoded secrets

## 🐛 Troubleshooting

### 1. Package name already exists
If you get an error that the package name exists, try:
- Using a scoped package (e.g., `@your-username/shopify-client-sdk`)
- Choosing a different name

### 2. Authentication errors
- Ensure you're logged in (`npm whoami`)
- Check your credentials
- Verify OTP if 2FA is enabled

### 3. Build errors
- Run `npm run build` before publishing
- Check TypeScript errors
- Ensure dependencies are installed

## 📞 Support

If you encounter issues, you can:
1. Check npm documentation: [https://docs.npmjs.com/](https://docs.npmjs.com/)
2. Review your npm profile: [https://www.npmjs.com/](https://www.npmjs.com/)
3. Search for similar issues on Stack Overflow
