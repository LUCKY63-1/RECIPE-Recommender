import axios, { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';
import { RecipeQuery, RecipeSuggestion, SuggestRecipesResponse, NutritionalInfo } from '../types/recipes';
import * as cache from './cache';

// This service calls Meta Llama 4 (or similar) via Groq API using values from .env
// (.env must be placed in the server folder and loaded via dotenv in src/index.ts)

const BASE_URL = process.env.GROQ_API_URL ?? 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL ?? 'meta-llama/llama-4-maverick-17b-128e-instruct';
const API_KEY = process.env.GROQ_API_KEY;

// Use a single, pre-configured axios instance for the Groq API
if (!API_KEY) {
  console.error('Missing GROQ_API_KEY in environment.');
}

const groqApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Normalizes a raw recipe object from the AI into a structured RecipeSuggestion.
 * This function handles missing fields, data type conversions, and aliasing.
 * @param r - The raw recipe object from the AI.
 * @param base - An optional base recipe to use for fallback values.
 * @param index - An optional index for generating a unique ID.
 * @returns A normalized RecipeSuggestion object.
 */
function _normalizeRecipe(r: any, base?: RecipeSuggestion, index = 0): RecipeSuggestion {
  // Helper to ensure a value is an array, with fallbacks.
  const ensureArray = (value: any, fallbackValue?: any[]): string[] => {
    if (Array.isArray(value) && value.length > 0) return value;
    if (Array.isArray(fallbackValue) && fallbackValue.length > 0) return fallbackValue;
    return [];
  };

  const normalizeNutrition = (n: any): NutritionalInfo | undefined => {
    if (!n || typeof n !== 'object') return undefined;
    return {
      calories: Number(n.calories) || 0,
      protein: Number(n.protein) || 0,
      carbs: Number(n.carbs || n.carbohydrates) || 0,
      fat: Number(n.fat || n.fats) || 0,
      fiber: Number(n.fiber) || 0,
      sugar: Number(n.sugar || n.sugars) || 0,
    };
  };

  // Generate unique ID: use base ID if provided (for enrichment), otherwise generate new UUID
  const recipeId = base?.id || randomUUID();

  const normalized: RecipeSuggestion = {
    id: recipeId,
    title: r.title || r.name || base?.title || `Recipe ${index + 1}`,
    shortDescription: r.shortDescription || r.description || base?.shortDescription || '',
    cuisineRegion: r.cuisineRegion || r.cuisine || base?.cuisineRegion || 'Indian',
    isVegetarian: typeof r.isVegetarian === 'boolean' ? r.isVegetarian : base?.isVegetarian ?? true,
    tags: ensureArray(r.tags, base?.tags),
    estimatedTimeMinutes: Number(r.estimatedTimeMinutes || r.time || base?.estimatedTimeMinutes || 20),
    difficulty: ['easy', 'medium', 'hard'].includes(r.difficulty) ? r.difficulty : base?.difficulty || 'easy',
    ingredients: ensureArray(r.ingredients, base?.ingredients).map((ing: any) => ({
      name: ing.name || ing.item || 'Ingredient',
      quantity: ing.quantity || ing.qty || 'as needed',
      isFromUserKitchen: !!ing.isFromUserKitchen,
    })),
    steps: ensureArray(r.steps || r.instructions, base?.steps),
    tips: ensureArray(r.tips, base?.tips),
    servingSize: Number(r.servingSize || r.servings || base?.servingSize) || undefined,
    nutrition: normalizeNutrition(r.nutrition || r.nutritionalInfo || r.nutritionInfo),
  };

  // Final validation to ensure critical fields have meaningful default content if empty
  if (normalized.ingredients.length === 0) {
    normalized.ingredients = [
      { name: 'Salt', quantity: 'to taste', isFromUserKitchen: false },
      { name: 'Water', quantity: 'as needed', isFromUserKitchen: false },
    ];
  }
  if (normalized.steps.length === 0) {
    normalized.steps = [
      'Prepare all ingredients as needed.',
      'Cook according to recipe instructions.',
      'Serve hot and enjoy!',
    ];
  }
  if (normalized.tips.length === 0) {
    normalized.tips = ['Adjust seasoning to personal preference.'];
  }

  return normalized;
}


export async function generateRecipesFromLlama(
  query: RecipeQuery,
): Promise<SuggestRecipesResponse> {
  const cacheKey = `recipes-${JSON.stringify(query)}`;
  const cached = cache.get<SuggestRecipesResponse>(cacheKey);
  if (cached) {
    console.log('Returning cached recipe suggestions');
    return cached;
  }

  console.log('Groq LLM config:', { hasUrl: !!BASE_URL, hasKey: !!API_KEY, model: MODEL });

  if (!BASE_URL || !API_KEY) {
    console.warn('Using fallback mock recipes (missing GROQ_API_URL or GROQ_API_KEY)');
    const mock: RecipeSuggestion[] = [
      {
        id: randomUUID(),
        title: 'Simple Masala Khichdi',
        shortDescription:
          'Comforting one-pot rice and dal with spices, perfect for quick Indian dinner.',
        cuisineRegion: 'North Indian',
        isVegetarian: true,
        tags: ['one-pot', 'light', 'comfort'],
        estimatedTimeMinutes: 25,
        difficulty: 'easy',
        ingredients: [
          {
            name: 'Rice',
            quantity: '1 cup',
            isFromUserKitchen: query.ingredients.includes('rice'),
          },
          {
            name: 'Moong dal',
            quantity: '1/2 cup',
            isFromUserKitchen: query.ingredients.includes('dal'),
          },
          {
            name: 'Onion',
            quantity: '1 small, chopped',
            isFromUserKitchen: query.ingredients.includes('onion'),
          },
        ],
        steps: [
          'Wash rice and dal together.',
          'In a pressure cooker, temper jeera, ginger, and chilli.',
          'Add onion, tomato, spices, then rice+dal and water.',
          'Pressure cook for 2–3 whistles until soft.',
        ],
        tips: ['Adjust water for softer or drier khichdi.', 'Serve with curd and pickle.'],
      },
    ];

    return { recipes: mock };
  }

  const systemPrompt =
    'You are a helpful Indian chef specializing in diverse regional Indian dishes. ' +
    'Given ingredients, diet, spice level, and time, suggest practical recipes. ' +
    'Use commonly available Indian ingredients. Always respect dietary restrictions ' +
    'and avoid listed ingredients. Respond ONLY with valid JSON matching the schema.';

  const userPrompt = {
    ingredients: query.ingredients,
    diet: query.diet,
    spiceLevel: query.spiceLevel,
    timeLimitMinutes: query.timeLimitMinutes,
    cuisineFocus: query.cuisineFocus,
    servings: query.servings,
    avoidIngredients: query.avoidIngredients,
  };

  try {
    const response = await groqApi.post('', {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            'Generate 3 Indian recipes as JSON object with shape {"recipes": RecipeSuggestion[]}. ' +
            'Return ONLY JSON. Input: ' + JSON.stringify(userPrompt),
        },
      ],
      response_format: { type: 'json_object' },
    });

    const choice = response.data?.choices?.[0]?.message?.content;
    if (!choice) {
      throw new Error('No content from LLM');
    }

    let raw: any;
    try {
      raw = typeof choice === 'string' ? JSON.parse(choice) : choice;
    } catch {
      throw new Error('Failed to parse LLM JSON');
    }

    const recipesSource: any[] = Array.isArray(raw.recipes) ? raw.recipes : Array.isArray(raw) ? raw : [];
    if (!recipesSource.length) {
      throw new Error('Invalid AI response format: no recipes array');
    }

    const result = {
      recipes: recipesSource.map((r: any, index: number) => _normalizeRecipe(r, undefined, index)),
    };
    
    cache.set(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error('Groq API error:', err.response?.status, err.response?.data || err.message);
    throw new Error('LLM request failed');
  }
}

