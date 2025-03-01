
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

export type DocumentType = 'pdf' | 'docx' | 'jpg' | 'jpeg' | 'png';

export interface UserDocument {
  id: string;
  userId: string;
  fileName: string;
  fileType: DocumentType;
  fileSize: number; // in KB
  url: string;
  createdAt: Date;
  category?: string;
}

export type AuthMode = 'signin' | 'signup';
