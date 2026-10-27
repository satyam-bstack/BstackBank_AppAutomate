/**
 * Shared, non-secret test data.
 *
 * qrCodeMediaUrl: BrowserStack media uploaded from config/Resource/QRCode-20220223-153233.png
 * (custom_id "BstackBankQRCode"). It encodes http://mattcollinge.wordpress.com/ as decoded by the
 * app's QR Result screen. Re-upload with:
 *   curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" -X POST \
 *     "https://api-cloud.browserstack.com/app-automate/upload-media" \
 *     -F "file=@config/Resource/QRCode-20220223-153233.png" -F "custom_id=BstackBankQRCode"
 * and update the value below (uploaded media expires after 30 days on BrowserStack).
 *
 * selfieMediaUrl: BrowserStack media uploaded from config/Resource/image.png (custom_id "BstackBankSelfie").
 * Used for the KYC liveness camera step. Re-upload the same way as the QR image (30-day expiry).
 *
 * kycDocument: local PDF pushed to the device Downloads folder for the KYC upload step.
 *
 * Sign-up identity is generated per run (see buildNewCustomer) so every run registers a NEW customer.
 * The password is a secret and is read from the SIGNUP_PASSWORD env key (.env / CI secret).
 */
const path = require('path');

function buildNewCustomer() {
  const stamp = Date.now();
  return {
    fullName: 'Kyc Customer',
    email: `kyc.customer.${stamp}@example.com`,
    password: process.env.SIGNUP_PASSWORD,
  };
}

module.exports = {
  // Override in CI via repo variables QR_MEDIA_URL / SELFIE_MEDIA_URL (media expires after 30 days)
  qrCodeMediaUrl: process.env.QR_MEDIA_URL || 'media://2e4d8449d55be30f9d3095f9f3ef96b3da48c559',
  selfieMediaUrl: process.env.SELFIE_MEDIA_URL || 'media://7bdc0bf3f99c575706f2c27feb1b7f82037a2020',
  kycDocument: {
    localPath: path.resolve(__dirname, 'Resource', 'KYC Verification Document.pdf'),
    fileName: 'KYC Verification Document.pdf',
    devicePath: '/sdcard/Download/KYC Verification Document.pdf',
  },
  buildNewCustomer,
};