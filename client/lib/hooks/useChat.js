import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { characterAPI } from '@/lib/api/characters';
import { chatAPI } from '../api/chat';
import conversationAPI from '@/lib/api/conversations';
import toast from 'react-hot-toast';

export const useChat = (characterId, router) => {
  const searchParams = useSearchParams();

  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch character
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const data = await characterAPI.getCharacterById(characterId);
        setCharacter(data);
      } catch (error) {
        console.error('Error fetching character:', error);
        toast.error('Failed to load character');
        router.push('/dashboard/characters');
      } finally {
        setLoading(false);
      }
    };

    if (characterId) {
      fetchCharacter();
    }
  }, [characterId, router]);

  // Load existing conversation if conversationId in URL
  useEffect(() => {
    const loadConversation = async () => {
      const convId = searchParams.get('conversationId');
      if (convId) {
        try {
          const conv = await conversationAPI.getConversationById(convId);
          setMessages(conv.messages.map(msg => ({
            id: Date.now() + Math.random(),
            role: msg.role,
            content: msg.content,
            voiceUrl: msg.voiceUrl
          })));
          setConversationId(convId);
        } catch (error) {
          console.error('Error loading conversation:', error);
          toast.error('Failed to load conversation');
        }
      }
    };

    if (character) {
      loadConversation();
    }
  }, [character, searchParams]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-save whenever messages change (after voice generation too)
  useEffect(() => {
    if (messages.length > 0 && character) {
      const timeoutId = setTimeout(() => {
        saveConversation(messages);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [messages]); // ⚠️ This will auto-save when voice URLs are added


  // Auto-save conversation after each message
  const saveConversation = async (updatedMessages) => {
    if (updatedMessages.length === 0) return;

    try {
      setIsSaving(true);
      const response = await conversationAPI.saveConversation({
        conversationId,
        characterId,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          voiceUrl: msg.voiceUrl || null
        })),
        title: `Chat with ${character.name}`
      });

      // Set conversation ID if it's a new conversation
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);

        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('conversationId', response.conversationId);
        window.history.replaceState({}, '', url);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      // Don't show error to user - silent save
    } finally {
      setIsSaving(false);
    }
  };

  // Send message handler
  const handleSendMessage = async (e, generateVoice, autoPlayVoice) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    try {
      // Send to AI
      const response = await chatAPI.chat({
        characterId,
        message: input.trim()
      });

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        voiceUrl: null
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      // Auto-save conversation
      await saveConversation(finalMessages);

      // Generate voice if available
      if (generateVoice && response.reply) {
        await generateVoice(response.reply, aiMessage.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');

      // Remove user message on error
      setMessages(messages);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return {
    character,
    loading,
    messages,
    setMessages,
    input,
    setInput,
    sending,
    conversationId,
    isSaving,
    handleSendMessage,
    saveConversation,
    messagesEndRef,
    messagesContainerRef,
    inputRef
  };
};
