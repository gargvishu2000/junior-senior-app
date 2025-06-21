
import Question from "../models/Question.js";

export const getAllQuestions = async(req,res)=>{
      try {
        console.log("I'm here");
        
        const questions = await Question.find()
          .sort({ createdAt: -1 })
          .populate('author', 'username avatar');
        res.json(questions);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
}

export const getById= async(req,res)=>{
     try {
        const question = await Question.findById(req.params.id)
          .populate('author', 'username avatar');
        
        if (!question) {
          return res.status(404).json({ msg: 'Question not found' });
        }
        
        res.json(question);
      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(404).json({ msg: 'Question not found' });
        }
        res.status(500).send('Server error');
      }
}

export const createQuestion=async(req,res)=>{
     try {
        const { title, body, tags } = req.body;

        // Input validation
        if (!title || !body) {
            return res.status(400).json({ msg: "Title and body are required" });
        }

        if (title.trim().length < 5) {
            return res.status(400).json({ msg: "Title must be at least 5 characters long" });
        }

        if (body.trim().length < 10) {
            return res.status(400).json({ msg: "Body must be at least 10 characters long" });
        }

        const newQuestion = new Question({
          title: title.trim(),
          body: body.trim(),
          author: req.user.id,
          tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
        });
        
        const question = await newQuestion.save();
        await question.populate('author', 'username avatar');

        
        res.json(question);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
}

export const updateQuestion=async(req,res)=>{
    try {
    const { title, body, tags } = req.body;
    
    let question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    
    // Check user ownership
    if (question.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    question.title = title || question.title;
    question.body = body || question.body;
    if (tags) {
      question.tags = tags.split(',').map(tag => tag.trim());
    }
    
    await question.save();
    await question.populate('author', 'username avatar');
    
    res.json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Question not found' });
    }
    res.status(500).send('Server error');
  }
}

export const deleteQuestion=async(req,res)=>{
     try {
        const question = await Question.findById(req.params.id);
        
        if (!question) {
          return res.status(404).json({ msg: 'Question not found' });
        }
        
        // Check user ownership
        if (question.author.toString() !== req.user.id) {
          return res.status(401).json({ msg: 'User not authorized' });
        }
        
        await question.deleteOne();
        
        res.json({ msg: 'Question removed' });
      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(404).json({ msg: 'Question not found' });
        }
        res.status(500).send('Server error');
      }
}

export const upvoteQuestion=async(req,res)=>{
    try {
        const question = await Question.findById(req.params.id);
        
        if (!question) {
          return res.status(404).json({ msg: 'Question not found' });
        }
        
        // Check if already upvoted
        if (question.upvotes.includes(req.user.id)) {
          // Remove upvote
          question.upvotes = question.upvotes.filter(id => id.toString() !== req.user.id);
        } else {
          // Add upvote and remove downvote if exists
          question.upvotes.push(req.user.id);
          question.downvotes = question.downvotes.filter(id => id.toString() !== req.user.id);
        }
        
        await question.save();
        
        res.json({
          upvotes: question.upvotes.length,
          downvotes: question.downvotes.length
        });
      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(404).json({ msg: 'Question not found' });
        }
        res.status(500).send('Server error');
      }
}

export const downvoteQuestion=async(req,res)=>{
    try {
        const question = await Question.findById(req.params.id);
        
        if (!question) {
          return res.status(404).json({ msg: 'Question not found' });
        }
        
        // Check if already downvoted
        if (question.downvotes.includes(req.user.id)) {
          // Remove downvote
          question.downvotes = question.downvotes.filter(id => id.toString() !== req.user.id);
        } else {
          // Add downvote and remove upvote if exists
          question.downvotes.push(req.user.id);
          question.upvotes = question.upvotes.filter(id => id.toString() !== req.user.id);
        }
        
        await question.save();
        
        res.json({
          upvotes: question.upvotes.length,
          downvotes: question.downvotes.length
        });
      } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
          return res.status(404).json({ msg: 'Question not found' });
        }
        res.status(500).send('Server error');
      }
}