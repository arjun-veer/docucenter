import { toast } from "sonner";

// This should be stored in environment variables or Supabase Edge Function secrets
// For development purposes, we'll keep a temp variable here
let _apiKey: string | null = null;

export const setPerplexityApiKey = (key: string) => {
  _apiKey = key;
};

export const getPerplexityApiKey = () => _apiKey;

type PerplexityMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface ExamDataResponse {
  name: string;
  category: string;
  description: string;
  registrationStartDate: string;
  registrationEndDate: string;
  examDate?: string;
  resultDate?: string;
  answerKeyDate?: string;
  websiteUrl: string;
  eligibility?: string;
  applicationFee?: string;
}

export async function fetchExamDataFromPerplexity(
  examName: string
): Promise<ExamDataResponse | null> {
  if (!_apiKey) {
    toast.error("Perplexity API key not set. Please configure it in settings.");
    return null;
  }

  try {
    const prompt = `
      Find the latest information about the ${examName} exam in India. 
      Give me ONLY the following details in a structured JSON format:
      - name: The full name of the exam
      - category: The category (Engineering, Medical, Civil Services, etc.)
      - description: A brief description of the exam (max 100 words)
      - registrationStartDate: Registration start date in YYYY-MM-DD format
      - registrationEndDate: Registration end date in YYYY-MM-DD format
      - examDate: Exam date in YYYY-MM-DD format (if available)
      - resultDate: Result date in YYYY-MM-DD format (if available)
      - answerKeyDate: Answer key release date in YYYY-MM-DD format (if available)
      - websiteUrl: The official website URL
      - eligibility: Eligibility criteria (max 100 words)
      - applicationFee: Application fee details

      Don't include any explanations or extra text, ONLY valid JSON in this exact format.
      If you don't know a value, leave it as null or omit it from the JSON.
    `;

    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that provides information about exams in a structured JSON format only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${_apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        temperature: 0.2,
        max_tokens: 1000,
        return_images: false,
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      toast.error(`Failed to fetch exam data: ${errorData.error?.message || 'Unknown error'}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract JSON from the response
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      const parsedData = JSON.parse(jsonString.replace(/```/g, ''));
      
      return {
        name: parsedData.name,
        category: parsedData.category,
        description: parsedData.description,
        registrationStartDate: parsedData.registrationStartDate,
        registrationEndDate: parsedData.registrationEndDate,
        examDate: parsedData.examDate,
        resultDate: parsedData.resultDate,
        answerKeyDate: parsedData.answerKeyDate,
        websiteUrl: parsedData.websiteUrl,
        eligibility: parsedData.eligibility,
        applicationFee: parsedData.applicationFee
      };
    } catch (error) {
      console.error('Error parsing JSON from Perplexity:', error, content);
      toast.error('Failed to parse exam data from Perplexity');
      return null;
    }
  } catch (error) {
    console.error('Error fetching from Perplexity:', error);
    toast.error('Failed to connect to Perplexity API');
    return null;
  }
}
