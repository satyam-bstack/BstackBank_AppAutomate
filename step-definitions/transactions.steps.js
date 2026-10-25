const { When, Then } = require('@wdio/cucumber-framework');
const transactionsPage = require('../page-objects/TransactionsPage');
const homePage = require('../page-objects/HomePage');
const { snapshot } = require('../page-objects/VisualHelper');

/**
 * Transactions Step Definitions
 * Verified flow on Samsung Galaxy S23 (com.yash.bankingapp):
 *   1. Home dashboard → tap Transactions nav tab
 *   2. Transactions screen shows title, summary cards, filter chips, transaction rows
 *   3. Filter chips: All, Credit, Debit, Transfer, Payment
 */

When('I navigate to the Transactions screen', async () => {
  await homePage.navigateToTransactions();
  await transactionsPage.waitForTransactionsScreen();
  await snapshot('Transactions Screen');
});

Then('I should see the Transactions screen', async () => {
  const isDisplayed = await transactionsPage.isTransactionsScreenDisplayed();
  expect(isDisplayed).toBe(true);
});

Then('I should see the transaction summary cards', async () => {
  await driver.waitUntil(
    async () => transactionsPage.isDisplayed('android=new UiSelector().text("Total In")'),
    { timeout: 10000, timeoutMsg: 'Transaction summary cards did not appear' }
  );
  const totalInVisible = await transactionsPage.isDisplayed('android=new UiSelector().text("Total In")');
  const totalOutVisible = await transactionsPage.isDisplayed('android=new UiSelector().text("Total Out")');
  expect(totalInVisible).toBe(true);
  expect(totalOutVisible).toBe(true);
});

When('I tap the Debit filter', async () => {
  await transactionsPage.tapFilterDebit();
});

When('I tap the Credit filter', async () => {
  await transactionsPage.tapFilterCredit();
});

When('I tap the Transfer filter', async () => {
  await transactionsPage.tapFilterTransfer();
});

When('I tap the All filter', async () => {
  await transactionsPage.tapFilterAll();
});

Then('I should see the selected recipient in the transaction list', async function () {
  const name = this.selectedRecipient || global.selectedRecipient;
  expect(name).toBeTruthy();
  await driver.waitUntil(
    async () => transactionsPage.isRecipientTransactionVisible(name),
    { timeout: 10000, timeoutMsg: `Transaction for "${name}" did not appear in the list` }
  );
  expect(await transactionsPage.isRecipientTransactionVisible(name)).toBe(true);
});

Then('I should see {string} in the transaction list', async (name) => {
  await driver.waitUntil(
    async () => transactionsPage.isRecipientTransactionVisible(name),
    { timeout: 10000, timeoutMsg: `Transaction for "${name}" did not appear in the list` }
  );
  const isVisible = await transactionsPage.isRecipientTransactionVisible(name);
  expect(isVisible).toBe(true);
});