const translateCache = new Map<string, string>();

export async function translateText(text: string, targetLang: 'en' | 'hi' | 'mr'): Promise<string> {
  if (!BASE_URL || !API_KEY) {
    throw new Error('GROQ config missing');
  }

  const trimmed = text.trim();
  if (!trimmed) return '';

  const cacheKey = `${targetLang}:${trimmed}`;
  const cached = translateCache.get(cacheKey);
  if (cached) return cached;

  const systemPrompt =
    'You are a precise translator for short app UI and recipe-related text. ' +
    'Supported languages: English (en), Hindi (hi), Marathi (mr). ' +
    'Return ONLY the translated text, no quotes, no JSON, no extra commentary.';

  const langLabel = targetLang === 'en' ? 'English' : targetLang === 'hi' ? 'Hindi' : 'Marathi';

  try {
    const response = await groqApi.post('', {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            `Translate this text into ${langLabel}. If it is already in that language, return it unchanged. Text: "${trimmed}"`,
        },
      ],
    });

    const choice = response.data?.choices?.[0]?.message?.content;
    if (!choice || typeof choice !== 'string') {
      throw new Error('No content from Groq for translation');
    }

    const translated = choice.trim();
    translateCache.set(cacheKey, translated);
    return translated;
  } catch (err: any) {
    if (err.response?.status === 429) {
      console.warn('Groq translation rate limit hit');
      throw new Error('Translation rate limit reached, please wait and try again.');
    }
    console.error('Groq translate error:', err.response?.status, err.response?.data || err.message);
    throw new Error('Translation failed');
  }
}

