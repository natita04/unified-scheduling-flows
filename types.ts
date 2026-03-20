
export enum ServiceMode {
  IN_FIELD = 'In-Field',
  ONSITE = 'Onsite',
  PHONE = 'Phone',
  VIDEO = 'Video'
}

export enum WorkType {
  INSTALLATION = 'Installation',
  WORKSHOP = 'Workshop - Group Appt',
  VIRTUAL = 'Consultation',
  TRIAL = 'Trial',
  GENERAL = 'General',
  BREAK_FIX = 'Break Fix (Arrival Windows Example)',
  BLOOD_TEST = 'Blood Test (BTB, BTA)',
  INSPECTION = 'Inspection',
  MORTGAGE_ADVICE = 'Mortgage Advice'
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  address?: string;
}

export enum ResourceType {
  PERSON = 'Person',
  ASSET = 'Asset'
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  avatar: string;
  type: ResourceType;
}

export interface RecurrenceConfig {
  interval: number;
  unit: 'day' | 'week' | 'month';
  days: string[]; // ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  endType: 'never' | 'on' | 'after';
  endDate: string;
  occurrences: number;
}

export interface SchedulingState {
  isMultiCustomer: boolean;
  customers: Customer[];
  isOpenForSigning: boolean;
  workType: WorkType | null;
  serviceMode: ServiceMode | null;
  resources: Resource[];
  capacity?: number;
  minParticipants?: number;
  maxParticipants?: number;
  minParticipantsEnabled: boolean;
  maxParticipantsEnabled: boolean;
  location: string;
  radius?: string;
  date: string;
  timeSlot: string;
  schedulingTab: 'SLOTS' | 'RESOURCES';
  isRecurring: boolean;
  recurrenceConfig?: RecurrenceConfig;
  fastTrackUsed: boolean;
  isMultiResource: boolean;
  optionalResourceIds?: string[];
  additionalEmails?: string[];
  allowExternalGuests?: boolean;
  territory?: string;
}

export enum Step {
  CUSTOMER_AND_WORK = 0,
  LOCATION = 1,
  SCHEDULING = 2,
  REQUIREMENTS = 3,
  FINALIZATION = 4
}
