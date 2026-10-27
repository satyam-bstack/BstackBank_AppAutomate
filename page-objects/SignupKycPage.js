const BasePage = require('./BasePage');

/**
 * SignupKycPage - Page Object for the new-customer onboarding flow
 * Sign Up form → (3) Liveness Check → (4) Identity Verification (biometric) → (5) KYC document upload → Home
 * Selectors verified via live exploratory session on Samsung Galaxy S23 (com.yash.bankingapp).
 *
 * Verified selectors:
 *   Login → Sign Up link   → ~Go to sign up
 *   Sign Up form           → fullname-input, email-input, password-input, confirm-password-input, ~Create your account
 *   Liveness (Step 3)      → ~Open camera to take liveness photo, "Photo captured", ~Set as profile photo
 *   Camera app (Samsung)   → ~Take picture, ~OK (com.sec.android.app.camera)
 *   KYC (Step 5)           → ~Upload identity document PDF, ~I Agree & Continue, ~Complete registration
 *   Android file picker    → ~Show roots, "Downloads" root, file row title text
 */
class SignupKycPage extends BasePage {
  // ─── Login → Sign Up ───────────────────────────────────────────────────────

  async tapGoToSignUp() {
    await this.tap('~Go to sign up');
  }

  // ─── Sign Up form ──────────────────────────────────────────────────────────

  async isSignUpScreenDisplayed() {
    return this.isDisplayed('android=new UiSelector().text("Create Account")');
  }

  /**
   * The keyboard stays open after the email field and covers the password fields, so they
   * are not found until scrolled into view (hideKeyboard alone does not reveal them).
   * Scroll each lower field into view with UiScrollable before typing.
   */
  async scrollToAndType(resourceId, text) {
    const field = await $(
      `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceId("${resourceId}"))`
    );
    await field.waitForDisplayed({ timeout: 10000 });
    await field.setValue(text);
  }

  async fillSignUpForm({ fullName, email, password }) {
    await this.typeText('android=new UiSelector().resourceId("fullname-input")', fullName);
    await this.typeText('android=new UiSelector().resourceId("email-input")', email);
    await this.scrollToAndType('password-input', password);
    await this.scrollToAndType('confirm-password-input', password);
    await this.hideKeyboard();
  }

  async tapCreateAccount() {
    await this.tap('~Create your account');
  }

  // ─── Step 3: Liveness ──────────────────────────────────────────────────────

  async waitForLivenessScreen() {
    await this.waitForElement('android=new UiSelector().text("Liveness Verification")', 30000);
  }

  async tapOpenCamera() {
    await this.tap('~Open camera to take liveness photo');
  }

  /** Camera permission dialog — a missing dialog must not fail the test. */
  async allowPermissionIfShown() {
    const btn = await $('android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_foreground_only_button")');
    try {
      await btn.waitForDisplayed({ timeout: 8000 });
      await btn.click();
    } catch {
      // already granted
    }
  }

  /**
   * The camera app differs per device: Samsung (shutter "Take picture", review "OK") vs
   * Google Camera on Pixel (shutter "Take photo", review "Done").
   * Wait until either shutter is displayed; returns the shutter/confirm pair for that camera.
   */
  async waitForCameraPreview() {
    await driver.waitUntil(
      async () =>
        (await this.isDisplayed('~Take picture')) || (await this.isDisplayed('~Take photo')),
      { timeout: 20000, timeoutMsg: 'Device camera did not open for the liveness check' }
    );
  }

  async captureAndConfirmPhoto() {
    const isGoogleCamera = await this.isDisplayed('~Take photo');
    await this.tap(isGoogleCamera ? '~Take photo' : '~Take picture');
    await this.tap(isGoogleCamera ? '~Done' : '~OK');
  }

  async waitForPhotoCaptured() {
    await this.waitForElement('android=new UiSelector().text("Photo captured")', 20000);
  }

  async getPhotoCapturedText() {
    return this.getText('android=new UiSelector().text("Photo captured")');
  }

  async tapSetProfile() {
    await this.tap('~Set as profile photo');
  }

  // ─── Step 4: Identity Verification (biometric) ─────────────────────────────

  async waitForBiometricDialog() {
    await this.waitForElement('android=new UiSelector().resourceId("android:id/alertTitle")', 30000);
  }

  async getBiometricDialogTitle() {
    return this.getText('android=new UiSelector().resourceId("android:id/alertTitle")');
  }

  // ─── Step 5: KYC document upload ───────────────────────────────────────────

  async waitForKycScreen() {
    await this.waitForElement('android=new UiSelector().text("KYC Verification")', 30000);
  }

  async isCompleteRegistrationEnabled() {
    const btn = await this.waitForElement('~Complete registration', 10000);
    return btn.isEnabled();
  }

  async tapUploadDocument() {
    await this.tap('~Upload identity document PDF');
  }

  async acceptDataConsent() {
    await this.tap('~I Agree & Continue');
  }

  /** Pick a file from the system Downloads root in the Android document picker. */
  async pickFileFromDownloads(fileName) {
    await this.tap('~Show roots');
    await this.tap('android=new UiSelector().resourceId("android:id/title").text("Downloads")');
    // The file card (documentsui item_root) is the clickable row; its title text carries the file name
    await this.tap(`android=new UiSelector().resourceId("com.google.android.documentsui:id/item_root").childSelector(new UiSelector().text("${fileName}"))`);
  }

  async getUploadedFileName(fileName) {
    return this.getText(`android=new UiSelector().text("${fileName}")`);
  }

  async tapCompleteRegistration() {
    await this.tap('~Complete registration');
  }

  // ─── Home ──────────────────────────────────────────────────────────────────

  async getGreetingName() {
    return this.getText('android=new UiSelector().textContains("Kyc Customer")');
  }
}

module.exports = new SignupKycPage();