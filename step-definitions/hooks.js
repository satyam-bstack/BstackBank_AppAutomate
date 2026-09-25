const { Before, After, BeforeAll, AfterAll } = require('@wdio/cucumber-framework');

/**
 * Global Hooks
 * Verified flow (Samsung Galaxy S23, com.yash.bankingapp):
 *   1. App launch → Notification permission dialog (Allow / Don't allow)
 *   2. Login → Biometric Authentication dialog (CANCEL / FAIL / PASS)
 *   3. After biometric PASS → Location permission dialog (While using / Only this time / Don't allow)
 *   4. Home dashboard loads
 */

BeforeAll(async () => {
  console.log('=== BStackBank Test Suite Starting ===');
});

AfterAll(async () => {
  console.log('=== BStackBank Test Suite Complete ===');
});

Before(async function (scenario) {
  console.log(`\n▶ Starting: ${scenario.pickle.name}`);

  // // Extract tags matching @TCID_ or @TC- for BrowserStack test case mapping
  // const tcTags = scenario.pickle.tags
  //   .filter(tag => tag.name.startsWith('@TCID_') || tag.name.startsWith('@TC-'))
  //   .map(tag => tag.name.replace('@TCID_', '').replace('@', ''));
  // if (tcTags.length > 0) {
  //   const tcidValue = tcTags.join(', ');
  //   // 'ID' is the primary key required by BrowserStack Test Management
  //   await browser.setCustomTags('ID', tcidValue);
  //   await browser.setCustomTags('test_case_id', tcidValue);
  //   console.log(`\n▶ Setting Custom Tags: ${tcTags}`);
  // }
});

After(async (scenario) => {
  const status = scenario.result?.status;
  console.log(`${status === 'PASSED' ? '✅' : '❌'} Finished: ${scenario.pickle.name} [${status}]`);

  if (status === 'FAILED') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const scenarioName = scenario.pickle.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      // Ensure reports directory exists before saving screenshot
      const fs = require('fs');
      fs.mkdirSync('./reports/screenshots', { recursive: true });
      await driver.saveScreenshot(`./reports/screenshots/failure_${scenarioName}_${timestamp}.png`);
    } catch {
      // Screenshot may fail if session is already closed
    }
  }
});

/**
 * Accept notification permission dialog if present.
 * resource-id: com.android.permissioncontroller:id/permission_allow_button
 */
async function acceptNotificationPermission() {
  try {
    const allowBtn = await $('android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_button")');
    await allowBtn.waitForDisplayed({ timeout: 6000 });
    await allowBtn.click();
    console.log('[Hook] Notification permission accepted');
  } catch {
    // No notification dialog — continue
  }
}

/**
 * Handle biometric — behaviour depends on ENABLE_BIOMETRIC env var:
 *   - ENABLE_BIOMETRIC=true  → wait for BrowserStack biometric dialog and send PASS via executor
 *   - ENABLE_BIOMETRIC=false → tap "Skip this step" to bypass biometric screen
 *
 * Requires enableBiometric: true in bstack:options when ENABLE_BIOMETRIC=true.
 */
async function handleBiometricDialog() {
  const biometricEnabled = process.env.ENABLE_BIOMETRIC === 'true';
  try {
    await driver.waitUntil(
      async () => {
        const src = await driver.getPageSource();
        return src.includes('Biometric Authentication') || src.includes('Verify Your Identity');
      },
      { timeout: 12000, timeoutMsg: 'Biometric screen did not appear' }
    );

    if (biometricEnabled) {
      // Use BrowserStack executor to simulate biometric PASS
      await driver.execute('browserstack_executor: {"action":"biometric", "arguments": {"biometricMatch": "pass"}}');
      console.log('[Hook] Biometric PASS sent via BrowserStack executor');
    } else {
      // Skip biometric — tap "Skip this step" button
      const Skip = await driver.$('-android uiautomator:new UiSelector().text("Skip this step")');
      await Skip.waitForDisplayed({ timeout: 80000 });
      await Skip.click();
      console.log('[Hook] Biometric skipped via "Skip this step" button');
    }
  } catch {
    // No biometric screen — continue
  }
}

/**
 * Accept location permission dialog — tap "While using the app".
 * resource-id: com.android.permissioncontroller:id/permission_allow_foreground_only_button
 */
async function acceptLocationPermission() {
  try {
    const locationBtn = await $('android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_foreground_only_button")');
    await locationBtn.waitForDisplayed({ timeout: 6000 });
    await locationBtn.click();
    console.log('[Hook] Location permission accepted (While using the app)');
  } catch {
    // No location dialog — continue
  }
}

/**
 * Logout from the app via Profile tab → Sign Out button.
 * resource-id: logout-btn (content-desc: "Sign out of your account")
 */
async function logoutFromApp() {
  try {
    const profileTab = await $('android=new UiSelector().descriptionContains(", Profile")');
    await profileTab.waitForDisplayed({ timeout: 5000 });
    await profileTab.click();
    // Use UiScrollable to scroll to logout button in native Android
    const logoutBtn = await $('android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceId("logout-btn"))');
    await logoutBtn.waitForDisplayed({ timeout: 8000 });
    await logoutBtn.click();
    console.log('[Hook] Logged out via Profile → Sign Out');
  } catch (e) {
    console.log('[Hook] Logout failed:', e.message);
  }
}

module.exports = {
  acceptNotificationPermission,
  handleBiometricDialog,
  acceptLocationPermission,
  logoutFromApp,
};