export async function generateRecipeDetailsFromGroq(base: RecipeSuggestion): Promise<RecipeSuggestion> {
  const cacheKey = `recipe-details-${base.id}-${base.title}-${base.cuisineRegion}`;
  const cached = cache.get<RecipeSuggestion>(cacheKey);
  if (cached) {
    console.log(`Returning cached recipe details for ${base.id}`);
    return cached;
  }

  if (!BASE_URL || !API_KEY) {
    throw new Error('GROQ config missing');
  }

  const systemPrompt =
    'You are an expert Indian chef and nutritionist. Respond ONLY with strict JSON for a single detailed recipe. ' +
    'Use friendly text and you MAY include relevant food emojis INSIDE string values (ingredients, steps, tips), ' +
    'but never add text outside JSON. Follow the RecipeSuggestion schema exactly. ' +
    'CRITICAL: You MUST generate ALL required fields: ingredients (array), steps (array), tips (array), and nutrition (object). ' +
    'Do not omit any of these fields. Each should have meaningful content.';

  const userPrompt = {
    id: base.id,
    title: base.title,
    shortDescription: base.shortDescription,
    cuisineRegion: base.cuisineRegion,
    isVegetarian: base.isVegetarian,
    tags: base.tags,
    estimatedTimeMinutes: base.estimatedTimeMinutes,
    difficulty: base.difficulty,
    existingIngredients: base.ingredients,
  };

  const response = await groqApi.post('', {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content:
          'Given this rough recipe idea, return ONE enriched RecipeSuggestion JSON object. ' +
          'CRITICAL REQUIREMENTS: ' +
          '1. ingredients: Array with 5-10 specific ingredients with quantities ' +
          '2. steps: Array with 4-8 clear cooking steps ' +
          '3. tips: Array with 2-4 helpful cooking tips ' +
          '4. nutrition: Object with estimated nutritional values PER SERVING: ' +
          '   { calories: number, protein: number (grams), carbs: number (grams), fat: number (grams), fiber: number (grams), sugar: number (grams) } ' +
          'All fields MUST be populated with meaningful content. Estimate realistic nutritional values based on the ingredients. ' +
          'Base recipe: ' + JSON.stringify(userPrompt),
      },
    ],
    response_format: { type: 'json_object' },
  });

  const choice = response.data?.choices?.[0]?.message?.content;
  if (!choice) {
    throw new Error('No content from Groq for details');
  }

  let raw: any;
  try {
    raw = typeof choice === 'string' ? JSON.parse(choice) : choice;
  } catch {
    throw new Error('Failed to parse Groq JSON for details');
  }

  const r = raw.recipes && Array.isArray(raw.recipes) ? raw.recipes[0] : raw;
  if (!r || !r.title) {
    throw new Error('Invalid detailed recipe format');
  }

  const result = _normalizeRecipe(r, base);
  cache.set(cacheKey, result);
  return result;
}