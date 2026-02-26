/**
 * Bundle Analyzer Service
 * Analyzes JavaScript bundle sizes and provides optimization recommendations
 */

export interface BundleModule {
  name: string;
  size: number;
  gzippedSize: number;
  percentage: number;
}

export interface BundleAnalysisReport {
  page: string;
  timestamp: Date;
  totalSize: number;
  gzippedSize: number;
  modules: BundleModule[];
  budget: number;
  budgetExceeded: boolean;
  violations: string[];
}

export class BundleAnalyzerService {
  private static readonly LISTINGS_BUDGET = 150 * 1024; // 150KB gzipped
  private static readonly CHECKOUT_BUDGET = 120 * 1024; // 120KB gzipped

  /**
   * Analyze bundle and generate report
   */
  static analyzeBundle(
    page: string,
    modules: BundleModule[]
  ): BundleAnalysisReport {
    const budget = this.getBudgetForPage(page);
    const totalSize = modules.reduce((sum, m) => sum + m.size, 0);
    const gzippedSize = modules.reduce((sum, m) => sum + m.gzippedSize, 0);

    const violations: string[] = [];

    if (gzippedSize > budget) {
      violations.push(
        `Bundle size ${(gzippedSize / 1024).toFixed(2)}KB exceeds budget of ${(budget / 1024).toFixed(2)}KB`
      );
    }

    // Check for large modules
    modules.forEach((module) => {
      if (module.gzippedSize > budget * 0.3) {
        violations.push(
          `Module "${module.name}" is ${(module.gzippedSize / 1024).toFixed(2)}KB (${module.percentage.toFixed(1)}% of bundle)`
        );
      }
    });

    return {
      page,
      timestamp: new Date(),
      totalSize,
      gzippedSize,
      modules,
      budget,
      budgetExceeded: gzippedSize > budget,
      violations,
    };
  }

  /**
   * Get budget for specific page
   */
  private static getBudgetForPage(page: string): number {
    switch (page.toLowerCase()) {
      case 'listings':
        return this.LISTINGS_BUDGET;
      case 'checkout':
        return this.CHECKOUT_BUDGET;
      default:
        return this.LISTINGS_BUDGET;
    }
  }

  /**
   * Detect duplicate dependencies
   */
  static detectDuplicates(modules: BundleModule[]): Map<string, number> {
    const duplicates = new Map<string, number>();

    modules.forEach((module) => {
      // Extract package name (simplified - in real scenario would parse package.json)
      const packageName = module.name.split('/')[0];
      duplicates.set(packageName, (duplicates.get(packageName) || 0) + 1);
    });

    // Filter to only show actual duplicates
    const actualDuplicates = new Map<string, number>();
    duplicates.forEach((count, name) => {
      if (count > 1) {
        actualDuplicates.set(name, count);
      }
    });

    return actualDuplicates;
  }

  /**
   * Get optimization recommendations
   */
  static getRecommendations(report: BundleAnalysisReport): string[] {
    const recommendations: string[] = [];

    if (report.budgetExceeded) {
      recommendations.push('Bundle exceeds size budget - consider code splitting');
      recommendations.push('Review and remove unused dependencies');
      recommendations.push('Enable tree-shaking in build configuration');
    }

    // Find largest modules
    const largestModules = report.modules
      .sort((a, b) => b.gzippedSize - a.gzippedSize)
      .slice(0, 3);

    largestModules.forEach((module) => {
      if (module.percentage > 10) {
        recommendations.push(
          `Consider lazy-loading "${module.name}" (${module.percentage.toFixed(1)}% of bundle)`
        );
      }
    });

    return recommendations;
  }
}
