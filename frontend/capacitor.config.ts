import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tracker.menstrualhealth",
  appName: "CycleTracker",
  webDir: "dist",
  server: {
    cleartext: true,
    androidScheme: "http",
  },
};

export default config;
