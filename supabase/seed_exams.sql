
-- Add 10 popular ongoing exams
INSERT INTO public.exams (
  name, 
  category, 
  description, 
  registration_start_date, 
  registration_end_date, 
  exam_date, 
  result_date, 
  website_url, 
  eligibility, 
  application_fee,
  is_verified
) VALUES
(
  'UPSC Civil Services Exam 2025',
  'Civil Services',
  'The Civil Services Examination is a nationwide competitive examination in India conducted by the Union Public Service Commission for recruitment to various Civil Services of the Government of India, including the Indian Administrative Service, Indian Foreign Service, and Indian Police Service.',
  '2025-02-01',
  '2025-03-21',
  '2025-06-15',
  '2025-10-10',
  'https://upsc.gov.in/',
  'Candidates must hold a degree from a recognized university. Age: 21-32 years (with relaxations for certain categories).',
  'General: ₹100; SC/ST/PwD/Women: No Fee',
  true
),
(
  'JEE Main 2025 (Session 1)',
  'Engineering',
  'Joint Entrance Examination – Main, is an Indian standardized computer-based test for admission to various technical undergraduate programs in engineering, architecture, and planning across colleges in India.',
  '2024-11-01',
  '2025-01-15',
  '2025-02-10',
  '2025-03-05',
  'https://jeemain.nta.nic.in/',
  'Candidates must have passed class 12th or equivalent with Physics, Chemistry and Mathematics.',
  'General: ₹1000; SC/ST/PwD: ₹500',
  true
),
(
  'NEET UG 2025',
  'Medical',
  'National Eligibility cum Entrance Test (UG) is an entrance examination in India for students who wish to study undergraduate medical courses and dental courses in government or private medical colleges and dental colleges in India.',
  '2024-12-01',
  '2025-02-15',
  '2025-05-03',
  '2025-06-10',
  'https://neet.nta.nic.in/',
  'Candidates must have passed class 12th or equivalent with Physics, Chemistry, Biology/Biotechnology with English as a core subject.',
  'General: ₹1600; SC/ST/PwD: ₹900',
  true
),
(
  'CAT 2025',
  'Management',
  'Common Admission Test (CAT) is a computer-based test for admission in graduate management programs in India. The test is mainly taken by candidates interested in pursuing a Master of Business Administration degree.',
  '2025-08-01',
  '2025-09-15',
  '2025-11-26',
  '2026-01-10',
  'https://iimcat.ac.in/',
  'Candidates must hold a Bachelor's degree with at least 50% marks (45% for reserved categories).',
  'General: ₹2200; SC/ST/PwD: ₹1100',
  true
),
(
  'GATE 2025',
  'Engineering',
  'Graduate Aptitude Test in Engineering (GATE) is an examination that primarily tests the comprehensive understanding of various undergraduate subjects in engineering and science for admission into the Masters Program and Job in Public Sector Companies.',
  '2024-09-01',
  '2025-01-15',
  '2025-02-01',
  '2025-03-20',
  'https://gate.iitb.ac.in/',
  'Candidates must hold a Bachelor's degree in Engineering/Technology/Architecture or Master's degree in Science/Mathematics/Statistics/Computer Applications.',
  'General: ₹1800; SC/ST/PwD/Women: ₹900',
  true
),
(
  'SBI PO 2025',
  'Banking',
  'State Bank of India Probationary Officer examination is conducted for recruitment to the post of Probationary Officer in State Bank of India, the largest public sector bank in India.',
  '2025-01-01',
  '2025-02-21',
  '2025-03-25',
  '2025-04-30',
  'https://sbi.co.in/careers',
  'Candidates must hold a graduation degree in any discipline from a recognized university. Age: 21-30 years (with relaxations for certain categories).',
  'General: ₹750; SC/ST/PwD: ₹125',
  true
),
(
  'CLAT 2025',
  'Law',
  'Common Law Admission Test (CLAT) is a centralised test for admission to 22 National Law Universities in India. It is conducted by the Consortium of National Law Universities.',
  '2025-01-01',
  '2025-03-31',
  '2025-05-10',
  '2025-06-15',
  'https://consortiumofnlus.ac.in/',
  'Candidates must have passed class 12th or equivalent for UG program and must have a law degree for PG program.',
  'General: ₹4000; SC/ST/PwD: ₹3500',
  true
),
(
  'SSC CGL 2025',
  'Civil Services',
  'Staff Selection Commission - Combined Graduate Level Examination is conducted to recruit staff for various posts in ministries, departments, and organizations of the Government of India.',
  '2025-01-15',
  '2025-02-28',
  '2025-04-10',
  '2025-06-15',
  'https://ssc.nic.in/',
  'Candidates must hold a Bachelor's degree from a recognized university. Age: 18-32 years (with relaxations for certain categories).',
  'General: ₹100; SC/ST/PwD/Women: No Fee',
  true
),
(
  'IBPS PO 2025',
  'Banking',
  'Institute of Banking Personnel Selection - Probationary Officer examination is conducted for recruitment to the post of Probationary Officer in participating public sector banks.',
  '2025-07-01',
  '2025-08-21',
  '2025-10-12',
  '2025-11-30',
  'https://www.ibps.in/',
  'Candidates must hold a graduation degree in any discipline from a recognized university. Age: 20-30 years (with relaxations for certain categories).',
  'General: ₹850; SC/ST/PwD: ₹175',
  true
),
(
  'UGC NET 2025',
  'Teaching',
  'University Grants Commission - National Eligibility Test is conducted to determine eligibility for the post of Assistant Professor and Junior Research Fellowship (JRF) in Indian universities and colleges.',
  '2025-03-01',
  '2025-04-30',
  '2025-06-20',
  '2025-08-15',
  'https://ugcnet.nta.nic.in/',
  'Candidates must have completed a Master's degree or equivalent with at least 55% marks (50% for reserved categories).',
  'General: ₹1100; SC/ST/PwD/Transgender: ₹550',
  true
);
