import { Router } from 'express';
const router = Router();
import Comment from '../models/Comment.js';
import auth from '../middleware/auth.js';
import Question from '../models/Question.js'; // Ensure you import the Question model

// Get comments for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const comments = await Comment.find({ question: req.params.questionId })
      .sort({ createdAt: 1 })
      .populate('author', 'username avatar');
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a comment
router.post('/', auth, async (req, res) => {
  try {
    const { body, questionId } = req.body;
    
    // Check if the question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    
    const newComment = new Comment({
      body,
      author: req.user.id,
      question: questionId
    });
    
    const comment = await newComment.save();
    await comment.populate('author', 'username avatar');

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a comment
router.put('/:id', auth, async (req, res) => {
  try {
    const { body } = req.body;
    
    let comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check user ownership
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    comment.body = body;
    
    await comment.save();
    await comment.populate('author', 'username avatar');

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server error');
  }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check user ownership
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await comment.deleteOne(); // `remove()` is deprecated in Mongoose

    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server error');
  }
});

export default router;
