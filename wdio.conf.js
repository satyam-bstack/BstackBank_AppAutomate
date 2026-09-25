// Load .env — works in both launcher and worker processes
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

// Resolve credentials: prefer env vars (CI), fall back to .env values already loaded above
const BS_USER = process.env.BROWSERSTACK_USERNAME;
const BS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;
const platform = process.env.PLATFORM || 'android';

if (!BS_USER || !BS_KEY) {
  throw new Error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set in .env or environment');
}

// Centralised capability definitions live in config/capabilities.js
const capabilities = require('./config/capabilities');

exports.config = {
  runner: 'local',
  hostname: 'hub-cloud.browserstack.com',
  port: 443,
  protocol: 'https',
  path: '/wd/hub',
  user: BS_USER,
  key: BS_KEY,

  specs: ['./features/**/*.feature'],
  exclude: [],

  maxInstances: 1,

  capabilities: [platform === 'ios' ? capabilities.ios : capabilities.android],

  logLevel: 'error',
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    [
      'browserstack',
      {
        testObservability: true,
        testManagement: true,
        //accessibility: true,
        buildIdentifier: '${BUILD_NUMBER}',
        browserstackLocal: false,
        // accessibilityOptions: {
        //   screenReaderAutomation: {
        //     autoReport: true,
        //     // linearNavigation: true,
        //     // linearNavigationTimeout: 300000,
        //   },
        //   wcagVersion: 'wcag22aa',
        //   includeIssueType: {
        //     bestPractice: false,
        //   },
        //   scannerProcessingTimeout: 10,
        // },
      }
    ]
  ],

  framework: 'cucumber',
  reporters: [
    'spec',
    ['cucumberjs-json', {
      jsonFolder: './reports/cucumber-json/',
      language: 'en',
    }]
  ],

  cucumberOpts: {
    require: [
      './step-definitions/**/*.js',
    ],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: 120000,
    ignoreUndefinedDefinitions: false,
  },
};
