import Conversation from '../models/Conversation.js';
import Character from '../models/Character.js';

// Get all conversations for logged-in user
export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .populate('character', 'name image category')
      .sort({ lastMessageAt: -1 })
      .select('title lastMessageAt messages');

    // Add message count to each conversation
    const conversationsWithCount = conversations.map(conv => ({
      _id: conv._id,
      title: conv.title,
      character: conv.character,
      lastMessageAt: conv.lastMessageAt,
      messageCount: conv.messages.length,
      lastMessage: conv.messages[conv.messages.length - 1]?.content.slice(0, 100) || ''
    }));

    res.json(conversationsWithCount);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single conversation by ID
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('character', 'name image voice category isPremium');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or update conversation
export const saveConversation = async (req, res) => {
  try {
    const { conversationId, characterId, messages, title } = req.body;

    // Verify character exists
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    let conversation;

    if (conversationId) {
      // Update existing conversation
      conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, user: req.user._id },
        {
          $set: {
            messages,
            lastMessageAt: Date.now(),
            ...(title && { title })
          }
        },
        { new: true, runValidators: true }
      );

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      // Create new conversation
      const conversationTitle = title || `Chat with ${character.name}`;
      
      conversation = await Conversation.create({
        user: req.user._id,
        character: characterId,
        title: conversationTitle,
        messages,
        lastMessageAt: Date.now()
      });
    }

    res.json({
      message: 'Conversation saved',
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversations by character
export const getConversationsByCharacter = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      user: req.user._id,
      character: req.params.characterId
    })
      .sort({ lastMessageAt: -1 })
      .select('title lastMessageAt messages');

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching character conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
