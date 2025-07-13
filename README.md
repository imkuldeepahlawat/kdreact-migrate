# React Migration CLI

A comprehensive CLI tool to migrate React applications from version 16 to newer versions (17, 18, 19) with full TypeScript support.

## 🚀 **Features**

- **Complete React Migration**: Migrate from React 16 to 17, 18, or 19
- **Dependency Updates**: 40+ React-related packages with version mappings
- **Code Transformations**: ReactDOM.render → createRoot, lifecycle methods, PropTypes
- **Configuration Updates**: TypeScript, Jest, ESLint, Babel, Webpack configs
- **Comprehensive Reporting**: Detailed migration reports with fixes and manual review items
- **TypeScript Support**: Full TypeScript implementation with proper types and documentation

## 📦 **Installation**

```bash
# Install globally
npm install -g kdreact-migrate

# Or use npx
npx kdreact-migrate [version] [path]
```

## 🛠️ **Usage**

### Basic Migration

```bash
# Migrate to React 18 (default)
react-migrate

# Migrate to specific version
react-migrate 17
react-migrate 18
react-migrate 19

# Migrate specific project
react-migrate 18 /path/to/react-project
```

### CLI Options

```bash
# Dry run (show changes without applying)
react-migrate 18 --dry-run

# Verbose output
react-migrate 18 --verbose

# Skip dependency updates
react-migrate 18 --skip-deps

# Only update dependencies
react-migrate 18 --deps-only
```

### Additional Commands

```bash
# Check compatibility without migrating
react-migrate check 18

# Analyze specific package
react-migrate analyze-package react-router-dom
```

## 🏗️ **Development**

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for local workflow testing)

### Setup

```bash
# Clone the repository
git clone https://github.com/imkuldeepahlawat/kdreact-migrate.git
cd kdreact-migrate

# Install dependencies
npm install

# Build the project
npm run build
```

### Available Scripts

```bash
# Development
npm run dev          # Watch mode
npm run build        # Build TypeScript
npm run clean        # Clean build artifacts

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode tests
npm run test:coverage # Tests with coverage

# Code Quality
npm run lint         # ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript type checking
npm run format       # Prettier formatting
npm run format:check # Check formatting

# Documentation
npm run docs         # Generate TypeDoc
npm run docs:serve   # Serve documentation
```

## 🧪 **Testing**

### Local Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### GitHub Actions Testing

The project includes comprehensive GitHub Actions workflows that can be tested locally using [nektos/act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Test workflows locally
act workflow_dispatch -W .github/workflows/test-local.yml --container-architecture linux/amd64
```

See [GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md) for detailed workflow documentation.

## 📋 **GitHub Actions**

This project includes comprehensive CI/CD workflows:

- **CI Workflow**: Multi-Node testing, linting, type checking
- **Documentation Deployment**: Auto-deploy to GitHub Pages
- **Package Publishing**: NPM publishing on releases
- **Code Formatting**: Automatic Prettier formatting
- **Local Testing**: Comprehensive local testing workflow

All workflows are tested locally and ready for production use.

## 📚 **Documentation**

- [Migration Summary](./MIGRATION_SUMMARY.md) - Complete migration details
- [GitHub Actions](./GITHUB_ACTIONS.md) - Workflow documentation
- [API Documentation](./docs/) - Generated TypeDoc documentation

## 🎯 **Supported Packages**

The tool supports migration of 40+ React-related packages including:

- **Routing**: React Router, React Router DOM
- **State Management**: Redux, React Redux, Redux Toolkit
- **Forms**: React Hook Form, Formik
- **Styling**: Styled Components, Emotion
- **UI Libraries**: React Select, React Modal, React Datepicker
- **Testing**: React Testing Library
- **And many more...**

## 🔧 **Configuration**

### TypeScript Configuration

The project uses TypeScript with strict settings and comprehensive type checking.

### ESLint Configuration

ESLint is configured with TypeScript support and recommended rules.

### Prettier Configuration

Prettier ensures consistent code formatting across the project.

## 🚀 **Deployment**

### NPM Publishing

```bash
# Create a new release on GitHub
# The publish workflow will automatically:
# 1. Run quality checks
# 2. Format code
# 3. Publish to NPM
# 4. Create GitHub release
```

### Documentation Deployment

Documentation is automatically deployed to GitHub Pages on every push to main.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and quality checks
5. Submit a pull request

### Quality Checks

```bash
# Run all quality checks
npm test && npm run lint && npm run type-check && npm run format:check && npm run build
```

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Issues**: [GitHub Issues](https://github.com/imkuldeepahlawat/kdreact-migrate/issues)
- **Documentation**: [API Docs](./docs/)
- **Migration Guide**: [Migration Summary](./MIGRATION_SUMMARY.md)

## 🎉 **Status**

✅ **Complete TypeScript Migration** - All original JavaScript functionality restored  
✅ **Comprehensive Testing** - 40 tests with 100% coverage  
✅ **GitHub Actions** - Full CI/CD pipeline with local testing  
✅ **Documentation** - Complete API documentation with TypeDoc  
✅ **Code Quality** - ESLint, Prettier, TypeScript strict mode  
✅ **Production Ready** - Ready for NPM publishing and deployment
