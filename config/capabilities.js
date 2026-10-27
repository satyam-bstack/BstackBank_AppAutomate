require('dotenv').config();

/**
 * BrowserStack Capabilities Configuration
 * Centralised capability definitions for Android and iOS
 */

const bstackOptions = (buildSuffix, sessionName) => ({
  userName: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  projectName: 'BStackBank Automation',
  buildName: process.env.BROWSERSTACK_BUILD_NAME || `BStackBank Automation`,
  sessionName,
  debug: false,
  networkLogs: process.env.ENABLE_NETWORK_LOGS !== 'false',
  deviceLogs: process.env.ENABLE_DEVICE_LOGS === 'true',
  appiumLogs: false,
});

const capabilities = {
  android: {
    platformName: 'android',
    'appium:deviceName': 'Google Pixel 9',
    'appium:platformVersion': '15.0',
    'appium:app': process.env.BS_APP_ID,
    'appium:automationName': 'UiAutomator2',
    'appium:noReset': true,
    'appium:newCommandTimeout': 300,
    'bstack:options': {
      ...bstackOptions('Android', 'BStackBank Android Test'),
      ...(process.env.ENABLE_BIOMETRIC === 'true' && { enableBiometric: true }),
      // Camera image injection (QR scan + KYC liveness selfie; media URLs: config/test-data.js).
      // Toggle with ENABLE_IMAGE_INJECTION=false (CI input `enable_image_injection`); defaults to on.
      ...(process.env.ENABLE_IMAGE_INJECTION !== 'false' && { enableCameraImageInjection: true }),
    },
  },

  androidTablet: {
    platformName: 'android',
    'appium:deviceName': 'Samsung Galaxy Tab S8',
    'appium:platformVersion': '12.0',
    'appium:app': process.env.BS_APP_ID,
    'appium:automationName': 'UiAutomator2',
    'appium:noReset': false,
    'bstack:options': bstackOptions('Android Tablet', 'BStackBank Android Tablet Test'),
  },

  ios: {
    platformName: 'ios',
    'appium:deviceName': 'iPhone 14',
    'appium:platformVersion': '16',
    'appium:app': process.env.BS_APP_ID,
    'appium:automationName': 'XCUITest',
    'appium:noReset': false,
    'appium:newCommandTimeout': 300,
    'bstack:options': bstackOptions('iOS', 'BStackBank iOS Test'),
  },
};

module.exports = capabilities;