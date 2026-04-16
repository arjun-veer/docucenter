export type UserRole = 'user' | 'admin' | 'super_admin' | 'ambassador';

export interface AdminStats {
  totalUsers: number;
  totalExams: number;
  totalJobs: number;
  totalColleges: number;
}
