import { Router } from 'express';
const router = Router();
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

// Get all chats for current user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ 
      participants: req.user.id 
    })
    .sort({ lastActivity: -1 })
    .populate('participants', 'username avatar');
    
    // Format chats for client
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(
        participant => participant._id.toString() !== req.user.id
      );
      
      const unreadCount = chat.messages.filter(
        message => !message.read && message.sender.toString() !== req.user.id
      ).length;
      
      return {
        id: chat._id,
        otherUser: otherParticipant,
        lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
        lastActivity: chat.lastActivity,
        unreadCount
      };
    });
    
    res.json(formattedChats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
    try {
        console.log("Calling all autobots");
        
      const chat = new Chat({
        participants: [req.user.id],
        messages: []
      });
  
      await chat.save();
      res.json(chat);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  

// Get a single chat by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'username avatar')
      .populate('messages.sender', 'username avatar');
    
    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }
    
    // Check if user is a participant
    if (!chat.participants.some(participant => participant._id.toString() === req.user.id)) {
      return res.status(401).json({ msg: 'Not authorized to view this chat' });
    }
    
    res.json(chat);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Chat not found' });
    }
    res.status(500).send('Server error');
  }
});

// Create or get a chat with another user
router.post('/user/:userId', auth, async (req, res) => {
  try {
    // Chat creation request

    // Check if user exists
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Don't allow chat with self - convert both to strings for comparison
    const currentUserId = req.user.id.toString();
    const targetUserId = req.params.userId.toString();

    // Check for self-chat attempt

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        msg: 'Cannot create chat with yourself',
        debug: { currentUserId, targetUserId }
      });
    }
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: {
        $all: [req.user.id, req.params.userId],
        $size: 2
      }
    })
    .populate('participants', 'username avatar')
    .populate('messages.sender', 'username avatar');

    if (chat) {
      return res.json(chat);
    }
    
    // Create new chat
    chat = new Chat({
      participants: [req.user.id, req.params.userId],
      messages: []
    });
    
    await chat.save();
    await chat.populate('participants', 'username avatar');
    await chat.populate('messages.sender', 'username avatar');

    res.json(chat);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// Send a message to a chat
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ msg: 'Message content is required' });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(participant => participant.toString() === req.user.id)) {
      return res.status(401).json({ msg: 'Not authorized to send messages to this chat' });
    }

    const newMessage = {
      sender: req.user.id,
      content: content.trim(),
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastActivity = new Date();
    await chat.save();

    // Populate the sender info for the response
    await chat.populate('messages.sender', 'username avatar');

    // Get the newly added message (last one)
    const addedMessage = chat.messages[chat.messages.length - 1];

    res.json(addedMessage);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Chat not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
