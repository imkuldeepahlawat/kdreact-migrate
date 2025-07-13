#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';

/**
 * Interface for migration options
 */
interface MigrationOptions {
  dryRun?: boolean;
  verbose?: boolean;
  skipDeps?: boolean;
  depsOnly?: boolean;
  files?: string;
  components?: string;
  createBackup?: boolean;
}

/**
 * Interface for backup information
 */
interface BackupInfo {
  id: string;
  timestamp: string;
  path: string;
  description: string;
}

/**
 * CLI tool to migrate React applications to newer versions (17, 18, 19).
 *
 * @remarks
 * This tool analyzes your React project, updates dependencies, transforms code, and provides a migration report.
 */
export class ReactMigrationTool {
  /** The target React version for migration. */
  targetVersion: string = '18';
  /** The root directory of the project being migrated. */
  projectRoot: string = process.cwd();
  /** List of issues found during migration. */
  issues: string[] = [];
  /** List of fixes applied during migration. */
  fixes: string[] = [];
  /** React files found in the project. */
  reactFiles: string[] = [];
  /** Migration options. */
  options: MigrationOptions = {};
  /** Backup information. */
  backupInfo?: BackupInfo;

  /**
   * Starts the migration process.
   * @param targetVersion The React version to migrate to.
   * @param projectPath The path to the React project.
   * @param options Migration options.
   */
  async migrate(
    targetVersion: string,
    projectPath?: string,
    options: MigrationOptions = {}
  ): Promise<void> {
    this.targetVersion = targetVersion;
    this.projectRoot = projectPath !== undefined ? projectPath : process.cwd();
    this.options = options;

    console.log(chalk.blue(`🚀 Starting React ${targetVersion} migration...`));

    try {
      // Create backup if requested
      if (this.options.createBackup && !this.options.dryRun) {
        await this.createBackup();
      }

      await this.analyzeProject();

      if (!this.options.skipDeps) {
        await this.updateDependencies();
      }

      if (!this.options.depsOnly) {
        await this.transformCode();
        await this.updateConfiguration();
      }

      this.generateReport();

      console.log(chalk.green('✅ Migration completed successfully!'));
    } catch (error) {
      console.error(
        chalk.red('❌ Migration failed:'),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  }

  /**
   * Creates a backup of the project before migration.
   */
  async createBackup(): Promise<void> {
    console.log(chalk.yellow('💾 Creating backup...'));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    const backupPath = path.join(this.projectRoot, '..', backupId);

    try {
      // Create backup directory
      await fs.promises.mkdir(backupPath, { recursive: true });

      // Copy project files to backup
      await this.copyDirectory(this.projectRoot, backupPath);

      this.backupInfo = {
        id: backupId,
        timestamp: new Date().toISOString(),
        path: backupPath,
        description: `React ${this.targetVersion} migration backup`,
      };

      this.fixes.push(`Created backup: ${backupId}`);
      console.log(chalk.green(`✅ Backup created: ${backupPath}`));
    } catch (error) {
      this.issues.push(
        'Failed to create backup: ' +
          (error instanceof Error ? error.message : String(error))
      );
      console.log(
        chalk.yellow('⚠️ Backup creation failed, continuing without backup')
      );
    }
  }

  /**
   * Copies a directory recursively.
   * @param src Source directory path.
   * @param dest Destination directory path.
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // Skip node_modules and backup directories
      if (entry.name === 'node_modules' || entry.name.startsWith('backup-')) {
        continue;
      }

      if (entry.isDirectory()) {
        await fs.promises.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Rolls back to a specific backup.
   * @param backupId The backup ID to rollback to.
   */
  async rollback(backupId: string): Promise<void> {
    console.log(chalk.yellow(`🔄 Rolling back to backup: ${backupId}...`));

    const backupPath = path.join(this.projectRoot, '..', backupId);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup ${backupId} not found at ${backupPath}`);
    }

    try {
      // Remove current project files (except node_modules)
      const entries = await fs.promises.readdir(this.projectRoot, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (entry.name !== 'node_modules') {
          const itemPath = path.join(this.projectRoot, entry.name);
          if (entry.isDirectory()) {
            await fs.promises.rm(itemPath, { recursive: true, force: true });
          } else {
            await fs.promises.unlink(itemPath);
          }
        }
      }

      // Restore from backup
      await this.copyDirectory(backupPath, this.projectRoot);

      console.log(
        chalk.green(`✅ Successfully rolled back to backup: ${backupId}`)
      );
    } catch (error) {
      throw new Error(
        'Rollback failed: ' +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  /**
   * Lists available backups.
   */
  listBackups(): BackupInfo[] {
    const parentDir = path.dirname(this.projectRoot);
    const entries = fs.readdirSync(parentDir, { withFileTypes: true });

    const backups: BackupInfo[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('backup-')) {
        const backupPath = path.join(parentDir, entry.name);
        const stats = fs.statSync(backupPath);

        backups.push({
          id: entry.name,
          timestamp: stats.mtime.toISOString(),
          path: backupPath,
          description: `Backup created on ${stats.mtime.toLocaleDateString()}`,
        });
      }
    }

    return backups.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Analyzes the project structure and finds React files.
   */
  async analyzeProject(): Promise<void> {
    console.log(chalk.yellow('🔍 Analyzing project structure...'));

    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found. Are you in a React project?');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentReactVersion =
      packageJson.dependencies?.react || packageJson.devDependencies?.react;

    if (!currentReactVersion) {
      throw new Error('React not found in dependencies');
    }

    console.log(chalk.blue(`Current React version: ${currentReactVersion}`));
    console.log(chalk.blue(`Target React version: ${this.targetVersion}`));

    this.findReactFiles();
  }

  /**
   * Finds React files in the project.
   */
  findReactFiles(): void {
    const srcPath = path.join(this.projectRoot, 'src');
    if (!fs.existsSync(srcPath)) {
      this.issues.push('src directory not found');
      return;
    }

    this.reactFiles = this.getReactFiles(srcPath);
    console.log(chalk.blue(`Found ${this.reactFiles.length} React files`));
  }

  /**
   * Recursively gets React files from a directory.
   * @param dir The directory to search.
   * @returns Array of React file paths.
   */
  getReactFiles(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith('.') &&
        item !== 'node_modules'
      ) {
        files.push(...this.getReactFiles(fullPath));
      } else if (stat.isFile() && /\.(jsx?|tsx?)$/.test(item)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Updates dependencies in package.json.
   */
  async updateDependencies(): Promise<void> {
    console.log(chalk.yellow('📦 Analyzing and updating dependencies...'));

    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Analyze peer dependencies and conflicts
    await this.analyzePeerDependencies(packageJson);

    // Update React and React-DOM
    if (packageJson.dependencies?.react) {
      packageJson.dependencies.react = `^${this.targetVersion}`;
    }
    if (packageJson.dependencies?.['react-dom']) {
      packageJson.dependencies['react-dom'] = `^${this.targetVersion}`;
    }

    // Update React-related packages
    const reactPackages = this.getReactRelatedPackages();

    for (const [pkg, version] of Object.entries(reactPackages)) {
      if (
        packageJson.dependencies?.[pkg] ||
        packageJson.devDependencies?.[pkg]
      ) {
        if (packageJson.dependencies?.[pkg]) {
          packageJson.dependencies[pkg] = version;
        }
        if (packageJson.devDependencies?.[pkg]) {
          packageJson.devDependencies[pkg] = version;
        }
      }
    }

    if (!this.options.dryRun) {
      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.fixes.push('Updated package.json with new React versions');

      // Install dependencies
      try {
        console.log(chalk.blue('Installing dependencies...'));
        execSync('npm install', { cwd: this.projectRoot, stdio: 'inherit' });
        this.fixes.push('Installed updated dependencies');
      } catch (error) {
        this.issues.push(
          'Failed to install dependencies: ' +
            (error instanceof Error ? error.message : String(error))
        );
      }
    } else {
      this.fixes.push(
        'Would update package.json with new React versions (dry run)'
      );
    }
  }

  /**
   * Analyzes peer dependencies for potential conflicts.
   * @param packageJson The package.json object.
   */
  async analyzePeerDependencies(packageJson: any): Promise<void> {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const reactVersion = `^${this.targetVersion}`;
    const conflicts: string[] = [];

    // Check for React version conflicts
    for (const [pkg] of Object.entries(allDeps)) {
      if (pkg.includes('react') && pkg !== 'react' && pkg !== 'react-dom') {
        // Check if package has peer dependency on React
        try {
          const pkgPath = path.join(
            this.projectRoot,
            'node_modules',
            pkg,
            'package.json'
          );
          if (fs.existsSync(pkgPath)) {
            const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkgJson.peerDependencies?.react) {
              const peerReactVersion = pkgJson.peerDependencies.react;
              if (!this.isVersionCompatible(reactVersion, peerReactVersion)) {
                conflicts.push(
                  `${pkg} requires React ${peerReactVersion} but we're upgrading to ${reactVersion}`
                );
              }
            }
          }
        } catch (error) {
          // Ignore errors for packages not installed
        }
      }
    }

    if (conflicts.length > 0) {
      this.issues.push('Peer dependency conflicts detected:');
      conflicts.forEach(conflict => {
        this.issues.push(`  - ${conflict}`);
      });
    }
  }

  /**
   * Checks if two version ranges are compatible.
   * @param version1 First version range.
   * @param version2 Second version range.
   * @returns True if versions are compatible.
   */
  private isVersionCompatible(version1: string, version2: string): boolean {
    // Simple compatibility check - can be enhanced with semver library
    const v1 = version1.replace(/[\^~]/, '');
    const v2 = version2.replace(/[\^~]/, '');

    // For React versions, major version should match
    const major1 = parseInt(v1.split('.')[0] || '0');
    const major2 = parseInt(v2.split('.')[0] || '0');

    return major1 === major2;
  }

  /**
   * Gets React-related packages with version mappings.
   * @returns Object mapping package names to versions.
   */
  getReactRelatedPackages(): Record<string, string> {
    const packages: Record<string, string> = {
      '@testing-library/react': this.getTestingLibraryVersion(),
      '@types/react': this.getTypesVersion(),
      '@types/react-dom': this.getTypesVersion(),
      'react-router-dom': this.getReactRouterVersion(),
      'react-router': this.getReactRouterVersion(),
      'react-scripts': this.getReactScriptsVersion(),
      'react-redux': this.getReactReduxVersion(),
      '@reduxjs/toolkit': this.getReduxToolkitVersion(),
      'react-hook-form': this.getReactHookFormVersion(),
      formik: this.getFormikVersion(),
      'styled-components': this.getStyledComponentsVersion(),
      '@emotion/react': this.getEmotionVersion(),
      '@emotion/styled': this.getEmotionVersion(),
      'react-transition-group': this.getReactTransitionGroupVersion(),
      'react-select': this.getReactSelectVersion(),
      'react-datepicker': this.getReactDatepickerVersion(),
      'react-modal': this.getReactModalVersion(),
      'react-helmet': this.getReactHelmetVersion(),
      'react-helmet-async': this.getReactHelmetAsyncVersion(),
      'react-virtualized': this.getReactVirtualizedVersion(),
      'react-window': this.getReactWindowVersion(),
      'react-dnd': this.getReactDndVersion(),
      'react-beautiful-dnd': this.getReactBeautifulDndVersion(),
      'react-dropzone': this.getReactDropzoneVersion(),
      'react-table': this.getReactTableVersion(),
      '@tanstack/react-table': this.getTanstackReactTableVersion(),
      'react-query': this.getReactQueryVersion(),
      '@tanstack/react-query': this.getTanstackReactQueryVersion(),
      'react-spring': this.getReactSpringVersion(),
      'framer-motion': this.getFramerMotionVersion(),
      'react-intl': this.getReactIntlVersion(),
      'react-i18next': this.getReactI18nextVersion(),
      next: this.getNextVersion(),
      gatsby: this.getGatsbyVersion(),
      'react-hot-toast': this.getReactHotToastVersion(),
      'react-toastify': this.getReactToastifyVersion(),
      'react-icons': this.getReactIconsVersion(),
      'react-use': this.getReactUseVersion(),
      'react-error-boundary': this.getReactErrorBoundaryVersion(),
      'react-loadable': this.getReactLoadableVersion(),
      '@loadable/component': this.getLoadableComponentVersion(),
      'react-lazyload': this.getReactLazyloadVersion(),
      'react-intersection-observer': this.getReactIntersectionObserverVersion(),
    };

    return packages;
  }

  /**
   * Transforms React code files.
   */
  async transformCode(): Promise<void> {
    console.log(chalk.yellow('🔄 Transforming code...'));

    let filesToTransform = this.reactFiles;

    // Filter by specific files if provided
    if (this.options.files) {
      const targetFiles = this.options.files.split(',').map(f => f.trim());
      filesToTransform = this.reactFiles.filter(filePath => {
        const fileName = path.basename(filePath);
        return targetFiles.some(
          target => fileName.includes(target) || filePath.includes(target)
        );
      });
      console.log(
        chalk.blue(
          `📁 Transforming ${filesToTransform.length} specific files...`
        )
      );
    }

    // Filter by specific components if provided
    if (this.options.components) {
      const targetComponents = this.options.components
        .split(',')
        .map(c => c.trim());
      filesToTransform = filesToTransform.filter(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        return targetComponents.some(
          component =>
            content.includes(`class ${component}`) ||
            content.includes(`function ${component}`) ||
            content.includes(`const ${component}`)
        );
      });
      console.log(
        chalk.blue(
          `🧩 Transforming ${filesToTransform.length} component files...`
        )
      );
    }

    for (const filePath of filesToTransform) {
      await this.transformFile(filePath);
    }
  }

  /**
   * Transforms a single React file.
   * @param filePath Path to the file to transform.
   */
  async transformFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    let transformedContent = content;
    const fileName = path.basename(filePath);

    // Transform ReactDOM.render to createRoot (React 18+)
    if (this.targetVersion >= '18') {
      transformedContent = this.transformReactDOMRender(
        transformedContent,
        fileName
      );
    }

    // Transform deprecated lifecycle methods
    transformedContent = this.transformLifecycleMethods(
      transformedContent,
      fileName
    );

    // Transform event handlers
    transformedContent = this.transformEventHandlers(
      transformedContent,
      fileName
    );

    // Transform PropTypes imports
    transformedContent = this.transformPropTypes(transformedContent, fileName);

    // Transform React.FC usage
    transformedContent = this.transformReactFC(transformedContent, fileName);

    // Transform class components to functional components
    transformedContent = this.transformClassToFunctional(
      transformedContent,
      fileName
    );

    // Write transformed content if changed
    if (transformedContent !== content && !this.options.dryRun) {
      fs.writeFileSync(filePath, transformedContent);
      this.fixes.push(`Transformed ${fileName}`);
    } else if (transformedContent !== content) {
      this.fixes.push(`Would transform ${fileName} (dry run)`);
    }
  }

  /**
   * Transforms ReactDOM.render to createRoot API.
   * @param content File content to transform.
   * @param fileName Name of the file being transformed.
   * @returns Transformed content.
   */
  transformReactDOMRender(content: string, fileName: string): string {
    const renderRegex =
      /ReactDOM\.render\(\s*(<[^>]+>[\s\S]*?<\/[^>]+>|<[^>]+\s*\/>),\s*([^)]+)\)/g;

    if (renderRegex.test(content)) {
      let transformed = content;

      // Add createRoot import if ReactDOM is imported
      if (content.includes("import ReactDOM from 'react-dom'")) {
        transformed = transformed.replace(
          "import ReactDOM from 'react-dom'",
          "import { createRoot } from 'react-dom/client'"
        );
      } else if (content.includes("import { render } from 'react-dom'")) {
        transformed = transformed.replace(
          "import { render } from 'react-dom'",
          "import { createRoot } from 'react-dom/client'"
        );
      }

      // Transform render calls
      transformed = transformed.replace(
        renderRegex,
        (_match, element, container) => {
          return `const root = createRoot(${container});\nroot.render(${element})`;
        }
      );

      this.fixes.push(`${fileName}: Updated ReactDOM.render to createRoot API`);
      return transformed;
    }

    return content;
  }

  /**
   * Transforms deprecated lifecycle methods.
   * @param content File content to transform.
   * @param fileName Name of the file being transformed.
   * @returns Transformed content.
   */
  transformLifecycleMethods(content: string, fileName: string): string {
    let transformed = content;

    // Transform componentWillMount
    if (content.includes('componentWillMount')) {
      transformed = transformed.replace(
        /componentWillMount/g,
        'componentDidMount'
      );
      this.fixes.push(
        `${fileName}: Replaced componentWillMount with componentDidMount`
      );
    }

    // Transform componentWillReceiveProps
    if (content.includes('componentWillReceiveProps')) {
      transformed = transformed.replace(
        /componentWillReceiveProps\s*\([^)]+\)/g,
        'componentDidUpdate(prevProps)'
      );
      this.fixes.push(
        `${fileName}: Replaced componentWillReceiveProps with componentDidUpdate`
      );
    }

    // Transform componentWillUpdate
    if (content.includes('componentWillUpdate')) {
      transformed = transformed.replace(
        /componentWillUpdate/g,
        'componentDidUpdate'
      );
      this.fixes.push(
        `${fileName}: Replaced componentWillUpdate with componentDidUpdate`
      );
    }

    return transformed;
  }

  /**
   * Transforms event handlers for React 17+.
   * @param content File content to transform.
   * @param fileName Name of the file being transformed.
   * @returns Transformed content.
   */
  transformEventHandlers(content: string, fileName: string): string {
    const transformed = content;

    // Transform SyntheticEvent imports if present
    if (content.includes('SyntheticEvent')) {
      // React 17+ uses native events
      this.issues.push(
        `${fileName}: Review SyntheticEvent usage - React 17+ uses native events`
      );
    }

    return transformed;
  }

  /**
   * Transforms PropTypes imports.
   * @param content File content to transform.
   * @param fileName Name of the file being transformed.
   * @returns Transformed content.
   */
  transformPropTypes(content: string, fileName: string): string {
    let transformed = content;

    // Transform React.PropTypes to prop-types package
    if (content.includes('React.PropTypes')) {
      // Add prop-types import if not present
      if (!content.includes("import PropTypes from 'prop-types'")) {
        const importMatch = content.match(/import React[^;]+;/);
        if (importMatch) {
          transformed = transformed.replace(
            importMatch[0],
            importMatch[0] + "\nimport PropTypes from 'prop-types';"
          );
        }
      }

      // Replace React.PropTypes with PropTypes
      transformed = transformed.replace(/React\.PropTypes/g, 'PropTypes');
      this.fixes.push(
        `${fileName}: Migrated React.PropTypes to prop-types package`
      );
    }

    return transformed;
  }

  /**
   * Transforms React.FC usage.
   * @param content File content to transform.
   * @param fileName Name of the file being transformed.
   * @returns Transformed content.
   */
  transformReactFC(content: string, fileName: string): string {
    const transformed = content;

    // Transform React.FC to more explicit typing
    if (
      content.includes('React.FC') ||
      content.includes('React.FunctionComponent')
    ) {
      this.issues.push(
        `${fileName}: Consider replacing React.FC with explicit props typing`
      );
    }

    return transformed;
  }

  /**
   * Transforms simple class components to functional components.
   * @param content File content to transform.
   * @param fileName Name of the file being transformed.
   * @returns Transformed content.
   */
  transformClassToFunctional(content: string, fileName: string): string {
    let transformed = content;

    // Simple class component pattern matching
    const classComponentRegex =
      /class\s+(\w+)\s+extends\s+React\.Component\s*{([\s\S]*?)}/g;
    const stateRegex = /this\.state\s*=\s*({[^}]+})/g;
    const setStateRegex = /this\.setState\(/g;
    const propsRegex = /this\.props\./g;

    // Check if this is a simple class component that can be converted
    if (classComponentRegex.test(transformed)) {
      // Reset regex
      classComponentRegex.lastIndex = 0;

      transformed = transformed.replace(
        classComponentRegex,
        (_match: string, className: string, classBody: string) => {
          // Convert state to useState
          let functionalBody = classBody.replace(
            stateRegex,
            (_stateMatch: string, stateObj: string) => {
              return `const [state, setState] = useState(${stateObj});`;
            }
          );

          // Convert setState calls
          functionalBody = functionalBody.replace(setStateRegex, 'setState(');

          // Convert props references
          functionalBody = functionalBody.replace(propsRegex, 'props.');

          // Convert render method to return statement
          const renderRegex =
            /render\s*\(\s*\)\s*{([\s\S]*?)return\s*([\s\S]*?);/g;
          functionalBody = functionalBody.replace(
            renderRegex,
            (
              _renderMatch: string,
              beforeReturn: string,
              returnValue: string
            ) => {
              return `${beforeReturn}return ${returnValue};`;
            }
          );

          // Create functional component
          return `const ${className} = (props) => {
  ${functionalBody}
};`;
        }
      );

      // Add useState import if needed
      if (
        transformed.includes('useState') &&
        !transformed.includes('import { useState }')
      ) {
        const importMatch = transformed.match(/import React[^;]+;/);
        if (importMatch) {
          transformed = transformed.replace(
            importMatch[0],
            importMatch[0] + "\nimport { useState } from 'react';"
          );
        }
      }

      this.fixes.push(
        `${fileName}: Converted class component to functional component`
      );
    }

    return transformed;
  }

  /**
   * Updates configuration files.
   */
  async updateConfiguration(): Promise<void> {
    console.log(chalk.yellow('⚙️ Updating configuration files...'));

    // Update TypeScript config if present
    const tsConfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      this.updateTsConfig(tsConfigPath);
    }

    // Update Jest config if present
    const jestConfigPath = path.join(this.projectRoot, 'jest.config.js');
    if (fs.existsSync(jestConfigPath)) {
      this.updateJestConfig(jestConfigPath);
    }

    // Update ESLint config if present
    const eslintConfigPath = path.join(this.projectRoot, '.eslintrc.js');
    if (fs.existsSync(eslintConfigPath)) {
      this.updateEslintConfig(eslintConfigPath);
    }

    // Check for babel config
    this.checkBabelConfig();

    // Check for webpack config
    this.checkWebpackConfig();
  }

  /**
   * Updates TypeScript configuration.
   * @param tsConfigPath Path to tsconfig.json.
   */
  updateTsConfig(tsConfigPath: string): void {
    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

      // Update JSX transform for React 17+
      if (this.targetVersion >= '17') {
        if (!tsConfig.compilerOptions) {
          tsConfig.compilerOptions = {};
        }
        tsConfig.compilerOptions.jsx = 'react-jsx';
        this.fixes.push('Updated tsconfig.json with new JSX transform');
      }

      if (!this.options.dryRun) {
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      }
    } catch (error) {
      this.issues.push(
        'Failed to update tsconfig.json: ' +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  /**
   * Updates Jest configuration.
   * @param jestConfigPath Path to jest.config.js.
   */
  updateJestConfig(jestConfigPath: string): void {
    try {
      let jestConfig: any;
      const jestConfigContent = fs.readFileSync(jestConfigPath, 'utf8');

      // Try to parse as JSON first, then as CommonJS
      try {
        jestConfig = JSON.parse(jestConfigContent);
      } catch {
        // If JSON parsing fails, try to evaluate as CommonJS
        jestConfig = eval(
          `(${jestConfigContent.replace('module.exports = ', '')})`
        );
      }

      let updated = false;

      // Update for React 18+ testing setup
      if (this.targetVersion >= '18') {
        if (!jestConfig.setupFilesAfterEnv) {
          jestConfig.setupFilesAfterEnv = ['<rootDir>/src/setupTests.js'];
          updated = true;
        }

        if (!jestConfig.testEnvironment) {
          jestConfig.testEnvironment = 'jsdom';
          updated = true;
        }

        // Add React 18 specific setup
        if (!jestConfig.globals) {
          jestConfig.globals = {};
        }
        jestConfig.globals['ts-jest'] = {
          tsconfig: {
            jsx: 'react-jsx',
          },
        };
        updated = true;
      }

      if (updated && !this.options.dryRun) {
        const updatedContent = `module.exports = ${JSON.stringify(jestConfig, null, 2)};`;
        fs.writeFileSync(jestConfigPath, updatedContent);
        this.fixes.push('Updated Jest configuration for React compatibility');
      } else if (updated) {
        this.fixes.push('Would update Jest configuration (dry run)');
      }
    } catch (error) {
      this.issues.push(
        'Failed to update Jest configuration: ' +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  /**
   * Updates ESLint configuration.
   * @param eslintConfigPath Path to .eslintrc.js.
   */
  updateEslintConfig(eslintConfigPath: string): void {
    try {
      let eslintConfig: any;
      const eslintContent = fs.readFileSync(eslintConfigPath, 'utf8');

      // Try to parse as JSON first, then as CommonJS
      try {
        eslintConfig = JSON.parse(eslintContent);
      } catch {
        // If JSON parsing fails, try to evaluate as CommonJS
        eslintConfig = eval(
          `(${eslintContent.replace('module.exports = ', '')})`
        );
      }

      let updated = false;

      // Ensure React plugin is present
      if (!eslintConfig.plugins || !eslintConfig.plugins.includes('react')) {
        if (!eslintConfig.plugins) eslintConfig.plugins = [];
        eslintConfig.plugins.push('react');
        updated = true;
      }

      // Update React settings
      if (!eslintConfig.settings) {
        eslintConfig.settings = {};
      }
      if (!eslintConfig.settings.react) {
        eslintConfig.settings.react = {};
      }
      eslintConfig.settings.react.version = this.targetVersion;
      updated = true;

      // Update rules for React 17+ JSX transform
      if (this.targetVersion >= '17') {
        if (!eslintConfig.rules) {
          eslintConfig.rules = {};
        }

        // Disable rules that are no longer needed with new JSX transform
        eslintConfig.rules['react/jsx-uses-react'] = 'off';
        eslintConfig.rules['react/react-in-jsx-scope'] = 'off';
        updated = true;
      }

      if (updated && !this.options.dryRun) {
        const updatedContent = `module.exports = ${JSON.stringify(eslintConfig, null, 2)};`;
        fs.writeFileSync(eslintConfigPath, updatedContent);
        this.fixes.push('Updated ESLint configuration for React compatibility');
      } else if (updated) {
        this.fixes.push('Would update ESLint configuration (dry run)');
      }
    } catch (error) {
      this.issues.push(
        'Failed to update ESLint configuration: ' +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  /**
   * Checks Babel configuration.
   */
  checkBabelConfig(): void {
    const babelConfigs = [
      '.babelrc',
      '.babelrc.js',
      '.babelrc.json',
      'babel.config.js',
      'babel.config.json',
    ];

    const babelConfigPath = babelConfigs
      .map(config => path.join(this.projectRoot, config))
      .find(configPath => fs.existsSync(configPath));

    if (babelConfigPath) {
      if (this.targetVersion >= '17') {
        this.issues.push(
          'Update Babel React preset to use automatic JSX runtime: {"runtime": "automatic"}'
        );
      }
    }
  }

  /**
   * Checks Webpack configuration.
   */
  checkWebpackConfig(): void {
    const webpackConfigs = [
      'webpack.config.js',
      'webpack.config.ts',
      'config/webpack.config.js',
    ];

    const webpackConfigPath = webpackConfigs
      .map(config => path.join(this.projectRoot, config))
      .find(configPath => fs.existsSync(configPath));

    if (webpackConfigPath) {
      this.issues.push('Review webpack configuration for React compatibility');

      if (this.targetVersion >= '18') {
        this.issues.push(
          'Ensure webpack supports React 18 features like Suspense and concurrent rendering'
        );
      }
    }
  }

  /**
   * Generates the migration report.
   */
  generateReport(): void {
    console.log(chalk.green('\n📊 Migration Report\n'));

    console.log(chalk.blue('✅ Fixes Applied:'));
    if (this.fixes.length === 0) {
      console.log(chalk.gray('  No automatic fixes were applied'));
    } else {
      this.fixes.forEach(fix => console.log(chalk.green('  ✓ ' + fix)));
    }

    if (this.issues.length > 0) {
      console.log(chalk.yellow('\n⚠️  Manual Review Required:'));
      this.issues.forEach(issue => console.log(chalk.yellow('  ⚠ ' + issue)));
    }

    console.log(chalk.blue('\n📋 Next Steps:'));
    console.log('  1. Run your tests to ensure everything works');
    console.log('  2. Review the manual items listed above');
    console.log('  3. Update any custom hooks or components');
    console.log(
      '  4. Check for deprecated lifecycle methods in class components'
    );
    console.log('  5. Verify third-party library compatibility');

    if (this.targetVersion >= '17') {
      console.log(
        '  6. Remove React imports from JSX files (optional with new transform)'
      );
    }

    if (this.targetVersion >= '18') {
      console.log('  7. Review Strict Mode behavior changes');
      console.log('  8. Consider implementing Suspense boundaries');
      console.log('  9. Test React 18 Concurrent Features if used');
      console.log('  10. Update testing setup for React 18 changes');
    }

    if (this.targetVersion >= '19') {
      console.log('  11. Review React 19 specific changes and new features');
      console.log('  12. Update component patterns for latest best practices');
    }

    console.log(chalk.blue('\n🔗 Useful Resources:'));
    console.log(
      `  - React ${this.targetVersion} Migration Guide: https://react.dev/blog`
    );
    if (this.targetVersion >= '18') {
      console.log(
        '  - React 18 Upgrade Guide: https://react.dev/blog/2022/03/08/react-18-upgrade-guide'
      );
    }
    console.log(
      '  - Breaking Changes: Check the React changelog for your version'
    );

    console.log(chalk.green('\n🎉 Migration analysis completed!'));
    console.log(
      chalk.blue(
        '💡 Tip: Run this tool again after making manual changes to verify compatibility.'
      )
    );
  }

  // Version mapping methods
  getTestingLibraryVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^11.0.0',
      '18': '^13.0.0',
      '19': '^14.0.0',
    };
    return versionMap[this.targetVersion] || '^13.0.0';
  }

  getTypesVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^17.0.0',
      '18': '^18.0.0',
      '19': '^18.0.0',
    };
    return versionMap[this.targetVersion] || '^18.0.0';
  }

  getReactRouterVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^6.0.0',
      '18': '^6.8.0',
      '19': '^6.20.0',
    };
    return versionMap[this.targetVersion] || '^6.8.0';
  }

  getReactScriptsVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^5.0.0',
      '18': '^5.0.1',
      '19': '^5.0.1',
    };
    return versionMap[this.targetVersion] || '^5.0.1';
  }

  getReactReduxVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^8.0.0',
      '18': '^8.0.5',
      '19': '^9.0.0',
    };
    return versionMap[this.targetVersion] || '^8.0.5';
  }

  getReduxToolkitVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^1.8.0',
      '18': '^1.9.0',
      '19': '^2.0.0',
    };
    return versionMap[this.targetVersion] || '^1.9.0';
  }

  getReactHookFormVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^7.40.0',
      '18': '^7.45.0',
      '19': '^7.48.0',
    };
    return versionMap[this.targetVersion] || '^7.45.0';
  }

  getFormikVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^2.2.9',
      '18': '^2.4.0',
      '19': '^2.4.5',
    };
    return versionMap[this.targetVersion] || '^2.4.0';
  }

  getStyledComponentsVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^5.3.0',
      '18': '^6.0.0',
      '19': '^6.1.0',
    };
    return versionMap[this.targetVersion] || '^6.0.0';
  }

  getEmotionVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^11.10.0',
      '18': '^11.11.0',
      '19': '^11.11.0',
    };
    return versionMap[this.targetVersion] || '^11.11.0';
  }

  getReactTransitionGroupVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^4.4.2',
      '18': '^4.4.5',
      '19': '^4.4.5',
    };
    return versionMap[this.targetVersion] || '^4.4.5';
  }

  getReactSelectVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^5.4.0',
      '18': '^5.7.0',
      '19': '^5.8.0',
    };
    return versionMap[this.targetVersion] || '^5.7.0';
  }

  getReactDatepickerVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^4.8.0',
      '18': '^4.16.0',
      '19': '^4.20.0',
    };
    return versionMap[this.targetVersion] || '^4.16.0';
  }

  getReactModalVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^3.15.0',
      '18': '^3.16.0',
      '19': '^3.16.0',
    };
    return versionMap[this.targetVersion] || '^3.16.0';
  }

  getReactHelmetVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^6.1.0',
      '18': '^6.1.0',
      '19': '^6.1.0',
    };
    return versionMap[this.targetVersion] || '^6.1.0';
  }

  getReactHelmetAsyncVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^1.3.0',
      '18': '^1.3.0',
      '19': '^2.0.0',
    };
    return versionMap[this.targetVersion] || '^1.3.0';
  }

  getReactVirtualizedVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^9.22.3',
      '18': '^9.22.3',
      '19': '^9.22.3',
    };
    return versionMap[this.targetVersion] || '^9.22.3';
  }

  getReactWindowVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^1.8.6',
      '18': '^1.8.8',
      '19': '^1.8.8',
    };
    return versionMap[this.targetVersion] || '^1.8.8';
  }

  getReactDndVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^16.0.0',
      '18': '^16.0.1',
      '19': '^16.0.1',
    };
    return versionMap[this.targetVersion] || '^16.0.1';
  }

  getReactBeautifulDndVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^13.1.0',
      '18': '^13.1.1',
      '19': '^13.1.1',
    };
    return versionMap[this.targetVersion] || '^13.1.1';
  }

  getReactDropzoneVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^14.2.0',
      '18': '^14.2.3',
      '19': '^14.2.3',
    };
    return versionMap[this.targetVersion] || '^14.2.3';
  }

  getReactTableVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^7.8.0',
      '18': '^7.8.0',
      '19': '^7.8.0',
    };
    return versionMap[this.targetVersion] || '^7.8.0';
  }

  getTanstackReactTableVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^8.9.0',
      '18': '^8.10.0',
      '19': '^8.11.0',
    };
    return versionMap[this.targetVersion] || '^8.10.0';
  }

  getReactQueryVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^3.39.0',
      '18': '^3.39.0',
      '19': '^3.39.0',
    };
    return versionMap[this.targetVersion] || '^3.39.0';
  }

  getTanstackReactQueryVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^4.29.0',
      '18': '^4.36.0',
      '19': '^5.0.0',
    };
    return versionMap[this.targetVersion] || '^4.36.0';
  }

  getReactSpringVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^9.7.0',
      '18': '^9.7.0',
      '19': '^9.7.0',
    };
    return versionMap[this.targetVersion] || '^9.7.0';
  }

  getFramerMotionVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^10.0.0',
      '18': '^10.16.0',
      '19': '^11.0.0',
    };
    return versionMap[this.targetVersion] || '^10.16.0';
  }

  getReactIntlVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^6.4.0',
      '18': '^6.5.0',
      '19': '^6.6.0',
    };
    return versionMap[this.targetVersion] || '^6.5.0';
  }

  getReactI18nextVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^12.3.0',
      '18': '^13.5.0',
      '19': '^14.0.0',
    };
    return versionMap[this.targetVersion] || '^13.5.0';
  }

  getNextVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^13.0.0',
      '18': '^14.0.0',
      '19': '^14.0.0',
    };
    return versionMap[this.targetVersion] || '^14.0.0';
  }

  getGatsbyVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^5.0.0',
      '18': '^5.12.0',
      '19': '^5.12.0',
    };
    return versionMap[this.targetVersion] || '^5.12.0';
  }

  getReactHotToastVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^2.4.0',
      '18': '^2.4.1',
      '19': '^2.4.1',
    };
    return versionMap[this.targetVersion] || '^2.4.1';
  }

  getReactToastifyVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^9.1.0',
      '18': '^9.1.3',
      '19': '^10.0.0',
    };
    return versionMap[this.targetVersion] || '^9.1.3';
  }

  getReactIconsVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^4.10.0',
      '18': '^4.12.0',
      '19': '^5.0.0',
    };
    return versionMap[this.targetVersion] || '^4.12.0';
  }

  getReactUseVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^17.4.0',
      '18': '^17.5.0',
      '19': '^17.5.0',
    };
    return versionMap[this.targetVersion] || '^17.5.0';
  }

  getReactErrorBoundaryVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^4.0.0',
      '18': '^4.0.11',
      '19': '^4.0.11',
    };
    return versionMap[this.targetVersion] || '^4.0.11';
  }

  getReactLoadableVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^5.5.0',
      '18': '^5.5.0',
      '19': '^5.5.0',
    };
    return versionMap[this.targetVersion] || '^5.5.0';
  }

  getLoadableComponentVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^5.15.0',
      '18': '^5.16.0',
      '19': '^5.16.0',
    };
    return versionMap[this.targetVersion] || '^5.16.0';
  }

  getReactLazyloadVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^3.2.0',
      '18': '^3.2.0',
      '19': '^3.2.0',
    };
    return versionMap[this.targetVersion] || '^3.2.0';
  }

  getReactIntersectionObserverVersion(): string {
    const versionMap: Record<string, string> = {
      '17': '^9.4.0',
      '18': '^9.5.0',
      '19': '^9.5.0',
    };
    return versionMap[this.targetVersion] || '^9.5.0';
  }
}

