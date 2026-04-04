import { CarePriority } from "../../care-priority/types/care-priority.types";

/**
 * Notification Templates
 *
 * CLINICAL SAFETY CONSTRAINTS:
 * - Predefined templates only
 * - No dynamic medical text generation
 * - No fear-based language
 * - No predictions
 * - Encouraging but not alarming
 *
 * TEMPLATE STRUCTURE:
 * - Subject: Brief, clear subject line
 * - Body: Actionable guidance without diagnosis
 * - CTA: Clear next step
 */

export interface NotificationTemplate {
  subject: string;
  body: string;
  callToAction: string;
}

/**
 * Care Priority Escalation Templates
 */
export const CARE_PRIORITY_TEMPLATES: Record<
  CarePriority,
  NotificationTemplate
> = {
  [CarePriority.EMERGENCY]: {
    subject: "Important: Seek Immediate Medical Attention",
    body: "Based on your recent readings, we recommend seeking immediate medical attention. This is a precautionary measure to ensure you and your baby receive appropriate care.",
    callToAction:
      "Call emergency services or go to the nearest emergency room now.",
  },

  [CarePriority.URGENT_REVIEW]: {
    subject: "Action Needed: Contact Your Healthcare Provider",
    body: "Your recent readings suggest you should speak with your healthcare provider within the next 24 hours. They can review your information and provide personalized guidance.",
    callToAction: "Contact your healthcare provider within 24 hours.",
  },

  [CarePriority.INCREASED_MONITORING]: {
    subject: "Reminder: Continue Monitoring",
    body: "Your readings indicate that more frequent monitoring would be beneficial. Please continue tracking your blood pressure and discuss your readings with your healthcare provider at your next appointment.",
    callToAction: "Monitor regularly and discuss at your next appointment.",
  },

  [CarePriority.ROUTINE]: {
    subject: "Keep Up the Good Work",
    body: "Your readings look good. Continue with your routine prenatal care and monitoring as recommended by your healthcare provider.",
    callToAction: "Continue routine care as planned.",
  },
};

/**
 * Blood Pressure Alert Templates
 */
export const BP_ALERT_TEMPLATES = {
  SEVERE_HYPERTENSION: {
    subject: "Critical: High Blood Pressure Reading",
    body: "Your blood pressure reading is significantly elevated. Please seek immediate medical attention.",
    callToAction: "Seek immediate medical care.",
  },

  ELEVATED_BP: {
    subject: "Notice: Elevated Blood Pressure",
    body: "Your blood pressure reading is elevated. Please monitor closely and contact your healthcare provider if it remains elevated.",
    callToAction: "Monitor and contact provider if readings stay elevated.",
  },
};

/**
 * Symptom Alert Templates
 */
export const SYMPTOM_ALERT_TEMPLATES = {
  DANGEROUS_COMBINATION: {
    subject: "Important: Warning Symptoms Reported",
    body: "You have reported symptoms that may require medical attention. Please contact your healthcare provider or seek immediate care if symptoms worsen.",
    callToAction: "Contact your healthcare provider or seek immediate care.",
  },

  SINGLE_WARNING_SYMPTOM: {
    subject: "Notice: Warning Symptom Reported",
    body: "You have reported a symptom that should be discussed with your healthcare provider. Please mention this at your next appointment or contact them if you have concerns.",
    callToAction: "Discuss with your healthcare provider.",
  },
};

/**
 * Auth Templates
 */
export const AUTH_TEMPLATES = {
  RESET_PASSWORD: {
    subject: "Reset Your Password",
    body: "You requested a password reset. Use the link below to set a new password. This link will expire in 1 hour.",
    callToAction: "Reset your password.",
  },
};

/**
 * Monitoring and Reminder Templates
 */
export const MONITORING_TEMPLATES = {
  INACTIVITY_REMINDER: {
    subject: "It's Been a While",
    body: "We haven't seen a blood pressure entry from you in 5 days. Regular logging is key to a healthy pregnancy.",
    callToAction: "Log your BP now to stay on track.",
  },

  DAILY_REMINDER: {
    subject: "Time to Check Your Blood Pressure",
    body: "It only takes 30 seconds. Staying on top of your readings helps you and your baby stay healthy.",
    callToAction: "Open the app to log your reading.",
  },

  FOLLOW_UP_REMINDER: {
    subject: "Time for Your 4-Hour BP Recheck",
    body: "Your last reading was elevated. Please recheck your blood pressure now to ensure it has returned to normal.",
    callToAction: "Log your follow-up reading now.",
  },

  FOLLOW_UP_URGENT: {
    subject: "Urgent: Missed BP Recheck",
    body: "You missed your 4-hour recheck after an elevated reading. It's important to monitor your blood pressure closely right now.",
    callToAction: "Please log a new reading immediately.",
  },
};

/**
 * Trend Alert Templates
 */
export const TREND_ALERT_TEMPLATES = {
  CREEPING_RISE: {
    subject: "Trend Detected: Gradual Rise in BP",
    body: "Our analysis shows a gradual, consistent rise in your blood pressure over several readings. While not an emergency, this trend should be discussed with your healthcare provider.",
    callToAction: "Please contact your clinic to discuss this trend.",
  },

  REPEATED_HIGH: {
    subject: "Trend Detected: Multiple High Readings",
    body: "You have had several high blood pressure readings within the past week. Consistent high readings require medical review.",
    callToAction: "Contact your healthcare provider within 24 hours.",
  },

  SUDDEN_SPIKE: {
    subject: "Alert: Sudden BP Spike",
    body: "Your latest reading is significantly higher than your personal average. Sudden spikes can be a warning sign.",
    callToAction: "Rest for 15 minutes and recheck. If still high, seek medical advice.",
  },
};
