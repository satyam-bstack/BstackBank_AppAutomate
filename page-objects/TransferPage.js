const BasePage = require('./BasePage');

/**
 * TransferPage - Page Object for the Transfer screen
 * Selectors verified via live exploratory session on Samsung Galaxy S23
 * App package: com.yash.bankingapp
 *
 * Verified selectors:
 *   ", Send Money"       → ViewGroup content-desc (tab)
 *   ", Pay via Card"     → ViewGroup content-desc (tab)
 *   available-balance    → TextView text "Available: $…" (dynamic value)
 *   recipient-<uuid>     → ViewGroup resource-id (dynamic — use descriptionContains)
 *   amount-input         → EditText resource-id
 *   "$50/$100/$250/$500" → ViewGroup content-desc (quick-amount chips)
 *   remarks-input        → EditText resource-id
 *   send-btn             → Button resource-id / content-desc "Send money"
 *   bio-auth-btn         → ViewGroup resource-id (authorize button on auth sheet)
 *   auth-cancel-btn      → ViewGroup resource-id (cancel on auth sheet)
 *   done-btn             → Button resource-id / content-desc "Done, close transfer confirmation"
 *   "Transfer Successful!" → TextView text (success modal title)
 */
class TransferPage extends BasePage {
  // ─── Tab selectors ────────────────────────────────────────────────────────

  get sendMoneyTab() {
    return $('android=new UiSelector().descriptionContains(", Send Money")');
  }

  get payViaCardTab() {
    return $('android=new UiSelector().descriptionContains(", Pay via Card")');
  }

  // ─── Recipient list ───────────────────────────────────────────────────────

  /**
   * Select a recipient by their display name (partial match).
   * Recipients use dynamic UUIDs in resource-id; content-desc contains the name.
   * @param {string} name - Recipient name (e.g. "Aditya", "Alex Williams")
   */
  async selectRecipientByName(name) {
    await this.tap(`android=new UiSelector().descriptionContains("${name}")`);
  }

  /**
   * Select the first available recipient in the list and remember its name.
   * Recipient rows share the resource-id prefix "recipient-" (UUID suffix is dynamic).
   * Row content-desc format: "<initials>, <Full Name>, ****<last4>".
   * Fails with a clear message when the list is empty (the app exposes no
   * add-recipient control on the Transfer screen).
   * @returns {Promise<string>} The selected recipient's display name
   */
  async selectFirstRecipient() {
    const rowsSelector = 'android=new UiSelector().descriptionContains(", ****")';
    await driver.waitUntil(
      async () => (await $$(rowsSelector)).length > 0,
      {
        timeout: 10000,
        timeoutMsg: 'No recipients available on the Transfer screen and the app has no add-recipient option',
      }
    );
    const rows = await $$(rowsSelector);
    const first = rows[0];
    const desc = await first.getAttribute('content-desc');
    // "PM, Priyans Mehta, ****4df4" -> "Priyans Mehta"
    const name = desc.split(',')[1].trim();
    await first.click();
    this.selectedRecipientName = name;
    return name;
  }

  // ─── Amount form ──────────────────────────────────────────────────────────

  get amountInput() {
    return $('android=new UiSelector().resourceId("amount-input")');
  }

  get remarksInput() {
    return $('android=new UiSelector().resourceId("remarks-input")');
  }

  get sendButton() {
    return $('android=new UiSelector().resourceId("send-btn")');
  }

  /**
   * Tap a quick-amount chip ($50, $100, $250, $500).
   * @param {string} amount - e.g. "$100"
   */
  async tapQuickAmount(amount) {
    await this.tap(`android=new UiSelector().description("${amount}")`);
  }

  async enterAmount(amount) {
    await this.typeText('android=new UiSelector().resourceId("amount-input")', String(amount));
  }

  async enterRemarks(note) {
    await this.scrollDown();
    await this.typeText('android=new UiSelector().resourceId("remarks-input")', note);
  }

  async tapSendButton() {
    await this.hideKeyboard();
    await this.scrollDown();
    await this.tap('android=new UiSelector().resourceId("send-btn")');
  }

  // ─── Authorization sheet ──────────────────────────────────────────────────

  get bioAuthButton() {
    return $('android=new UiSelector().resourceId("bio-auth-btn")');
  }

  get authCancelButton() {
    return $('android=new UiSelector().resourceId("auth-cancel-btn")');
  }

  async tapAuthenticateButton() {
    await this.tap('android=new UiSelector().resourceId("bio-auth-btn")');
  }

  async tapAuthCancelButton() {
    await this.tap('android=new UiSelector().resourceId("auth-cancel-btn")');
  }

  async isAuthSheetDisplayed() {
    return this.isDisplayed('android=new UiSelector().resourceId("bio-auth-btn")');
  }

  // ─── Success modal ────────────────────────────────────────────────────────

  get doneButton() {
    return $('android=new UiSelector().resourceId("done-btn")');
  }

  async isTransferSuccessful() {
    return this.isDisplayed('android=new UiSelector().text("Transfer Successful!")');
  }

  async getSuccessMessage() {
    return this.getText('android=new UiSelector().text("Transfer Successful!")');
  }

  async tapDoneButton() {
    await this.tap('android=new UiSelector().resourceId("done-btn")');
  }

  async waitForSuccessModal() {
    await this.waitForElement('android=new UiSelector().text("Transfer Successful!")', 15000);
  }

  async waitForAuthSheet() {
    await this.waitForElement('android=new UiSelector().resourceId("bio-auth-btn")', 10000);
  }

  // ─── Availability ─────────────────────────────────────────────────────────

  async isTransferScreenDisplayed() {
    return this.isDisplayed('android=new UiSelector().descriptionContains(", Send Money")');
  }
}

module.exports = new TransferPage();
