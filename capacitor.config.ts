// ============================================================================
// 📁 Hardware Source: capacitor.config.ts
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic: Capacitor configuration with StatusBar overlay.
// ============================================================================

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.northroad.ai',
  appName: 'North Road AI',
  webDir: 'out',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
    },
  },
};

export default config;
