'use server';

import { GoogleGenAI } from '@google/genai';
import { ExpenseCategory, EXPENSE_CATEGORIES, CATEGORY_SUBCATEGORIES } from '@/types/expense';
import { generateAvatarUrl } from '@/lib/utils';

const VALID_CATEGORIES = EXPENSE_CATEGORIES;
const CATEGORY_GUIDE = EXPENSE_CATEGORIES
  .map(category => {
    const subcategories = CATEGORY_SUBCATEGORIES[category];
    const subcategoryList = subcategories?.length ? subcategories.join(', ') : 'Other';
    return `${category}: ${subcategoryList}`;
  })
  .join('\n- ');

const PIXABAY_CATEGORY_MAP: Partial<Record<ExpenseCategory, string>> = {
  'Food & Dining': 'food',
  'Housing': 'buildings',
  'Transportation': 'transportation',
  'Shopping': 'business',
  'Entertainment': 'music',
  'Technology & Electronics': 'computer',
  'Health & Fitness': 'health',
  'Education': 'education',
  'Personal Care': 'people',
  'Pets': 'animals',
  'Travel': 'travel',
  'Financial': 'business',
  'Insurance': 'business',
  'Gifts & Donations': 'people',
  'Kids & Family': 'people',
  'Business Expenses': 'business',
  'Subscriptions': 'backgrounds',
  'Utilities & Bills': 'industry',
  'Savings & Investments': 'business',
  'Miscellaneous': 'backgrounds',
};

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

async function fetchPixabayImage(
  keyword: string,
  category: ExpenseCategory,
  subcategory?: string
): Promise<string | undefined> {
  if (!PIXABAY_API_KEY) return undefined;

  const sanitizedKeyword = keyword.trim().replace(/[^a-zA-Z0-9\s-]/g, ' ').split(/\s+/).slice(0, 3).join(' ');
  if (!sanitizedKeyword) return undefined;

  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: sanitizedKeyword,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: '5',
  });

  const mappedCategory = PIXABAY_CATEGORY_MAP[category];
  if (mappedCategory) {
    params.set('category', mappedCategory);
  }

  try {
    const response = await fetch(`https://pixabay.com/api/?${params.toString()}`);
    if (!response.ok) {
      console.error('Pixabay request failed:', response.status, response.statusText);
      return undefined;
    }

    const data = await response.json();
    if (!data?.hits?.length) return undefined;

    const usableHit = data.hits.find((hit: any) => typeof hit?.previewURL === 'string') ?? data.hits[0];

    // Prefer the CDN URL (previewURL) and upgrade resolution, falling back to others if needed
    let candidateUrl = usableHit?.previewURL?.replace('_150.', '_640.');

    if (!candidateUrl) {
      candidateUrl = usableHit?.webformatURL ?? usableHit?.largeImageURL;
    }

    if (typeof candidateUrl !== 'string') return undefined;
    return candidateUrl.startsWith('http') ? candidateUrl : undefined;
  } catch (error) {
    console.error('Error fetching Pixabay image:', error);
    return undefined;
  }
}

