const { When, Then } = require('@wdio/cucumber-framework');
const fs = require('fs');
const signupKyc = require('../page-objects/SignupKycPage');
const loginPage = require('../page-objects/LoginPage');
const homePage = require('../page-objects/HomePage');
const { snapshot } = require('../page-objects/VisualHelper');
const testData = require('../config/test-data');
const {
  acceptNotificationPermission,
  handleBiometricDialog,
  acceptLocationPermission,
  logoutFromApp,
} = require('./hooks');

/**
 * Sign Up + Liveness + Biometric + KYC step definitions
 * Verified flow on Samsung Galaxy S23 (com.yash.bankingapp):
 *   Login → "Go to sign up" → Create Account form → Step 3 Liveness (camera, injected selfie)
 *   → Step 4 Identity Verification (biometric dialog PASS) → Step 5 KYC (consent → file picker → PDF)
 *   → Complete Registration → location permission → Home ("Good morning," + customer name)
 *
 * BrowserStack features exercised:
 *   - Camera image injection  (browserstack_executor cameraImageInjection, selfie media)
 *   - Biometric simulation    (browserstack_executor biometric pass, needs enableBiometric)
 *   - File push to the device (driver.pushFile) for the KYC document upload
 *   - App Percy snapshots     (VisualHelper, when ENABLE_PERCY=true)
 */

// New customer for this run: reused by the sign up and the later login step
let newCustomer;

When('I open the sign up screen', async () => {
  await acceptNotificationPermission();
  await signupKyc.tapGoToSignUp();
  await driver.waitUntil(async () => signupKyc.isSignUpScreenDisplayed(), {
    timeout: 15000,
    timeoutMsg: 'Create Account screen did not appear after tapping Sign Up',
  });
  await snapshot('Sign Up Screen');
});

When('I sign up as a new customer', async () => {
  newCustomer = testData.buildNewCustomer();
  expect(newCustomer.password).toBeTruthy(); // SIGNUP_PASSWORD must be set in .env / CI secrets
  await signupKyc.fillSignUpForm(newCustomer);
  await signupKyc.tapCreateAccount();
});

Then('I should see the liveness verification screen', async () => {
  await signupKyc.waitForLivenessScreen();
  expect(await signupKyc.getText('android=new UiSelector().text("Step 3 of 5 — Liveness Check")')).toBe(
    'Step 3 of 5 — Liveness Check'
  );
  await snapshot('Liveness Screen');
});

When('I open the camera and inject the selfie image', async () => {
  await signupKyc.tapOpenCamera();
  await signupKyc.allowPermissionIfShown();
  await signupKyc.waitForCameraPreview();
  const payload = JSON.stringify({
    action: 'cameraImageInjection',
    arguments: { imageUrl: testData.selfieMediaUrl },
  });
  await driver.execute(`browserstack_executor: ${payload}`);
});

When('I capture the liveness photo and confirm it', async () => {
  await signupKyc.captureAndConfirmPhoto();
});

Then('the liveness photo should be reported as captured', async () => {
  await signupKyc.waitForPhotoCaptured();
  expect(await signupKyc.getPhotoCapturedText()).toBe('Photo captured');
  await snapshot('Liveness Photo Captured');
});

When('I set the captured photo as my profile photo', async () => {
  await signupKyc.tapSetProfile();
});

Then('I should see the biometric authentication dialog', async () => {
  await signupKyc.waitForBiometricDialog();
  expect((await signupKyc.getBiometricDialogTitle()).trim()).toBe('Biometric Authentication');
});

When('I pass the biometric authentication', async () => {
  // BrowserStack biometric simulation — requires enableBiometric (ENABLE_BIOMETRIC=true)
  await driver.execute('browserstack_executor: {"action":"biometric", "arguments": {"biometricMatch": "pass"}}');
});

Then('I should see the KYC verification screen', async () => {
  await signupKyc.waitForKycScreen();
  expect(await signupKyc.getText('android=new UiSelector().text("Step 5 of 5 — KYC Verification")')).toBe(
    'Step 5 of 5 — KYC Verification'
  );
  await snapshot('KYC Screen');
});

Then('the complete registration button should be disabled', async () => {
  expect(await signupKyc.isCompleteRegistrationEnabled()).toBe(false);
});

When('I upload the KYC identity document from Downloads', async () => {
  const doc = testData.kycDocument;
  // The document must exist on the device before the app's file picker can list it
  const base64 = fs.readFileSync(doc.localPath).toString('base64');
  await driver.pushFile(doc.devicePath, base64);
  await signupKyc.tapUploadDocument();
  await signupKyc.acceptDataConsent();
  await signupKyc.pickFileFromDownloads(doc.fileName);
});

Then('the KYC document should be listed as uploaded', async () => {
  const doc = testData.kycDocument;
  await signupKyc.waitForElement(`android=new UiSelector().text("${doc.fileName}")`, 15000);
  expect(await signupKyc.getUploadedFileName(doc.fileName)).toBe(doc.fileName);
  await snapshot('KYC Document Uploaded');
});

Then('the complete registration button should be enabled', async () => {
  await driver.waitUntil(async () => signupKyc.isCompleteRegistrationEnabled(), {
    timeout: 10000,
    timeoutMsg: 'Complete Registration did not become enabled after the document upload',
  });
  expect(await signupKyc.isCompleteRegistrationEnabled()).toBe(true);
});

When('I complete the registration', async () => {
  await signupKyc.tapCompleteRegistration();
  await acceptLocationPermission();
});

Then("I should see the new customer's home dashboard", async () => {
  // After a login the biometric + location prompts come first; on the sign-up path they are absent
  await handleBiometricDialog();
  await acceptLocationPermission();
  await homePage.waitForDashboard();
  expect(await homePage.isDashboardDisplayed()).toBe(true);
  // The greeting shows the name registered at sign up (the app appends a trailing space)
  // The greeting is the registered name followed by a space and an icon-font glyph (U+F35C, the wave
  // icon), so assert the name is exactly what precedes that decoration rather than the whole text.
  const greeting = await signupKyc.getGreetingName();
  expect(greeting.startsWith(`${newCustomer.fullName} `)).toBe(true);
  expect(greeting.slice(newCustomer.fullName.length).trim().length).toBeLessThanOrEqual(1);
  await snapshot('New Customer Home');
});

When('I sign out of the app', async () => {
  await logoutFromApp();
  // logoutFromApp opens the confirmation dialog; confirm it
  const confirm = await $('android=new UiSelector().resourceId("android:id/button1")');
  await confirm.waitForDisplayed({ timeout: 8000 });
  await confirm.click();
  await driver.waitUntil(async () => loginPage.isLoginScreenDisplayed(), {
    timeout: 15000,
    timeoutMsg: 'Login screen did not appear after signing out',
  });
});

When('I log in with the new customer credentials', async () => {
  await loginPage.login(newCustomer.email, newCustomer.password);
  // Biometric pass is sent by handleBiometricDialog in the next step
});
