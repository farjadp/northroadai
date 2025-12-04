type SystemSeverity = "critical" | "warning" | "info";

export type SystemAlert = {
  id: string;
  service: string;
  severity: SystemSeverity;
  message: string;
  detail?: string;
  resolution: string;
  timestamp: string;
};

export type SystemServiceStatus = {
  service: string;
  healthy: boolean;
  message: string;
  lastUpdated: string;
};

const MAX_ALERTS = 30;
const alertStore: SystemAlert[] = [];
const serviceStates = new Map<string, SystemServiceStatus>();

const REMEDY_LIBRARY: Record<string, string> = {
  "Guest Chat API": "Check Gemini key, Firestore connectivity, and daily quota usage in `guest_chats` before retry.",
  "Core Chat API": "Inspect vector store, confirm uploaded files still exist, and validate Gemini quotas/ratelimits.",
  "Arena Fight API": "Make sure the `arena/fight` endpoint is reachable; look for stalled `fetch` requests or dropped websockets.",
  "Upload Handler": "Verify storage buckets, check file permissions, and rerun the failed multipart upload.",
};

const GUIDANCE_DEFAULT = "Review service logs and retry once external dependencies (models, Firestore) are healthy.";

const now = () => new Date().toISOString();
const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function logServiceStatus(service: string, healthy: boolean, message?: string) {
  serviceStates.set(service, {
    service,
    healthy,
    message: message || (healthy ? "Operating within expected thresholds." : "Investigation required."),
    lastUpdated: now(),
  });
}

export function logSystemAlert(options: {
  service: string;
  message: string;
  severity?: SystemSeverity;
  detail?: string;
  resolution?: string;
}) {
  const timestamp = now();
  const id = buildId();
  const severity: SystemSeverity = options.severity || "warning";
  const resolution = options.resolution || REMEDY_LIBRARY[options.service] || GUIDANCE_DEFAULT;

  alertStore.unshift({
    id,
    service: options.service,
    severity,
    message: options.message,
    detail: options.detail,
    resolution,
    timestamp,
  });

  if (alertStore.length > MAX_ALERTS) {
    alertStore.pop();
  }

  logServiceStatus(options.service, severity !== "critical" ? true : false, options.message);
}

export function getSystemStatusSnapshot() {
  return {
    services: Array.from(serviceStates.values()).map((state) => ({
      ...state,
      message: state.message,
      lastUpdated: state.lastUpdated,
    })),
    alerts: [...alertStore],
  };
}
