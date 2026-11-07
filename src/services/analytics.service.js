/**
 * Mailora.ai — Analytics & Telemetry Service
 */

class AnalyticsService {
  track(eventName, properties = {}) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Analytics] Track: "${eventName}"`, properties);
      }
    } catch (_) {}
  }
}

export const analyticsService = new AnalyticsService();
