
/**
 * Feature flags — set to `true` to re-enable hidden functionality.
 *
 * FEATURE_VIEW_LATEST_APPOINTMENTS
 *   Shows the "View Latest Appointments / Book Again" link in step 1.
 *   Flows: CustomerStep → showLatest panel → onBookAgain → jumps to SchedulingStep
 *   with pre-selected workType + serviceMode + resource.
 *
 * FEATURE_PHONE_VIDEO_CHANNELS
 *   Shows the Phone and Video work channel buttons in the SELECT WORK CHANNEL grid.
 *   Relevant work types: Consultation (defaults to Phone), Mortgage Advice (Video only).
 *
 * FEATURE_MAKE_RECURRING
 *   Shows the "Make recurring" checkbox in the Scheduling step (both Slots and Resources tabs).
 *   Hidden for In-Field; in Resources tab only shown when exactly 1 resource is selected.
 *   Default recurrence: every 1 week, same weekday as selected date, ends after 6 occurrences.
 */
export const FEATURE_FLAGS = {
  FEATURE_VIEW_LATEST_APPOINTMENTS: false,
  FEATURE_PHONE_VIDEO_CHANNELS: false,
  FEATURE_MAKE_RECURRING: false,
} as const;
