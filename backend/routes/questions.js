import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth.js';
import { getById,getAllQuestions,createQuestion,updateQuestion,deleteQuestion,upvoteQuestion, downvoteQuestion } from '../controller/questionController.js';
// Get all questions
router.get('/', getAllQuestions);

// Get question by ID
router.get('/:id', getById);

// Create a question
router.post('/', auth, createQuestion);

// Update a question
router.put('/:id', auth, updateQuestion);

// Delete a question
router.delete('/:id', auth, deleteQuestion);

// Upvote a question
router.put('/upvote/:id', auth, upvoteQuestion);

// Downvote a question
router.put('/downvote/:id', auth,downvoteQuestion);

export default router;