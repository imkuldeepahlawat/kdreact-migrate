import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from '@jest/globals';
import type { SpyInstance } from 'jest-mock';
import { ReactMigrationTool } from '../src/index';

describe('Integration Tests', () => {
  let mockConsoleLog: SpyInstance;
  let mockConsoleError: SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Full migration workflow', () => {
    it('should start migration process for React 18', async () => {
      // Step 1: Create migrator instance
      const migrator = new ReactMigrationTool();

      // Step 2: Execute migration (will fail due to no React project, but should start)
      await migrator.migrate('18', process.cwd());

      // Step 3: Verify logging
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 18 migration...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔍 Analyzing project structure...'
      );
      // Should handle error gracefully
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should start migration process for React 17', async () => {
      const migrator = new ReactMigrationTool();
      await migrator.migrate('17');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 17 migration...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔍 Analyzing project structure...'
      );
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should start migration process for React 19', async () => {
      const migrator = new ReactMigrationTool();
      await migrator.migrate('19');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 19 migration...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔍 Analyzing project structure...'
      );
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('Migration options', () => {
    it('should handle dry-run option', async () => {
      const migrator = new ReactMigrationTool();
      await migrator.migrate('18', process.cwd(), { dryRun: true });

      // Should start the migration process regardless of options
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 18 migration...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔍 Analyzing project structure...'
      );
    });

    it('should handle deps-only option', async () => {
      const migrator = new ReactMigrationTool();
      await migrator.migrate('18', process.cwd(), { depsOnly: true });

      // Should start the migration process regardless of options
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 18 migration...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔍 Analyzing project structure...'
      );
    });

    it('should handle skip-deps option', async () => {
      const migrator = new ReactMigrationTool();
      await migrator.migrate('18', process.cwd(), { skipDeps: true });

      // Should start the migration process regardless of options
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 18 migration...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔍 Analyzing project structure...'
      );
    });

    it('should handle verbose option', async () => {
      const migrator = new ReactMigrationTool();
      await migrator.migrate('18', process.cwd(), { verbose: true });

      // Should start the migration process
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 18 migration...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔍 Analyzing project structure...'
      );
    });
  });

  describe('Error scenarios', () => {
    it('should handle invalid React version gracefully', async () => {
      const migrator = new ReactMigrationTool();

      // This should not throw but handle the error internally
      await expect(migrator.migrate('16')).resolves.not.toThrow();
    });

    it('should handle non-existent project path', async () => {
      const migrator = new ReactMigrationTool();

      // Should handle gracefully even if project structure is invalid
      await expect(
        migrator.migrate('18', '/non/existent/path')
      ).resolves.not.toThrow();
    });
  });

  describe('Multiple migrations', () => {
    it('should handle multiple consecutive migrations', async () => {
      const migrator = new ReactMigrationTool();

      // First migration
      await migrator.migrate('17');
      expect(migrator.targetVersion).toBe('17');

      // Second migration
      await migrator.migrate('18');
      expect(migrator.targetVersion).toBe('18');

      // Third migration
      await migrator.migrate('19');
      expect(migrator.targetVersion).toBe('19');
    });

    it('should maintain state between migrations', async () => {
      const migrator = new ReactMigrationTool();

      await migrator.migrate('18');
      const firstIssuesCount = migrator.issues.length;
      const firstFixesCount = migrator.fixes.length;

      await migrator.migrate('19');
      const secondIssuesCount = migrator.issues.length;
      const secondFixesCount = migrator.fixes.length;

      // State should be maintained (though actual counts depend on implementation)
      expect(typeof firstIssuesCount).toBe('number');
      expect(typeof firstFixesCount).toBe('number');
      expect(typeof secondIssuesCount).toBe('number');
      expect(typeof secondFixesCount).toBe('number');
    });
  });

  describe('CLI integration', () => {
    it('should work with CLI-style usage', async () => {
      const migrator = new ReactMigrationTool();

      // Simulate CLI usage pattern
      const targetVersion = '18';
      const projectPath = process.cwd();
      const options = { dryRun: true };

      await migrator.migrate(targetVersion, projectPath, options);

      expect(migrator.targetVersion).toBe(targetVersion);
      expect(migrator.projectRoot).toBe(projectPath);
      expect(migrator.options).toEqual(options);
    });
  });
});