interface CategorizeResult {
  cleanedName: string;
  suggestedCategory: ExpenseCategory;
  suggestedSubcategory?: string;
  brandColor?: string;
  brandAccentColor?: string;
  brandLogoUrl?: string;
  imageUrl?: string;
  imageKeyword?: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function categorizeExpense(
  rawName: string
): Promise<CategorizeResult | { error: string }> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return { error: 'Google AI API key not configured' };
    }

    if (!rawName || rawName.trim().length === 0) {
      return { error: 'Expense name cannot be empty' };
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an AI assistant that helps clean and categorize expense names.

Given the raw expense name: "${rawName}"

Please provide:
1. A cleaned, human-readable version of the name (remove transaction IDs, clean up merchant names, etc.)
2. The most appropriate category from this list: ${VALID_CATEGORIES.join(', ')}
3. The best matching subcategory for that category.
4. Two brand colors that match the expense: a primary hex color and a complementary accent hex color. Always include the leading "#".
5. A logo URL for the brand if you can determine it. Prefer https://logo.clearbit.com/<domain> when a clear domain is known. Use null if unsure.
6. A concise Pixabay search keyword (1-3 words, no special characters) that best represents the expense for image lookup.
7. A high-quality illustrative product image URL (square preferred). Prefer direct HTTPS links from trusted CDNs (e.g., https://images.unsplash.com/, https://source.unsplash.com/, or official brand CDNs). Use null if unsure.
8. Your confidence level (high, medium, or low)

Category system:
- ${CATEGORY_GUIDE}

Examples:
- "AMZN*AB123CD456" → cleaned: "Amazon", category: "Shopping", subcategory: "Online Shopping"
- "Apple MacBook Pro 16" → cleaned: "MacBook Pro 16\"", category: "Technology & Electronics", subcategory: "Computers & Laptops"
- "IKEA KALLAX Shelf" → cleaned: "KALLAX Shelf", category: "Housing", subcategory: "Furniture"
- "Tesla Model 3" → cleaned: "Tesla Model 3", category: "Transportation", subcategory: "Vehicle Purchase"

Respond ONLY with a JSON object in this exact format (no markdown, no extra text):
{"cleanedName": "cleaned name here", "suggestedCategory": "category here", "suggestedSubcategory": "subcategory here", "brandColor": "#123456", "brandAccentColor": "#654321", "brandLogoUrl": "https://logo.clearbit.com/example.com", "imageKeyword": "keyword here", "imageUrl": "https://images.unsplash.com/photo-id", "confidence": "high"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text?.trim();

    if (!responseText) {
      return { error: 'No response from AI' };
    }

    // Try to parse the JSON response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return { error: 'Invalid response format from AI' };
    }

    // Validate the response
    if (!parsed.cleanedName || !parsed.suggestedCategory || !parsed.confidence) {
      return { error: 'Incomplete response from AI' };
    }

    // Ensure the category is valid
    const categoryCandidate = parsed.suggestedCategory as ExpenseCategory;
    const normalizedCategory: ExpenseCategory = VALID_CATEGORIES.includes(categoryCandidate)
      ? categoryCandidate
      : 'Miscellaneous';

    const allowedSubcategories = CATEGORY_SUBCATEGORIES[normalizedCategory] || [];
    let normalizedSubcategory: string | undefined;
    if (parsed.suggestedSubcategory && allowedSubcategories.includes(parsed.suggestedSubcategory)) {
      normalizedSubcategory = parsed.suggestedSubcategory;
    } else if (allowedSubcategories.length > 0) {
      normalizedSubcategory = allowedSubcategories[0];
    }

    // Ensure confidence is valid
    if (!['high', 'medium', 'low'].includes(parsed.confidence)) {
      parsed.confidence = 'medium';
    }

    const hexColorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    const normalizeColor = (value?: string) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return hexColorRegex.test(trimmed) ? trimmed.toUpperCase() : undefined;
    };

    const normalizeUrl = (value?: string) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      try {
        const url = new URL(trimmed);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return url.toString();
        }
      } catch {
        return undefined;
      }
      return undefined;
    };

    const candidateImage = normalizeUrl(parsed.imageUrl ?? parsed.productImageUrl ?? parsed.photoUrl ?? parsed.image);

    const rawKeyword = typeof parsed.imageKeyword === 'string' ? parsed.imageKeyword : '';
    const baseKeyword =
      rawKeyword.trim() ||
      parsed.cleanedName ||
      normalizedSubcategory ||
      normalizedCategory ||
      rawName;

    let normalizedLogo = normalizeUrl(parsed.brandLogoUrl ?? parsed.logoUrl ?? parsed.logo);

    let pixabayImageNormalized: string | undefined;
    if (!normalizedLogo && baseKeyword) {
      const pixabayImage = await fetchPixabayImage(baseKeyword, normalizedCategory, normalizedSubcategory);
      if (pixabayImage) {
        pixabayImageNormalized = normalizeUrl(pixabayImage);
      }
    }

    const fallbackAvatar = generateAvatarUrl(parsed.cleanedName, normalizedCategory);
    if (!normalizedLogo) {
      normalizedLogo = pixabayImageNormalized ?? candidateImage ?? fallbackAvatar;
    }

    const normalizedImage =
      candidateImage ??
      pixabayImageNormalized ??
      normalizedLogo ??
      fallbackAvatar;

    return {
      cleanedName: parsed.cleanedName,
      suggestedCategory: normalizedCategory,
      suggestedSubcategory: normalizedSubcategory,
      brandColor: normalizeColor(parsed.brandColor ?? parsed.brandPrimaryColor),
      brandAccentColor: normalizeColor(parsed.brandAccentColor ?? parsed.brandSecondaryColor),
      brandLogoUrl: normalizedLogo,
      imageUrl: normalizedImage,
      imageKeyword: baseKeyword,
      confidence: parsed.confidence as 'high' | 'medium' | 'low',
    };
  } catch (error) {
    console.error('Error categorizing expense:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to categorize expense'
    };
  }
}
