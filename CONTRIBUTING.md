# Contributing to React Migration CLI

Thank you for your interest in contributing to the React Migration CLI! This document provides guidelines and information for contributors.

## Getting Started

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

## Development Workflow

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

## Coding Standards

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

## Testing Guidelines

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
