
import { Exam } from "./types";

// Function to search for exams using SerpAPI
export const searchExamsWithSerpApi = async (query: string, apiKey: string): Promise<Partial<Exam>[]> => {
  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: `${query} exam registration dates`,
      api_key: apiKey,
      location: 'India',
      gl: 'in',
      hl: 'en',
      num: '10',
    });

    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpAPI request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    // Process and extract exams data from search results
    return processSearchResults(data, query);
  } catch (error: any) {
    console.error('Error in SerpAPI request:', error);
    throw new Error(`Search API error: ${error.message}`);
  }
};

// Function to check if an exam with similar name already exists
export const checkForDuplicateExams = async (examName: string): Promise<{ existingExams: any[], pendingExams: any[] }> => {
  try {
    // Simplified version - in a real app, would use more sophisticated matching
    const namePattern = `%${examName.replace(/\s+/g, '%')}%`;
    
    // Check in main exams table
    const { data: existingExams, error: existingError } = await fetch(
      `https://elhylaucggxmrgyhnuwh.supabase.co/rest/v1/exams?name=ilike.${encodeURIComponent(namePattern)}&select=id,name`,
      {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaHlsYXVjZ2d4bXJneWhudXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4Mzc4NDcsImV4cCI6MjA1NjQxMzg0N30.pgVDZkRFXJVXgshfY40w28T__NMeOYDjGYQK-lAACmY',
          'Content-Type': 'application/json'
        }
      }
    ).then(r => r.json());
    
    if (existingError) throw existingError;
    
    // Check in pending exams table
    const { data: pendingExams, error: pendingError } = await fetch(
      `https://elhylaucggxmrgyhnuwh.supabase.co/rest/v1/pending_exams?name=ilike.${encodeURIComponent(namePattern)}&select=id,name`,
      {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaHlsYXVjZ2d4bXJneWhudXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4Mzc4NDcsImV4cCI6MjA1NjQxMzg0N30.pgVDZkRFXJVXgshfY40w28T__NMeOYDjGYQK-lAACmY',
          'Content-Type': 'application/json'
        }
      }
    ).then(r => r.json());
    
    if (pendingError) throw pendingError;
    
    return { 
      existingExams: existingExams || [], 
      pendingExams: pendingExams || [] 
    };
  } catch (error) {
    console.error('Error checking for duplicate exams:', error);
    // Return empty arrays as fallback
    return { existingExams: [], pendingExams: [] };
  }
};

// Helper function to extract dates from text
const extractDates = (text: string): Date[] => {
  // Very basic date extraction - in a real app would use more sophisticated methods
  const dateRegex = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?,? \d{2,4}\b|\b\d{1,2}(?:st|nd|rd|th)? (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{2,4}\b/gi;
  
  const matches = text.match(dateRegex) || [];
  return matches.map(match => new Date(match));
};

// Process search results to extract exam information
const processSearchResults = (data: any, query: string): Partial<Exam>[] => {
  const examResults: Partial<Exam>[] = [];
  
  // Process organic results
  if (data.organic_results) {
    data.organic_results.forEach((result: any) => {
      // Skip results that don't seem to be about exams
      if (!result.title.toLowerCase().includes('exam') && 
          !result.snippet?.toLowerCase().includes('exam')) {
        return;
      }
      
      // Extract dates from snippet and title
      const allText = `${result.title} ${result.snippet || ''}`;
      const dates = extractDates(allText);
      
      // Create an exam object with the information we have
      const exam: Partial<Exam> = {
        name: result.title.replace(/\s*-\s*.+$/, '').trim(),
        description: result.snippet || '',
        websiteUrl: result.link,
        category: guessCategory(result.title, query),
      };
      
      // Try to assign dates if we found some
      if (dates.length >= 2) {
        const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
        exam.registrationStartDate = sortedDates[0];
        exam.registrationEndDate = sortedDates[1];
        
        if (sortedDates.length >= 3) {
          exam.examDate = sortedDates[2];
        }
        
        if (sortedDates.length >= 4) {
          exam.resultDate = sortedDates[3];
        }
      }
      
      examResults.push(exam);
    });
  }
  
  return examResults;
};

// Helper function to guess the exam category based on the title and query
const guessCategory = (title: string, query: string): string => {
  const titleLower = title.toLowerCase();
  const queryLower = query.toLowerCase();
  
  if (titleLower.includes('engineering') || queryLower.includes('engineering') || 
      titleLower.includes('jee') || titleLower.includes('gate')) {
    return 'Engineering';
  } else if (titleLower.includes('medical') || queryLower.includes('medical') ||
           titleLower.includes('neet') || titleLower.includes('aiims')) {
    return 'Medical';
  } else if (titleLower.includes('civil service') || queryLower.includes('civil service') ||
           titleLower.includes('upsc') || titleLower.includes('ias') || titleLower.includes('ips')) {
    return 'Civil Services';
  } else if (titleLower.includes('bank') || queryLower.includes('bank') ||
           titleLower.includes('sbi') || titleLower.includes('ibps')) {
    return 'Banking';
  } else if (titleLower.includes('railway') || queryLower.includes('railway') ||
           titleLower.includes('rrb')) {
    return 'Railways';
  } else if (titleLower.includes('defence') || queryLower.includes('defence') ||
           titleLower.includes('nda') || titleLower.includes('cds')) {
    return 'Defence';
  } else if (titleLower.includes('teaching') || queryLower.includes('teaching') ||
           titleLower.includes('ctet') || titleLower.includes('tet')) {
    return 'Teaching';
  } else if (titleLower.includes('state') || queryLower.includes('state service')) {
    return 'State Services';
  } else if (titleLower.includes('board') || queryLower.includes('board') ||
           titleLower.includes('cbse') || titleLower.includes('icse')) {
    return 'School Board';
  } else if (titleLower.includes('law') || queryLower.includes('law') ||
           titleLower.includes('clat') || titleLower.includes('ailet')) {
    return 'Law';
  } else if (titleLower.includes('management') || queryLower.includes('management') ||
           titleLower.includes('cat') || titleLower.includes('mba')) {
    return 'Management';
  } else {
    return 'Other';
  }
};
