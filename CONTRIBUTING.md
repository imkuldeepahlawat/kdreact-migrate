# Contributing to React Migration CLI

Thank you for your interest in contributing to the React Migration CLI! This document provides guidelines and information for contributors.

## 🚀 **Getting Started**

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Docker (for local workflow testing)

### Development Setup

1. **Fork and Clone**

   ```bash
   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/kdreact-migrate.git
   cd kdreact-migrate
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build the Project**

   ```bash
   npm run build
   ```

4. **Run Tests**

   ```bash
   npm test
   ```

5. **Set Up Pre-commit Hooks** (Optional)
   ```bash
   # Install husky for git hooks
   npm run prepare
   ```

## 📋 **Development Workflow**

### 1. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

### 2. Make Your Changes

- Write your code following the coding standards below
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run type-check

# Check formatting
npm run format:check

# Build the project
npm run build
```

### 4. Commit Your Changes

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Examples of good commit messages
git commit -m "feat: add support for React 19 migration"
git commit -m "fix: resolve dependency conflict in package.json"
git commit -m "docs: update README with new CLI options"
git commit -m "test: add unit tests for migration logic"
git commit -m "refactor: improve error handling in CLI"
```

### 5. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with a detailed description of your changes.

## 🎯 **Coding Standards**

### TypeScript Guidelines

- Use strict TypeScript settings
- Provide proper type annotations
- Use interfaces for object shapes
- Prefer `const` over `let` when possible
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Maximum line length: 100 characters
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### File Organization

```
src/
├── index.ts              # Main entry point
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── transformers/         # Code transformation logic
├── validators/           # Validation functions
└── reporters/            # Reporting and output logic
```

### Testing Standards

- Write unit tests for all new functionality
- Aim for 90%+ code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

## 🧪 **Testing Guidelines**

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=cli.test.ts

# Run tests with verbose output
npm test -- --verbose
```

### Writing Tests

```typescript
// Example test structure
describe('ReactMigrationTool', () => {
  describe('migrate()', () => {
    it('should migrate React 16 to React 18', async () => {
      // Arrange
      const tool = new ReactMigrationTool();
      const projectPath = '/path/to/project';

      // Act
      const result = await tool.migrate(projectPath, '18');

      // Assert
      expect(result.success).toBe(true);
      expect(result.changes).toHaveLength(5);
    });

    it('should handle invalid project path', async () => {
      // Arrange
      const tool = new ReactMigrationTool();
      const invalidPath = '/invalid/path';

      // Act & Assert
      await expect(tool.migrate(invalidPath, '18')).rejects.toThrow(
        'Project path does not exist'
      );
    });
  });
});
```

### Test Categories

1. **Unit Tests** (`test/ReactMigrationTool.test.ts`)
   - Test individual functions and methods
   - Mock external dependencies
   - Test edge cases and error conditions

2. **CLI Tests** (`test/cli.test.ts`)
   - Test command-line interface
   - Test argument parsing
   - Test output formatting

3. **Integration Tests** (`test/integration.test.ts`)
   - Test end-to-end functionality
   - Test with real project files
   - Test migration workflows

## 🔧 **Development Tools**

### Available Scripts

```bash
# Development
npm run dev          # Watch mode development
npm run build        # Build TypeScript
npm run clean        # Clean build artifacts

# Testing
npm test             # Run all tests
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
npm run docs:serve   # Serve documentation locally
```

### Local Development

```bash
# Link the package locally for testing
npm link

# Test the CLI locally
react-migrate --help

# Unlink when done
npm unlink
```

## 📝 **Documentation Guidelines**

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter types and descriptions
- Provide usage examples
- Document return values and exceptions

````typescript
/**
 * Migrates a React project to the specified version
 * @param projectPath - Path to the React project directory
 * @param targetVersion - Target React version (17, 18, or 19)
 * @param options - Migration options
 * @returns Promise<MigrationResult> - Migration result with changes and status
 * @throws {Error} When project path is invalid or migration fails
 * @example
 * ```typescript
 * const tool = new ReactMigrationTool();
 * const result = await tool.migrate('/path/to/project', '18');
 * console.log(`Migration ${result.success ? 'succeeded' : 'failed'}`);
 * ```
 */
async migrate(projectPath: string, targetVersion: string, options?: MigrationOptions): Promise<MigrationResult>
````

### README Updates

- Update README.md for new features
- Add usage examples
- Update installation instructions
- Document breaking changes

## 🚀 **Pull Request Guidelines**

### Before Submitting

1. **Ensure Quality**

   ```bash
   # Run all quality checks
   npm run quality-check
   ```

2. **Update Tests**
   - Add tests for new functionality
   - Update existing tests if needed
   - Ensure all tests pass

3. **Update Documentation**
   - Update README.md if needed
   - Add JSDoc comments
   - Update API documentation

### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Code coverage maintained or improved

## Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console errors or warnings

## Screenshots (if applicable)

Add screenshots for UI changes

## Additional Notes

Any additional information or context
```

## 🐛 **Bug Reports**

### Before Reporting

1. Check existing issues
2. Try the latest version
3. Reproduce the issue
4. Check the documentation

### Bug Report Template

```markdown
## Bug Description

Clear and concise description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

What you expected to happen

## Actual Behavior

What actually happened

## Environment

- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 18.0.0]
- React Migration CLI version: [e.g. 1.0.0]
- React project version: [e.g. 16.14.0]

## Additional Context

Any other context about the problem
```

## 💡 **Feature Requests**

### Before Requesting

1. Check if the feature already exists
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template

```markdown
## Feature Description

Clear and concise description of the feature

## Problem Statement

What problem does this feature solve?

## Proposed Solution

How would you like to see this implemented?

## Alternatives Considered

Any alternative solutions you've considered

## Additional Context

Any other context or screenshots
```

## 🤝 **Community Guidelines**

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow project conventions

### Communication

- Use GitHub issues for bug reports
- Use GitHub discussions for questions
- Be clear and concise in communications
- Provide context and examples

## 📚 **Resources**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 🎉 **Recognition**

Contributors will be recognized in:

- README.md contributors section
- GitHub repository contributors
- Release notes
- Project documentation

Thank you for contributing to React Migration CLI! 🚀
