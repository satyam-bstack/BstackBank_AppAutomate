require('dotenv').config();

/**
 * BrowserStack Capabilities Configuration
 * Centralised capability definitions for Android and iOS
 */

const bstackOptions = (buildSuffix, sessionName) => ({
  userName: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  projectName: 'BStackBank Automation',
  buildName: `BStackBank ${buildSuffix} - ${new Date().toISOString().split('T')[0]}`,
  sessionName,
  debug: false,
  networkLogs: process.env.ENABLE_NETWORK_LOGS !== 'false',
  deviceLogs: process.env.ENABLE_DEVICE_LOGS === 'true',
  appiumLogs: false,
});

const capabilities = {
  android: {
    platformName: 'android',
    'appium:deviceName': 'Samsung Galaxy S23',
    'appium:platformVersion': '13.0',
    'appium:app': process.env.BS_APP_ID,
    'appium:automationName': 'UiAutomator2',
    'appium:noReset': true,
    'appium:newCommandTimeout': 300,
    'bstack:options': {
      ...bstackOptions('Android', 'BStackBank Android Test'),
      ...(process.env.ENABLE_BIOMETRIC === 'true' && { enableBiometric: true }),
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
