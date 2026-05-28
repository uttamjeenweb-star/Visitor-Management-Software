import axios from "axios";
const defaultLogger = {
  http: (label, data) => console.debug(`[HTTP ${label}]`, data),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  error: (message, data) => console.error(`[ERROR] ${message}`, data),
};
// ─── Factory ──────────────────────────────────────────────────────────────────
export function createApiClient(clientConfig, logger = defaultLogger) {
  const {
    baseURL,
    timeout = 20_000,
    withCredentials = true,
    httpMetricsEnabled = true,
    slowThresholdMs = 1_000,
  } = clientConfig;
  const apiClient = axios.create({ baseURL, withCredentials, timeout });
  
  let isRefreshing = false;
  let refreshSubscribers = [];

  const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
  };

  const onRefreshed = (err) => {
    refreshSubscribers.forEach((cb) => cb(err));
    refreshSubscribers = [];
  };
  // ── Metrics ─────────────────────────────────────────────────────────────────
  const endpointMetrics = new Map();
  let requestSequence = 0;
  const normalizePath = (url = "") => String(url).split("?")[0] || "/";
  const nextRequestId = () => {
    requestSequence += 1;
    return String(requestSequence).padStart(5, "0");
  };
  const summarizeEndpointMetric = (method, url, durationMs, status) => {
    const endpoint = `${String(method || "GET").toUpperCase()} ${normalizePath(url)}`;
    if (!endpointMetrics.has(endpoint)) {
      endpointMetrics.set(endpoint, {
        totalRequests: 0,
        failedRequests: 0,
        slowRequests: 0,
        totalDurationMs: 0,
        maxDurationMs: 0,
      });
    }
    const metric = endpointMetrics.get(endpoint);
    metric.totalRequests += 1;
    metric.totalDurationMs += durationMs;
    metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
    if (status >= 400 || status === 0) metric.failedRequests += 1;
    if (durationMs >= slowThresholdMs) metric.slowRequests += 1;
    return {
      endpoint,
      totalRequests: metric.totalRequests,
      errorRatePct: Number(
        ((metric.failedRequests / metric.totalRequests) * 100).toFixed(1),
      ),
      slowRatePct: Number(
        ((metric.slowRequests / metric.totalRequests) * 100).toFixed(1),
      ),
      avgDurationMs: Number(
        (metric.totalDurationMs / metric.totalRequests).toFixed(1),
      ),
      maxDurationMs: metric.maxDurationMs,
    };
  };
  // UPDATED: Added a dynamic `responseData` argument parameter
  const trackHttpResponse = (
    config,
    status,
    errorMessage = "",
    responseData = null,
  ) => {
    if (!httpMetricsEnabled || !config) return;
    const startTime = config.metadata?.startTimeMs ?? performance.now();
    const durationMs = Math.max(0, Math.round(performance.now() - startTime));
    const method = String(config.method || "GET").toUpperCase();
    const url = config.url || "/";
    const requestId = config.metadata?.requestId ?? "unknown";
    const endpointStats = summarizeEndpointMetric(
      method,
      url,
      durationMs,
      status,
    );
    logger.http("response", {
      requestId,
      method,
      url,
      status,
      durationMs,
      slowThresholdMs,
      errorMessage,
      // FIX: Passing the actual parameter down to your defaultLogger configuration mapping
      responseData,
      endpointStats,
    });
  };
  // ── Request interceptor ─────────────────────────────────────────────────────
  apiClient.interceptors.request.use((config) => {
    config.metadata = {
      requestId: nextRequestId(),
      startTimeMs: performance.now(),
      startedAtISO: new Date().toISOString(),
    };

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (httpMetricsEnabled) {
      logger.http("request", {
        requestId: config.metadata.requestId,
        method: String(config.method || "GET").toUpperCase(),
        url: config.url ?? "/",
        baseURL: config.baseURL ?? baseURL,
        hasBody: Boolean(config.data),
        hasParams: Boolean(config.params),
        startedAtISO: config.metadata.startedAtISO,
      });
    }
    return config;
  });
  // ── Response interceptor ────────────────────────────────────────────────────
  apiClient.interceptors.response.use(
    (res) => {
      // FIX: Added res.data to pass the payload down the metrics sequence
      trackHttpResponse(res.config, res.status, "", res.data);
      return res;
    },
    async (err) => {
      if (!axios.isAxiosError(err)) return Promise.reject(err);
      const original = err.config;
      const status = err.response?.status ?? 0;
      // FIX: Read error message details or server response payload if validation failed
      const errorData = err.response?.data ?? null;

      trackHttpResponse(
        original,
        status,
        err.response?.data?.message ?? err.message,
        errorData,
      );
      logger.error("API Error", {
        requestId: original?.metadata?.requestId,
        url: err.config?.url,
        status,
        code: err.code,
        message: err.response?.data?.message ?? err.message,
      });

      // Handle Token Refresh logic
      if (status === 401 && !original._retry && !original.url?.includes("/auth/refresh") && !original.url?.includes("/auth/login")) {
        if (isRefreshing) {
          try {
            await new Promise((resolve, reject) => {
              subscribeTokenRefresh((err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            return apiClient(original);
          } catch (e) {
            return Promise.reject(e);
          }
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const refreshRes = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
          const newAccessToken = refreshRes.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          
          isRefreshing = false;
          onRefreshed(null);
          
          original.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(original);
        } catch (refreshErr) {
          isRefreshing = false;
          onRefreshed(refreshErr);
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(err);
    },
  );
  return apiClient;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getApiError = (err, fallback = "Something went wrong") => {
  if (!axios.isAxiosError(err)) return fallback;
  const data = err.response?.data;
  const message = data?.message;
  const nestedMessage = data?.error?.message;
  return (
    (typeof message === "string" ? message : undefined) ??
    (typeof nestedMessage === "string" ? nestedMessage : undefined) ??
    err.message ??
    fallback
  );
};
