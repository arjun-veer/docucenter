export const APP_NAME = "JobExam";
export const APP_DESCRIPTION =
  "Your one-stop platform for jobs, exams, and campus placements";
export const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const EXAM_CATEGORIES = [
  "Engineering",
  "Medical",
  "Civil Services",
  "Banking",
  "Railways",
  "Defence",
  "Teaching",
  "State Services",
  "School Board",
  "Law",
  "Management",
  "Other",
] as const;

export const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
] as const;

export const APPLICATION_STATUSES = [
  { value: "pending", label: "Pending", color: "secondary" },
  { value: "shortlisted", label: "Shortlisted", color: "default" },
  { value: "rejected", label: "Rejected", color: "destructive" },
  { value: "accepted", label: "Accepted", color: "default" },
  { value: "withdrawn", label: "Withdrawn", color: "outline" },
] as const;

export const DRIVE_STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const DOCUMENT_CATEGORIES = [
  "Resume",
  "Certificate",
  "Marksheet",
  "ID Proof",
  "Experience Letter",
  "Recommendation",
  "Other",
] as const;

export const USER_ROLES = [
  { value: "user", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
  { value: "ambassador", label: "College Ambassador" },
] as const;

export const NAV_LINKS = {
  public: [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "/exams", label: "Exams" },
    { href: "/blogs", label: "Blogs" },
  ],
  authenticated: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/exams", label: "Exams" },
    { href: "/placement", label: "Placement" },
    { href: "/blogs", label: "Blogs" },
    { href: "/documents", label: "Documents" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/ambassadors", label: "Ambassadors" },
    { href: "/admin/colleges", label: "Colleges" },
    { href: "/admin/exams", label: "Exams" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/agents", label: "Agents" },
    { href: "/admin/content", label: "Content" },
  ],
  ambassador: [
    { href: "/ambassador", label: "Dashboard" },
    { href: "/ambassador/placements", label: "Placements" },
    { href: "/ambassador/jobs", label: "Jobs" },
  ],
} as const;

export const ITEMS_PER_PAGE = 12;

export const MAX_FILE_SIZES = {
  avatar: 2 * 1024 * 1024, // 2MB
  document: 10 * 1024 * 1024, // 10MB
  blogImage: 5 * 1024 * 1024, // 5MB
  resume: 5 * 1024 * 1024, // 5MB
  logo: 1 * 1024 * 1024, // 1MB
} as const;
