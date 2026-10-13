/**
 * VisualHelper - App Percy snapshot wrapper.
 * No-op unless ENABLE_PERCY=true, so tests run unchanged without visual testing.
 *
 * Follows the App Percy WebdriverIO guide: run the suite through `percy app:exec`
 * (PERCY_TOKEN in the environment) and call percyScreenshot(driver, name).
 */
let percyScreenshot;
try {
  const mod = require('@percy/appium-app');
  percyScreenshot = mod.percyScreenshot || mod.default || mod;
} catch {
  percyScreenshot = null;
}

const isEnabled = () => process.env.ENABLE_PERCY === 'true';

// Screens already captured in this session (worker) — each screen is captured only once
const captured = new Set();

/**
 * Capture an App Percy snapshot of the current screen, once per unique name per session.
 * Call this from a step definition wherever a new screen is reached:
 *   await snapshot('Home Dashboard');
 * Adding a new screen to a test = one call with a new, stable name.
 * @param {string} name - Snapshot name (kept stable across runs for baseline comparison)
 */
async function snapshot(name) {
  if (!isEnabled()) return;
  if (captured.has(name)) return;
  captured.add(name);
  if (typeof percyScreenshot !== 'function') {
    console.log(`[Percy] @percy/appium-app not available — skipping "${name}"`);
    return;
  }
  try {
    await percyScreenshot(driver, name);
  } catch (e) {
    console.log(`[Percy] Snapshot "${name}" failed: ${e.message}`);
  }
}

module.exports = { snapshot, isEnabled };
