
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  verified: boolean;
  createdAt: Date;
}

export type ExamCategory = 
  | 'Engineering' 
  | 'Medical' 
  | 'Civil Services'
  | 'Banking'
  | 'Railways'
  | 'Defence'
  | 'Teaching'
  | 'State Services'
  | 'School Board'
  | 'Law'
  | 'Management'
  | 'Other';

export interface Exam {
  id: string;
  name: string;
  category: ExamCategory;
  registrationStartDate: Date;
  registrationEndDate: Date;
  examDate?: Date;
  resultDate?: Date;
  websiteUrl: string;
  description: string;
  eligibility?: string;
  applicationFee?: string;
  isSubscribed?: boolean;
}

export type DocumentType = 'pdf' | 'docx' | 'doc' | 'jpg' | 'jpeg' | 'png' | 'webp';

export interface UserDocument {
  id: string;
  userId?: string; // Make userId optional to match current implementation
  fileName: string;
  fileType: string; // Change to string to allow for more file types
  fileSize: number; // in KB
  url: string;
  createdAt: Date;
  category?: string;
}

export type AuthMode = 'signin' | 'signup';
