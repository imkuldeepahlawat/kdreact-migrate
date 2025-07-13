# GitHub Actions Workflows

This project includes comprehensive GitHub Actions workflows for CI/CD, documentation deployment, and package publishing.

## Available Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Push to `main`/`develop`, Pull Requests to `main`/`develop`

**Purpose:** Continuous Integration testing

**Features:**

- **Multi-Node Testing**: Tests on Node.js 18.x and 20.x
- **Dependency Installation**: Uses npm cache for faster builds
- **Code Quality Checks**: Linting, type checking, formatting
- **Test Execution**: Full test suite with coverage
- **Build Verification**: Ensures TypeScript compilation works
- **CLI Testing**: Verifies CLI commands work correctly
- **Coverage Reports**: Uploads to Codecov

**Local Testing:**

```bash
# Test the CI workflow locally
act push -W .github/workflows/ci.yml --container-architecture linux/amd64
```

### 2. Documentation Deployment (`.github/workflows/docs.yml`)

**Triggers:** Push to `main`, Manual dispatch

**Purpose:** Generate and deploy documentation to GitHub Pages

**Features:**

- **TypeDoc Generation**: Creates comprehensive API documentation
- **GitHub Pages**: Deploys to `https://username.github.io/repo-name/` (if enabled)
- **Graceful Handling**: Works even if GitHub Pages is not enabled
- **PR Comments**: Automatically comments on PRs with docs URL or setup instructions
- **Manual Trigger**: Can be run manually via GitHub UI

**Setup Required:**

- GitHub Pages must be enabled in repository settings (Settings > Pages > Source: GitHub Actions)
- If not enabled, documentation will still be generated but not deployed

**Local Testing:**

```bash
# Test documentation generation locally
npm run docs
```

### 3. Package Publishing (`.github/workflows/publish.yml`)

**Triggers:** Release published

**Purpose:** Publish package to NPM when a new release is created

**Features:**

- **Quality Gates**: Runs tests and linting before publish
- **Prettier Formatting**: Ensures code is properly formatted
- **Smart Publishing**: Only publishes if package.json changed
- **GitHub Releases**: Creates GitHub release automatically
- **NPM Publishing**: Publishes to NPM registry

**Setup Required:**

- `NPM_TOKEN` secret in repository settings
- Release must be created manually on GitHub

### 4. Code Formatting (`.github/workflows/format.yml`)

**Triggers:** Push to `main`/`develop`, Pull Requests to `main`/`develop`, Manual dispatch

**Purpose:** Ensure consistent code formatting

**Features:**

- **Prettier Formatting**: Automatically formats code
- **Format Checking**: Verifies code is properly formatted
- **Auto-Commit**: Commits formatting changes on push
- **PR Integration**: Works with pull requests

**Local Testing:**

```bash
# Check formatting
npm run format:check

# Format code
npm run format
```

### 5. Local Testing (`.github/workflows/test-local.yml`)

**Triggers:** Manual dispatch only

**Purpose:** Comprehensive local testing workflow

**Features:**

- **Full Pipeline**: Tests entire CI pipeline locally
- **No External Dependencies**: Doesn't require external services
- **Debugging**: Useful for debugging workflow issues

**Local Testing:**

```bash
# Test the local workflow
act workflow_dispatch -W .github/workflows/test-local.yml --container-architecture linux/amd64
```

## Local Development with Act

### Installation

```bash
# Install nektos/act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux
```

### Testing Workflows Locally

```bash
# List available workflows
act --list

# Test a specific workflow
act push -W .github/workflows/ci.yml --container-architecture linux/amd64

# Test with specific event
act workflow_dispatch -W .github/workflows/test-local.yml --container-architecture linux/amd64

# Test with secrets (create .secrets file)
act push --secret-file .secrets
```

### Docker Requirements

- Docker Desktop must be running
- For M-series Macs, use `--container-architecture linux/amd64`
- Ensure sufficient disk space for Docker images

## Required Secrets

### For NPM Publishing

- `NPM_TOKEN`: NPM authentication token

### For GitHub Pages

- No additional secrets required (uses `REPO_TOKEN`)

### For Codecov

- No additional secrets required (uses `REPO_TOKEN`)

## NPM Scripts

The following npm scripts are used by the workflows:

```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.js",
    "lint:fix": "eslint . --ext .ts,.js --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,js,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,js,json,md}\"",
    "docs": "typedoc --out docs src/index.ts"
  }
}
```

## Workflow Matrix

| Workflow   | Trigger        | Purpose         | Local Testable |
| ---------- | -------------- | --------------- | -------------- |
| CI         | Push/PR        | Quality checks  | Yes            |
| Docs       | Push/Manual    | Documentation   | Yes            |
| Publish    | Release        | NPM publishing  | No             |
| Format     | Push/PR/Manual | Code formatting | Yes            |
| Test Local | Manual         | Local testing   | Yes            |

## Troubleshooting

### Common Issues

1. **Docker not running**

   ```bash
   # Start Docker Desktop
   open -a Docker
   ```

2. **M-series Mac issues**

   ```bash
   # Use correct architecture
   act --container-architecture linux/amd64
   ```

3. **Git not found in container**
   - This is expected for local testing
   - Git operations only work in actual GitHub environment

4. **TypeScript version warnings**
   - These are warnings, not errors
   - Workflow will still succeed

### Debugging

```bash
# Verbose output
act -v

# Dry run (list steps without executing)
act -n

# Use specific image
act --container-image node:20-buster-slim
```

## Performance

- **CI Workflow**: ~30 seconds
- **Docs Workflow**: ~20 seconds
- **Format Workflow**: ~15 seconds
- **Local Testing**: ~35 seconds

## Workflow Dependencies

```
Push/PR → CI Workflow
    ↓
Push to main → Docs Workflow
    ↓
Release → Publish Workflow
```

## Best Practices

1. **Always test locally** before pushing
2. **Use act for debugging** workflow issues
3. **Check logs** for detailed error information
4. **Keep workflows focused** on single responsibilities
5. **Use caching** for faster builds
6. **Test on multiple Node versions** for compatibility

## Success Criteria

A successful workflow run should show:

- All tests passing (40/40)
- No linting errors
- TypeScript compilation successful
- CLI commands working
- Documentation generated
- Code properly formatted
