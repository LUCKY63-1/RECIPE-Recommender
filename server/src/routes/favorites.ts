import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../services/favorites.service';
import { RecipeSuggestion } from '../types/recipes';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const favorites = await getFavorites();
    res.json(favorites);
  } catch (err: any) {
    console.error('Error in GET /favorites:', err?.message || err);
    res.status(500).json({ message: 'Failed to get favorites' });
  }
});

router.post('/', async (req, res) => {
  try {
    const recipe = req.body as RecipeSuggestion;
    if (!recipe || !recipe.id || !recipe.title) {
      return res.status(400).json({ message: 'Invalid recipe format' });
    }
    const newFavorite = await addFavorite(recipe);
    res.status(201).json(newFavorite);
  } catch (err: any) {
    console.error('Error in POST /favorites:', err?.message || err);
    res.status(500).json({ message: 'Failed to add favorite' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await removeFavorite(id);
    res.status(204).send();
  } catch (err: any) {
    console.error('Error in DELETE /favorites/:id:', err?.message || err);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
});

export default router;
