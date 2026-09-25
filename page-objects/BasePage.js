/**
 * BasePage - Base class for all Page Objects
 * Contains common utilities and wait helpers
 */
class BasePage {
  /**
   * Wait for an element to be displayed
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in ms (default 15000)
   */
  async waitForElement(selector, timeout = 15000) {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  /**
   * Wait for an element to exist in DOM
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in ms
   */
  async waitForExist(selector, timeout = 15000) {
    const element = await $(selector);
    await element.waitForExist({ timeout });
    return element;
  }

  /**
   * Tap on an element
   * @param {string} selector - Element selector
   */
  async tap(selector) {
    const element = await this.waitForElement(selector);
    await element.click();
  }

  /**
   * Type text into an input field
   * @param {string} selector - Element selector
   * @param {string} text - Text to type
   */
  async typeText(selector, text) {
    const element = await this.waitForElement(selector);
    await element.clearValue();
    await element.setValue(text);
  }

  /**
   * Get text from an element
   * @param {string} selector - Element selector
   * @returns {string} Element text
   */
  async getText(selector) {
    const element = await this.waitForElement(selector);
    return element.getText();
  }

  /**
   * Check if element is displayed
   * @param {string} selector - Element selector
   * @returns {boolean}
   */
  async isDisplayed(selector) {
    try {
      const element = await $(selector);
      return element.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Scroll down on the screen (cross-platform: Android UiScrollable / iOS mobile:scroll)
   */
  async scrollDown() {
    const platform = driver.capabilities?.platformName?.toLowerCase();
    if (platform === 'ios') {
      await driver.execute('mobile: scroll', { direction: 'down' });
    } else {
      await $('android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()');
    }
  }

  /**
   * Scroll up on the screen (cross-platform: Android UiScrollable / iOS mobile:scroll)
   */
  async scrollUp() {
    const platform = driver.capabilities?.platformName?.toLowerCase();
    if (platform === 'ios') {
      await driver.execute('mobile: scroll', { direction: 'up' });
    } else {
      await $('android=new UiScrollable(new UiSelector().scrollable(true)).scrollBackward()');
    }
  }

  /**
   * Hide keyboard if visible
   */
  async hideKeyboard() {
    try {
      await driver.hideKeyboard();
    } catch {
      // Keyboard may not be visible
    }
  }

  /**
   * Wait for page to load (waits for activity to settle)
   * @param {number} timeout - Timeout in ms
   */
  async waitForPageLoad(timeout = 10000) {
    await driver.waitUntil(
      async () => {
        const source = await driver.getPageSource();
        return source.length > 0;
      },
      { timeout, timeoutMsg: 'Page did not load within timeout' }
    );
  }
}

module.exports = BasePage;
