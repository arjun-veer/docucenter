// Re-export database types
export type { UserRole } from "./supabase/types";

// ============================================================================
// App-level TypeScript types
// These are the types used by components (NOT database types).
// ============================================================================

export interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "super_admin" | "ambassador";
  fullName: string | null;
  avatarUrl: string | null;
  collegeId: string | null;
  collegeName?: string | null;
}

export interface College {
  id: string;
  name: string;
  code: string;
  city: string | null;
  state: string | null;
  university: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  studentCount: number | null;
}

export interface Exam {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  registrationStart: string;
  registrationEnd: string;
  examDate: string | null;
  resultDate: string | null;
  answerKeyDate: string | null;
  websiteUrl: string;
  eligibility: string | null;
  applicationFee: string | null;
  syllabusUrl: string | null;
  isVerified: boolean;
  tags: string[];
  isSubscribed?: boolean;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  companyLogoUrl: string | null;
  description: string;
  requirements: string | null;
  location: string | null;
  remoteAllowed: boolean;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  experienceMin: number | null;
  experienceMax: number | null;
  skillsRequired: string[];
  eligibility: string | null;
  applicationUrl: string | null;
  applicationDeadline: string | null;
  status: string;
  postedBy: string;
  collegeId: string | null;
  isFeatured: boolean;
  viewsCount: number;
  applicationsCount: number;
  tags: string[];
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  job?: Job;
}

export interface PlacementDrive {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  companyLogoUrl: string | null;
  description: string;
  collegeId: string;
  driveDate: string | null;
  registrationDeadline: string | null;
  eligibility: string | null;
  minCgpa: number | null;
  packageOffered: string | null;
  rolesOffered: string[];
  processRounds: string[];
  status: string;
  createdBy: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
}

export interface PlacementApplication {
  id: string;
  driveId: string;
  userId: string;
  resumeUrl: string | null;
  status: string;
  currentRound: string | null;
  notes: string | null;
  createdAt: string;
  drive?: PlacementDrive;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorId: string;
  author?: { fullName: string | null; avatarUrl: string | null };
  status: string;
  examTags: string[];
  tags: string[];
  isFeatured: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
  isLiked?: boolean;
}

export interface BlogComment {
  id: string;
  blogId: string;
  userId: string;
  parentId: string | null;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { fullName: string | null; avatarUrl: string | null };
  replies?: BlogComment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  category: string;
  description: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  sourceType: string;
  sourceConfig: Record<string, unknown>;
  schedule: string | null;
  status: string;
  lastRunAt: string | null;
  lastRunResult: string | null;
  examsFound: number;
  createdBy: string | null;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  entityType: "job" | "exam" | "blog" | "drive";
  entityId: string;
  createdAt: string;
}
