// Application Status
export enum ApplicationStatus {
  SAVED = 'SAVED',
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  TECHNICAL_TEST = 'TECHNICAL_TEST',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SAVED]: 'Saved',
  [ApplicationStatus.APPLIED]: 'Applied',
  [ApplicationStatus.INTERVIEW]: 'Interview',
  [ApplicationStatus.TECHNICAL_TEST]: 'Technical Test',
  [ApplicationStatus.OFFER]: 'Offer',
  [ApplicationStatus.REJECTED]: 'Rejected',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SAVED]: '#6B7280',
  [ApplicationStatus.APPLIED]: '#3B82F6',
  [ApplicationStatus.INTERVIEW]: '#8B5CF6',
  [ApplicationStatus.TECHNICAL_TEST]: '#F59E0B',
  [ApplicationStatus.OFFER]: '#10B981',
  [ApplicationStatus.REJECTED]: '#EF4444',
};

// Shared Types
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// Application Types
export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  deadline?: string;
  contactPerson?: string;
  contactEmail?: string;
  resumeId?: string;
  coverLetterId?: string;
  appliedAt?: string;
  interviewAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Resume Types
export interface Resume {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  isDefault: boolean;
  parsedText?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface AnalyticsSummary {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  interviewConversionRate: number;
  offerRate: number;
  rejectionRate: number;
  weeklyTrend: WeeklyTrend[];
  upcomingInterviews: JobApplication[];
}

export interface WeeklyTrend {
  week: string;
  count: number;
}

// AI Types
export interface CoverLetterRequest {
  applicationId: string;
  additionalContext?: string;
}

export interface MatchScoreRequest {
  applicationId: string;
  resumeId: string;
}

export interface MatchScoreResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface InterviewQuestionsRequest {
  applicationId: string;
  questionCount?: number;
}

export interface JobSummaryRequest {
  jobDescription: string;
}
