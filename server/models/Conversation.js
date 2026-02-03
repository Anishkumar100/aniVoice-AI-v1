import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  voiceUrl: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  character: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Conversation'
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ user: 1, lastMessageAt: -1 });
conversationSchema.index({ user: 1, character: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;



