# BStackBank Mobile Automation

A WebdriverIO + Appium + Cucumber BDD test suite for the **BStackBank** Android banking app, running on [BrowserStack App Automate](https://app-automate.browserstack.com). Includes BDD test case tagging for [BrowserStack Test Management](https://test-management.browserstack.com) and a parameterised GitHub Actions CI pipeline.

---

## What This Project Does

- **Automated BDD tests** for Login, Money Transfer, and Transaction History flows
- **BrowserStack App Automate** — runs on real Android devices in the cloud
- **BrowserStack Test Management** — each scenario is tagged with a TC ID (`@TCID_TC-XXXXX`) so test run results automatically map to existing test cases
- **Cucumber JSON reporter** — generates BDD JSON reports consumed by BrowserStack TM
- **GitHub Actions CI** — parameterised workflow to run any scenario subset with configurable capabilities

---

## Project Structure

```
BStackBank-Automation-TC/
├── .github/
│   └── workflows/
│       └── bstackbank-tests.yml   # GitHub Actions CI pipeline
├── features/                      # Gherkin feature files
│   ├── login.feature              # Login scenarios (TC-15942–TC-15946)
│   ├── transfer.feature           # Fund transfer scenarios (TC-15952–TC-15955)
│   └── transactions.feature       # Transaction history scenarios (TC-15947–TC-15951)
├── step-definitions/
│   ├── hooks.js                   # Before/After hooks, biometric handling
│   ├── login.steps.js             # Login step definitions
│   ├── transfer.steps.js          # Transfer step definitions
│   └── transactions.steps.js      # Transaction history step definitions
├── page-objects/
│   ├── BasePage.js                # Shared utilities (tap, type, scroll)
│   ├── LoginPage.js               # Login screen selectors + actions
│   ├── HomePage.js                # Home/Dashboard selectors + actions
│   ├── TransferPage.js            # Transfer screen selectors + actions
│   └── TransactionsPage.js        # Transaction history selectors + actions
├── config/
│   └── capabilities.js            # BrowserStack capability definitions (env-driven)
├── reports/
│   ├── cucumber-json/             # BDD JSON reports (auto-generated)
│   └── screenshots/               # Failure screenshots (auto-saved)
├── wdio.conf.js                   # WebdriverIO configuration
├── package.json                   # Dependencies and npm scripts
├── .env                           # Local credentials (gitignored — never commit)
└── RUNNER.md                      # Detailed local runner guide
```

---

## Prerequisites

- **Node.js** v18 or higher
- **BrowserStack account** with App Automate access
- App binary uploaded to BrowserStack — note the `bs://` app ID

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/satyam-bstack/BstackBank_AppAutomate.git
cd BstackBank_AppAutomate
npm install
```

### 2. Configure credentials

Create a `.env` file in the project root (never commit this file):

```env
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
BS_APP_ID=bs://your_app_id
```

### 3. Run tests locally

```bash
# Run all tests
npm test

# Run by feature
npm run test:login
npm run test:transfer
npm run test:transactions

# Run by tag
npm run test:smoke
npm run test:regression

# Run on iOS
npm run test:ios
```

### 4. Enable biometric locally

Set `ENABLE_BIOMETRIC=true` before running:

```bash
ENABLE_BIOMETRIC=true npm run test:login
```

When `ENABLE_BIOMETRIC=true`, the suite uses the BrowserStack biometric executor to simulate a fingerprint PASS. When `false` (default), it taps "Skip this step" to bypass the biometric screen.

---

## GitHub Actions CI — Demo Guide

The workflow at `.github/workflows/bstackbank-tests.yml` is triggered manually via **workflow_dispatch** with the following input parameters:

| Parameter | Options | Default | Description |
|---|---|---|---|
| `scenario` | `all`, `login`, `transfer`, `transactions`, `smoke`, `regression` | `all` | Which feature/tag to run |
| `platform` | `android`, `ios` | `android` | Target platform |
| `enable_biometric` | `true` / `false` | `false` | Enable BrowserStack biometric capability |
| `enable_network_logs` | `true` / `false` | `true` | Capture network logs |
| `enable_device_logs` | `true` / `false` | `false` | Capture device logs |

### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `BROWSERSTACK_USERNAME` | Your BrowserStack username |
| `BROWSERSTACK_ACCESS_KEY` | Your BrowserStack access key |
| `BS_APP_ID` | The `bs://` app ID from your App Automate upload |

### Running a build (demo steps)

1. Go to **Actions → BStackBank Mobile Tests**
2. Click **Run workflow**
3. Select your parameters:
   - **Scenario**: e.g. `login` to run only login tests
   - **Platform**: `android`
   - **Enable Biometric**: `true` to test biometric login flow
4. Click **Run workflow**
5. Watch the build — results appear in the BrowserStack App Automate dashboard

### Artifacts

After each run, the workflow uploads:
- **Cucumber JSON reports** → `cucumber-json-reports-<scenario>-<platform>` (retained 30 days)
- **Failure screenshots** → `failure-screenshots-<scenario>-<platform>` (retained 7 days, only on failure)

---

## Test Case Mapping (BrowserStack Test Management)

Each scenario is tagged with `@TCID_TC-XXXXX` which maps to an existing test case in BrowserStack Test Management. The `cucumberjs-json` reporter generates a BDD JSON report after each run, and `testManagement: true` in the BrowserStack service config uploads results to the correct TC IDs automatically.

| Feature | TC IDs |
|---|---|
| Login | TC-15942 to TC-15946 |
| Transaction History | TC-15947 to TC-15951 |
| Money Transfer | TC-15952 to TC-15955 |

---

## Available Tags

| Tag | Scenarios |
|---|---|
| `@smoke` | Critical path — fast sanity check |
| `@regression` | Full regression suite |
| `@login` | All login scenarios |
| `@transfer` | All transfer scenarios |
| `@transactions` | All transaction history scenarios |

---

## Viewing Results

| Where | What you see |
|---|---|
| **Terminal** | Live Cucumber spec reporter output |
| [App Automate Dashboard](https://app-automate.browserstack.com/dashboard) | Video, logs, screenshots per session |
| [Test Management](https://test-management.browserstack.com) | Test run results mapped to TC IDs |
| `reports/cucumber-json/` | BDD JSON report files |
| `reports/screenshots/` | Auto-saved failure screenshots |

---

## Troubleshooting

| Error | Fix |
|---|---|
| `Invalid credentials` | Check `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` |
| `App not found` | Re-upload the APK and update `BS_APP_ID` |
| `Element not found` | Run an exploratory session to capture real selectors |
| `Biometric screen did not appear` | Ensure `ENABLE_BIOMETRIC=true` and `enableBiometric: true` is set in capabilities |
| `setCustomTag invalid action` | Use `browser.setCustomTags()` — the raw executor action is not supported |
