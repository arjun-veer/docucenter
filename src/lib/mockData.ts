import { Exam, User, UserDocument } from './types';

// Mock current user
export const currentUser: User = {
  id: 'user-1',
  email: 'student@example.com',
  name: 'Demo Student',
  role: 'user',
  verified: true,
  createdAt: new Date('2023-01-15')
};

// Mock exams
export const mockExams: Exam[] = [
  {
    id: 'exam-1',
    name: 'JEE Main 2024',
    category: 'Engineering',
    registrationStartDate: new Date('2023-11-01'),
    registrationEndDate: new Date('2023-12-15'),
    examDate: new Date('2024-01-24'),
    resultDate: new Date('2024-02-15'),
    websiteUrl: 'https://jeemain.nta.nic.in',
    description: 'Joint Entrance Examination for admission to undergraduate engineering programs across India.',
    eligibility: 'Candidates who have passed class 12th examination or equivalent.',
    applicationFee: '₹650 for General, ₹325 for SC/ST/PwD',
    isSubscribed: true
  },
  {
    id: 'exam-2',
    name: 'NEET 2024',
    category: 'Medical',
    registrationStartDate: new Date('2023-12-01'),
    registrationEndDate: new Date('2024-01-15'),
    examDate: new Date('2024-05-05'),
    resultDate: new Date('2024-06-10'),
    websiteUrl: 'https://neet.nta.nic.in',
    description: 'National Eligibility cum Entrance Test for admission to MBBS and BDS courses in India.',
    eligibility: 'Candidates who have passed class 12th examination with Physics, Chemistry, and Biology.',
    applicationFee: '₹1500 for General, ₹800 for SC/ST/PwD',
    isSubscribed: false
  },
  {
    id: 'exam-3',
    name: 'UPSC Civil Services 2024',
    category: 'Civil Services',
    registrationStartDate: new Date('2024-02-01'),
    registrationEndDate: new Date('2024-03-15'),
    examDate: new Date('2024-06-02'),
    resultDate: new Date('2024-12-15'),
    websiteUrl: 'https://upsc.gov.in',
    description: 'Civil Services Examination for recruitment to various Civil Services of the Government of India.',
    eligibility: 'Graduates in any discipline, age between 21-32 years (with relaxation for reserved categories).',
    applicationFee: '₹100 (exempted for SC/ST/PwD and women candidates)',
    isSubscribed: true
  },
  {
    id: 'exam-4',
    name: 'IBPS PO 2024',
    category: 'Banking',
    registrationStartDate: new Date('2024-01-01'),
    registrationEndDate: new Date('2024-02-10'),
    examDate: new Date('2024-03-15'),
    resultDate: new Date('2024-04-30'),
    websiteUrl: 'https://ibps.in',
    description: 'Institute of Banking Personnel Selection Probationary Officer recruitment examination.',
    eligibility: 'Graduates in any discipline, age between 20-30 years.',
    applicationFee: '₹850 for General, ₹175 for SC/ST/PwD',
    isSubscribed: false
  },
  {
    id: 'exam-5',
    name: 'CBSE Class 12 Board Exam 2024',
    category: 'School Board',
    registrationStartDate: new Date('2023-10-01'),
    registrationEndDate: new Date('2023-11-15'),
    examDate: new Date('2024-03-01'),
    resultDate: new Date('2024-05-15'),
    websiteUrl: 'https://cbse.gov.in',
    description: 'Central Board of Secondary Education Class 12 final examinations.',
    eligibility: 'Registered CBSE students who have completed Class 11.',
    applicationFee: 'As per school registration',
    isSubscribed: true
  },
  {
    id: 'exam-6',
    name: 'CAT 2024',
    category: 'Management',
    registrationStartDate: new Date('2024-08-01'),
    registrationEndDate: new Date('2024-09-15'),
    examDate: new Date('2024-11-24'),
    resultDate: new Date('2025-01-05'),
    websiteUrl: 'https://iimcat.ac.in',
    description: 'Common Admission Test for admission to postgraduate management programs at IIMs and other top business schools.',
    eligibility: 'Graduates in any discipline with minimum 50% marks (45% for reserved categories).',
    applicationFee: '₹2200 for General, ₹1100 for SC/ST/PwD',
    isSubscribed: false
  }
];

// Mock user documents
export const mockDocuments: UserDocument[] = [
  {
    id: 'doc-1',
    userId: 'user-1',
    fileName: 'Class_10_Marksheet.pdf',
    fileType: 'pdf',
    fileSize: 1240, // in KB
    url: '/placeholder.svg',
    createdAt: new Date('2023-05-10'),
    category: 'Certificates'
  },
  {
    id: 'doc-2',
    userId: 'user-1',
    fileName: 'Class_12_Marksheet.pdf',
    fileType: 'pdf',
    fileSize: 1560,
    url: '/placeholder.svg',
    createdAt: new Date('2023-05-11'),
    category: 'Certificates'
  },
  {
    id: 'doc-3',
    userId: 'user-1',
    fileName: 'Passport_Photo.jpg',
    fileType: 'jpg',
    fileSize: 780,
    url: '/placeholder.svg',
    createdAt: new Date('2023-06-20'),
    category: 'Identity'
  },
  {
    id: 'doc-4',
    userId: 'user-1',
    fileName: 'Aadhar_Card.pdf',
    fileType: 'pdf',
    fileSize: 1020,
    url: '/placeholder.svg',
    createdAt: new Date('2023-06-25'),
    category: 'Identity'
  },
  {
    id: 'doc-5',
    userId: 'user-1',
    fileName: 'JEE_Admit_Card.pdf',
    fileType: 'pdf',
    fileSize: 890,
    url: '/placeholder.svg',
    createdAt: new Date('2024-01-10'),
    category: 'Exam Documents'
  }
];

// Helper function to get documents by category
export const getDocumentsByCategory = () => {
  const documentsByCategory: Record<string, UserDocument[]> = {};
  
  mockDocuments.forEach(doc => {
    const category = doc.category || 'Uncategorized';
    if (!documentsByCategory[category]) {
      documentsByCategory[category] = [];
    }
    documentsByCategory[category].push(doc);
  });
  
  return documentsByCategory;
};

// Helper function to get upcoming exams (sorted by date)
export const getUpcomingExams = () => {
  const now = new Date();
  return [...mockExams]
    .filter(exam => exam.examDate && exam.examDate > now)
    .sort((a, b) => {
      if (!a.examDate || !b.examDate) return 0;
      return a.examDate.getTime() - b.examDate.getTime();
    })
    .slice(0, 3);
};

// Helper function to get subscribed exams
export const getSubscribedExams = () => {
  return mockExams.filter(exam => exam.isSubscribed);
};