// CLI Setup
const program = new Command();

program
  .name('react-migrate')
  .description('CLI tool to migrate React applications to newer versions')
  .version('1.0.0');

program
  .argument('[target-version]', 'Target React version (17, 18, 19)', '18')
  .argument('[project-path]', 'Path to React project', process.cwd())
  .option('-d, --dry-run', 'Show what would be changed without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .option('--skip-deps', 'Skip dependency analysis and updates')
  .option('--deps-only', 'Only analyze and update dependencies')
  .option('--create-backup', 'Create a backup of the project before migration')
  .option('--files <files>', 'Specific files to migrate (comma-separated)')
  .option(
    '--components <components>',
    'Specific components to migrate (comma-separated)'
  )
  .action(
    async (
      targetVersion: string,
      projectPath: string,
      options: MigrationOptions
    ) => {
      if (!['17', '18', '19'].includes(targetVersion)) {
        console.error(
          chalk.red('❌ Unsupported target version. Use 17, 18, or 19')
        );
        process.exit(1);
      }

      const migrator = new ReactMigrationTool();

      if (options.dryRun) {
        console.log(
          chalk.yellow(
            '🔍 Running in dry-run mode (no changes will be made)...'
          )
        );
      }

      if (options.depsOnly) {
        console.log(chalk.blue('📦 Analyzing dependencies only...'));
      }

      if (options.skipDeps) {
        console.log(chalk.blue('⏭️ Skipping dependency analysis...'));
      }

      if (options.createBackup) {
        console.log(chalk.yellow('💾 Creating backup...'));
      }

      await migrator.migrate(targetVersion, projectPath, options);
    }
  );

// Add a command to check compatibility without migrating
program
  .command('check')
  .description('Check React compatibility without making changes')
  .argument('[target-version]', 'Target React version to check against', '18')
  .argument('[project-path]', 'Path to React project', process.cwd())
  .action(async (targetVersion: string, projectPath: string) => {
    console.log(
      chalk.blue(`🔍 Checking React ${targetVersion} compatibility...`)
    );

    const migrator = new ReactMigrationTool();
    const options: MigrationOptions = { dryRun: true };

    await migrator.migrate(targetVersion, projectPath, options);
  });

// Add a command to analyze specific packages
program
  .command('analyze-package <package-name>')
  .description('Analyze a specific package for React compatibility')
  .option('-v, --version <version>', 'Package version to analyze')
  .action(async (packageName: string) => {
    console.log(
      chalk.blue(`🔍 Analyzing ${packageName} for React compatibility...`)
    );
    console.log(chalk.yellow('Package analysis feature coming soon!'));
  });

// Add backup management commands
program
  .command('backup')
  .description('Create a backup of the current project')
  .action(async () => {
    const migrator = new ReactMigrationTool();
    await migrator.createBackup();
  });

program
  .command('rollback <backup-id>')
  .description('Rollback to a specific backup')
  .action(async (backupId: string) => {
    const migrator = new ReactMigrationTool();
    await migrator.rollback(backupId);
  });

program
  .command('list-backups')
  .description('List available backups')
  .action(() => {
    const migrator = new ReactMigrationTool();
    const backups = migrator.listBackups();

    if (backups.length === 0) {
      console.log(chalk.yellow('No backups found'));
      return;
    }

    console.log(chalk.blue('📋 Available Backups:'));
    backups.forEach(backup => {
      console.log(chalk.green(`  ${backup.id}`));
      console.log(chalk.gray(`    ${backup.description}`));
      console.log(chalk.gray(`    Path: ${backup.path}`));
      console.log('');
    });
  });

program.parse();
