
import { Exam } from './types';

export async function searchExamsWithPerplexity(query: string, apiKey: string): Promise<Partial<Exam>[]> {
  if (!apiKey) {
    throw new Error('Perplexity API key is required');
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-medium-online',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that provides information about educational and competitive exams. 
            Return the result in a JSON array format with the following fields for each exam:
            name, category, description, registrationStartDate, registrationEndDate, examDate, resultDate, websiteUrl, eligibility, applicationFee.
            Dates should be in ISO format (YYYY-MM-DD). If a date is unknown, leave it out.
            Include answerKeyDate if available. For missing data, exclude those fields rather than returning null or empty values.`
          },
          {
            role: 'user',
            content: `Find detailed information about ${query} exams, including registration dates, exam dates, and eligibility criteria.`
          }
        ],
        max_tokens: 4000
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response from Perplexity');
    }

    // Extract and parse the JSON result from the Perplexity response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in Perplexity response');
    }

    // Attempt to extract JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in Perplexity response');
    }

    const exams = JSON.parse(jsonMatch[0]);

    // Transform the exams to match our application's Exam type
    return exams.map((exam: any) => ({
      id: '', // Will be assigned by database
      name: exam.name,
      category: exam.category || 'General',
      description: exam.description,
      registrationStartDate: exam.registrationStartDate ? new Date(exam.registrationStartDate) : undefined,
      registrationEndDate: exam.registrationEndDate ? new Date(exam.registrationEndDate) : undefined,
      examDate: exam.examDate ? new Date(exam.examDate) : undefined,
      resultDate: exam.resultDate ? new Date(exam.resultDate) : undefined,
      answerKeyDate: exam.answerKeyDate ? new Date(exam.answerKeyDate) : undefined,
      websiteUrl: exam.websiteUrl,
      eligibility: exam.eligibility,
      applicationFee: exam.applicationFee,
      isSubscribed: false
    }));
  } catch (error) {
    console.error('Error searching exams with Perplexity:', error);
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
