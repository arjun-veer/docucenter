import { Exam } from "./types";
import { supabase } from "./supabase";
import { ExamCategory } from "./types";
import { format, parse } from 'date-fns';

// Function to determine if a result is likely an exam-related result
const isExamResult = (title: string, snippet: string): boolean => {
  const keywords = ['exam', 'entrance exam', 'admissions', 'syllabus', 'registration', 'notification', 'apply online'];
  const combinedText = `${title.toLowerCase()} ${snippet.toLowerCase()}`;
  return keywords.some(keyword => combinedText.includes(keyword));
};

// Function to extract dates from a text snippet
const extractDates = (text: string): Date[] => {
  const dateRegexes = [
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/gi,
    /\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi,
    /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g,
  ];

  let dates: Date[] = [];
  for (const regex of dateRegexes) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      try {
        const dateText = match[0];
        let parsedDate: Date | null = null;

        // Attempt parsing with different formats
        if (/[a-zA-Z]/.test(dateText)) {
          parsedDate = parse(dateText, 'MMMM dd, yyyy', new Date());
          if (isNaN(parsedDate.getTime())) {
            parsedDate = parse(dateText, 'dd MMMM yyyy', new Date());
          }
        } else {
          const [day, month, year] = dateText.split(/[-/]/);
          parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          dates.push(parsedDate);
        }
      } catch (error) {
        console.error('Error parsing date:', match[0], error);
      }
    }
  }
  return dates;
};

// Function to determine the exam category from the title and snippet
const determineCategory = (title: string, snippet: string): ExamCategory | null => {
  const text = `${title.toLowerCase()} ${snippet.toLowerCase()}`;

  if (text.includes('engineering') || text.includes('jee') || text.includes('iit')) {
    return 'Engineering';
  } else if (text.includes('medical') || text.includes('neet') || text.includes('mbbs')) {
    return 'Medical';
  } else if (text.includes('civil services') || text.includes('upsc') || text.includes('ias')) {
    return 'Civil Services';
  } else if (text.includes('banking') || text.includes('bank') || text.includes('ipo')) {
    return 'Banking';
  } else if (text.includes('railway') || text.includes('rrb')) {
    return 'Railways';
  } else if (text.includes('defence') || text.includes('nda') || text.includes('cds')) {
    return 'Defence';
  } else if (text.includes('teaching') || text.includes('teacher') || text.includes('tet')) {
    return 'Teaching';
  } else if (text.includes('state services') || text.includes('pcs')) {
    return 'State Services';
  } else if (text.includes('school board') || text.includes('cbse') || text.includes('icse')) {
    return 'School Board';
  } else if (text.includes('law') || text.includes('legal') || text.includes('clat')) {
    return 'Law';
  } else if (text.includes('management') || text.includes('mba') || text.includes('cat')) {
    return 'Management';
  } else {
    return 'Other';
  }
};

// Function to extract eligibility criteria from a text snippet
const extractEligibility = (snippet: string): string | null => {
  const eligibilityKeywords = ['eligibility', 'who can apply', 'qualification', 'criteria'];
  const eligibilitySentences = snippet.split('. ').filter(sentence =>
    eligibilityKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );
  return eligibilitySentences.length > 0 ? eligibilitySentences.join('. ') : null;
};

// Function to extract application fee information from a text snippet
const extractApplicationFee = (snippet: string): string | null => {
  const feeKeywords = ['application fee', 'registration fee', 'fee structure', 'fees'];
  const feeSentences = snippet.split('. ').filter(sentence =>
    feeKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );
  return feeSentences.length > 0 ? feeSentences.join('. ') : null;
};

// Function to check if an exam with a similar name exists
export const checkForDuplicateExams = async (examName: string) => {
  try {
    // Check existing exams
    const { data: existingExams } = await supabase
      .from('exams')
      .select('id, name')
      .ilike('name', `%${examName}%`)
      .limit(5);
    
    // Check pending exams
    const { data: pendingExams } = await supabase
      .from('pending_exams')
      .select('id, name')
      .ilike('name', `%${examName}%`)
      .limit(5);
    
    return {
      existingExams: existingExams || [],
      pendingExams: pendingExams || []
    };
  } catch (error) {
    console.error('Error checking for duplicate exams:', error);
    return { existingExams: [], pendingExams: [] };
  }
};

// Search exams using SerpAPI
export const searchExamsWithSerpApi = async (query: string, apiKey: string): Promise<Partial<Exam>[]> => {
  try {
    const searchQuery = `${query} exam dates registration`;
    
    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('engine', 'google');
    url.searchParams.append('num', '10');
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpAPI request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('SerpAPI response:', data);
    
    // Extract results from organic search results
    const results = data.organic_results || [];
    if (results.length === 0) {
      return [];
    }
    
    // Process and convert results to Exam format
    const exams: Partial<Exam>[] = [];
    
    for (const result of results) {
      const title = result.title;
      const snippet = result.snippet;
      const link = result.link;
      
      if (!title || !snippet || !link) continue;
      
      // Skip results that are likely not about exams
      if (!isExamResult(title, snippet)) continue;
      
      // Extract dates from snippet and title
      const dates = extractDates(snippet);
      const titleDates = extractDates(title);
      
      // Combine dates from both sources
      const allDates = [...dates, ...titleDates].sort((a, b) => a.getTime() - b.getTime());
      
      // Skip if we couldn't extract at least one date
      if (allDates.length === 0) continue;
      
      // Try to determine the exam category
      const category = determineCategory(title, snippet) as ExamCategory;
      
      const exam: Partial<Exam> = {
        name: title.replace(/\b(exam|examination)\b/gi, '').trim(),
        description: snippet,
        websiteUrl: link,
        category: category,
      };
      
      // Assign dates based on count
      if (allDates.length >= 1) {
        exam.registrationStartDate = new Date();
        exam.registrationEndDate = allDates[0];
      }
      
      if (allDates.length >= 2) {
        exam.examDate = allDates[1];
      }
      
      if (allDates.length >= 3) {
        exam.resultDate = allDates[2];
      }
      
      // Extract eligibility information
      const eligibility = extractEligibility(snippet);
      if (eligibility) {
        exam.eligibility = eligibility;
      }
      
      // Extract application fee information
      const applicationFee = extractApplicationFee(snippet);
      if (applicationFee) {
        exam.applicationFee = applicationFee;
      }
      
      exams.push(exam);
    }
    
    return exams;
  } catch (error) {
    console.error('Error searching exams with SerpAPI:', error);
    throw new Error('Failed to search for exams');
  }
};
