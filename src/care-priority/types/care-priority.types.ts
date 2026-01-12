/**
 * Care Priority Levels
 *
 * CLINICAL SAFETY PRINCIPLES:
 * - These are NOT diagnoses
 * - These are NOT risk scores
 * - These are care escalation recommendations
 * - When uncertain, escalate to higher priority
 *
 * LEVELS:
 * - ROUTINE: Normal monitoring, next scheduled appointment
 * - INCREASED_MONITORING: More frequent self-monitoring, contact provider soon
 * - URGENT_REVIEW: Contact healthcare provider within 24 hours
 * - EMERGENCY: Seek immediate medical attention
 */
export enum CarePriority {
  ROUTINE = "ROUTINE",
  INCREASED_MONITORING = "INCREASED_MONITORING",
  URGENT_REVIEW = "URGENT_REVIEW",
  EMERGENCY = "EMERGENCY",
}

/**
 * Care Priority Result
 *
 * Returned by the care priority engine
 */
export interface CarePriorityResult {
  priority: CarePriority;
  reasons: string[]; // List of factors that contributed to this priority
  timestamp: Date;
}
