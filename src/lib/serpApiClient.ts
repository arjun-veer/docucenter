
import { Exam } from './types';

export async function searchExamsWithSerpApi(query: string, apiKey: string): Promise<Partial<Exam>[]> {
  if (!apiKey) {
    throw new Error('SerpAPI key is required');
  }

  try {
    // Encode the query properly for URL
    const encodedQuery = encodeURIComponent(`${query} exam dates registration information`);
    
    const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodedQuery}&api_key=${apiKey}&num=10`);
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract organic results
    const organicResults = data.organic_results || [];
    
    if (organicResults.length === 0) {
      throw new Error('No results found from SerpAPI');
    }
    
    // Process the results to extract exam information
    const exams: Partial<Exam>[] = organicResults.map((result: any, index: number) => {
      // Extract potential dates from snippets using regex
      const datePattern = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|[A-Za-z]+ \d{1,2},? \d{4})/g;
      const potentialDates = result.snippet ? [...result.snippet.matchAll(datePattern)] : [];
      
      // Attempt to parse the first two dates found (if any)
      let registrationDate, examDate;
      if (potentialDates.length >= 1) {
        try {
          registrationDate = new Date(potentialDates[0][0]);
          if (isNaN(registrationDate.getTime())) registrationDate = undefined;
        } catch (e) {
          registrationDate = undefined;
        }
      }
      
      if (potentialDates.length >= 2) {
        try {
          examDate = new Date(potentialDates[1][0]);
          if (isNaN(examDate.getTime())) examDate = undefined;
        } catch (e) {
          examDate = undefined;
        }
      }
      
      // Set default dates if none found (for demo purposes)
      const today = new Date();
      const registrationStartDate = registrationDate || new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      const registrationEndDate = new Date(registrationStartDate.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 days after registration starts
      const defaultExamDate = new Date(registrationEndDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days after registration ends
      
      // Get category based on query content
      let category = 'Other';
      const queryLower = query.toLowerCase();
      if (queryLower.includes('engineering') || queryLower.includes('jee') || queryLower.includes('gate')) {
        category = 'Engineering';
      } else if (queryLower.includes('medical') || queryLower.includes('neet') || queryLower.includes('aiims')) {
        category = 'Medical';
      } else if (queryLower.includes('law') || queryLower.includes('clat')) {
        category = 'Law';
      } else if (queryLower.includes('management') || queryLower.includes('cat') || queryLower.includes('mba')) {
        category = 'Management';
      } else if (queryLower.includes('civil') || queryLower.includes('upsc') || queryLower.includes('ias')) {
        category = 'Civil Services';
      } else if (queryLower.includes('bank') || queryLower.includes('banking') || queryLower.includes('ibps')) {
        category = 'Banking';
      } else if (queryLower.includes('teach') || queryLower.includes('ctet') || queryLower.includes('education')) {
        category = 'Teaching';
      }
      
      return {
        id: `temp-${index}`,
        name: result.title.replace(' - Wikipedia', '').replace(' | Official Website', ''),
        category: category,
        description: result.snippet || `Information about ${result.title}`,
        registrationStartDate,
        registrationEndDate, 
        examDate: examDate || defaultExamDate,
        resultDate: new Date(defaultExamDate.getTime() + (45 * 24 * 60 * 60 * 1000)), // 45 days after exam
        websiteUrl: result.link,
        eligibility: "Please check official website for eligibility criteria",
        applicationFee: "Varies based on category",
        isSubscribed: false
      };
    });
    
    return exams;
  } catch (error) {
    console.error('Error searching exams with SerpAPI:', error);
    throw error;
  }
}

export async function checkForDuplicateExams(examName: string) {
  const { supabase } = await import('./supabase');
  
  // Check in main exams table
  const { data: existingExams } = await supabase
    .from('exams')
    .select('id, name')
    .ilike('name', `%${examName}%`);
    
  // Check in pending exams table
  const { data: pendingExams } = await supabase
    .from('pending_exams')
    .select('id, name')
    .ilike('name', `%${examName}%`);
    
  return {
    existingExams: existingExams || [],
    pendingExams: pendingExams || []
  };
}
