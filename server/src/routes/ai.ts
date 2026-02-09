import { Router } from 'express';
import { RecipeQuery, RecipeSuggestion } from '../types/recipes';
import { generateRecipesFromLlama, generateRecipeDetailsFromGroq } from '../services/llmClient';

const router = Router();

router.post('/suggest-recipes', async (req, res) => {
  try {
    const body = req.body as RecipeQuery;

    if (!body.ingredients || !Array.isArray(body.ingredients) || body.ingredients.length === 0) {
      return res.status(400).json({ message: 'ingredients[] is required' });
    }

    const result = await generateRecipesFromLlama(body);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /ai/suggest-recipes:', err?.message || err);
    return res.status(500).json({ message: 'Failed to generate recipes' });
  }
});

router.post('/recipe-details', async (req, res) => {
  try {
    const base = req.body as Partial<RecipeSuggestion>;
    if (!base || !base.id || !base.title) {
      return res.status(400).json({ message: 'id and title are required' });
    }
    const detailed = await generateRecipeDetailsFromGroq(base as RecipeSuggestion);
    return res.json(detailed);
  } catch (err: any) {
    console.error('Error in /ai/recipe-details:', err?.message || err);
    return res.status(500).json({ message: 'Failed to generate recipe details' });
  }
});

export default router;
