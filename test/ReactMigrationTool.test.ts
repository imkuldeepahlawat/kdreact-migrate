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

describe('ReactMigrationTool', () => {
  let migrator: ReactMigrationTool;
  let mockConsoleLog: SpyInstance;
  let mockConsoleError: SpyInstance;

  beforeEach(() => {
    migrator = new ReactMigrationTool();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(migrator.targetVersion).toBe('18');
      expect(migrator.projectRoot).toBe(process.cwd());
      expect(migrator.issues).toEqual([]);
      expect(migrator.fixes).toEqual([]);
    });
  });

  describe('migrate', () => {
    it('should set target version and project root', async () => {
      const targetVersion = '17';
      const projectPath = '/test/path';

      await migrator.migrate(targetVersion, projectPath);

      expect(migrator.targetVersion).toBe(targetVersion);
      expect(migrator.projectRoot).toBe(projectPath);
    });

    it('should use current working directory when no project path provided', async () => {
      const targetVersion = '19';

      await migrator.migrate(targetVersion);

      expect(migrator.targetVersion).toBe(targetVersion);
      expect(migrator.projectRoot).toBe(process.cwd());
    });

    it('should log migration start message', async () => {
      await migrator.migrate('18');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 18 migration...'
      );
    });

    it('should handle migration failure gracefully', async () => {
      // The migration will fail because we're not in a React project
      // but it should handle the error gracefully
      await migrator.migrate('18');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🚀 Starting React 18 migration...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔍 Analyzing project structure...'
      );
      // Should log error and exit, but we're mocking console.error
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle different React versions', async () => {
      const versions = ['17', '18', '19'];

      for (const version of versions) {
        await migrator.migrate(version);
        expect(migrator.targetVersion).toBe(version);
      }
    });
  });

  describe('property access', () => {
    it('should allow reading and writing targetVersion', () => {
      migrator.targetVersion = '19';
      expect(migrator.targetVersion).toBe('19');
    });

    it('should allow reading and writing projectRoot', () => {
      const newPath = '/new/path';
      migrator.projectRoot = newPath;
      expect(migrator.projectRoot).toBe(newPath);
    });

    it('should allow adding issues', () => {
      const issue = 'Test issue';
      migrator.issues.push(issue);
      expect(migrator.issues).toContain(issue);
    });

    it('should allow adding fixes', () => {
      const fix = 'Test fix';
      migrator.fixes.push(fix);
      expect(migrator.fixes).toContain(fix);
    });
  });

  describe('error handling', () => {
    it('should handle async operations gracefully', async () => {
      // This test ensures the migrate method doesn't throw
      await expect(migrator.migrate('18')).resolves.not.toThrow();
    });

    it('should handle empty string project path', async () => {
      await migrator.migrate('18', '');
      expect(migrator.projectRoot).toBe('');
    });

    it('should handle undefined project path', async () => {
      await migrator.migrate('18', undefined);
      expect(migrator.projectRoot).toBe(process.cwd());
    });
  });

  describe('CLI integration', () => {
    it('should be instantiable for CLI usage', () => {
      expect(() => new ReactMigrationTool()).not.toThrow();
    });

    it('should have all required properties for CLI', () => {
      expect(migrator).toHaveProperty('targetVersion');
      expect(migrator).toHaveProperty('projectRoot');
      expect(migrator).toHaveProperty('issues');
      expect(migrator).toHaveProperty('fixes');
      expect(migrator).toHaveProperty('migrate');
    });
  });
});
