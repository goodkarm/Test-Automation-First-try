import { Page, TestInfo } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export interface ScreenshotOptions {
  fullPage?: boolean;
  timeout?: number;
}

export class ScreenshotHelper {
  private page: Page;
  private testInfo: TestInfo;
  private stepCounter: number = 0;
  private screenshotDir: string;

  constructor(page: Page, testInfo: TestInfo, screenshotDir?: string) {
    this.page = page;
    this.testInfo = testInfo;
    this.screenshotDir = screenshotDir ?? path.join("test-results", "screenshots");
    this.ensureDirectoryExists(this.screenshotDir);
  }

  /**
   * Captures a screenshot and attaches it to the Playwright HTML report.
   * Call this after every test step.
   *
   * @param stepName  A short label describing the step (e.g. "Login button clicked")
   * @param options   Optional screenshot config (fullPage, timeout)
   * @returns         The file path of the saved screenshot
   *
   * @example
   *   const shot = new ScreenshotHelper(page, testInfo);
   *   await page.click('#login');
   *   await shot.capture("Clicked login button");
   */
  async capture(stepName: string, options: ScreenshotOptions = {}): Promise<string> {
    this.stepCounter++;

    const sanitizedStep = this.sanitizeName(stepName);
    const sanitizedTest = this.sanitizeName(this.testInfo.title);
    const fileName = `${String(this.stepCounter).padStart(3, "0")}_${sanitizedTest}_${sanitizedStep}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    try {
      await this.page.screenshot({
        path: filePath,
        fullPage: options.fullPage ?? false,
        timeout: options.timeout ?? 5000,
      });

      // Attach to Playwright HTML report
      await this.testInfo.attach(stepName, {
        path: filePath,
        contentType: "image/png",
      });

      console.log(`[Screenshot] Step ${this.stepCounter}: "${stepName}" → ${filePath}`);
    } catch (error) {
      console.warn(`[Screenshot] Failed to capture "${stepName}": ${(error as Error).message}`);
    }

    return filePath;
  }

  /**
   * Wraps a test step with automatic before/after screenshots.
   * Useful for capturing state transitions around actions.
   *
   * @param stepName  Label for the step
   * @param action    Async function containing the Playwright action(s)
   * @param options   Optional screenshot config
   *
   * @example
   *   await shot.step("Submit form", async () => {
   *     await page.click('button[type="submit"]');
   *   });
   */
  async step(
    stepName: string,
    action: () => Promise<void>,
    options: ScreenshotOptions = {}
  ): Promise<void> {
    await this.capture(`BEFORE – ${stepName}`, options);
    try {
      await action();
    } finally {
      await this.capture(`AFTER – ${stepName}`, options);
    }
  }

  /**
   * Captures a full-page screenshot — shorthand for capture() with fullPage: true.
   *
   * @param stepName  Label for the step
   * @param options   Additional options (timeout, etc.)
   */
  async captureFullPage(stepName: string, options: Omit<ScreenshotOptions, "fullPage"> = {}): Promise<string> {
    return this.capture(stepName, { ...options, fullPage: true });
  }

  /**
   * Resets the internal step counter.
   * Useful if you share one instance across multiple independent test sections.
   */
  resetCounter(): void {
    this.stepCounter = 0;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private sanitizeName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s-_]/g, "")  // strip special chars
      .replace(/\s+/g, "_")               // spaces → underscores
      .substring(0, 60);                  // cap length
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}