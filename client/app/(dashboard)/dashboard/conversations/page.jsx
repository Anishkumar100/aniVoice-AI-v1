'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import conversationAPI from '@/lib/api/conversations';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  Trash2, 
  Clock, 
  User, 
  Loader2,
  Search,
  Sparkles,
  ArrowRight,
  MoreVertical,
  Archive,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.character?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationAPI.getAllConversations();
      setConversations(data);
      setFilteredConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    
    if (!confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await conversationAPI.deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv._id !== id));
      toast.success('Conversation deleted', { icon: '🗑️' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleConversationClick = (conv) => {
    router.push(`/dashboard/characters/${conv.character._id}?conversationId=${conv._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Loading conversations</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950">
      <div className="container max-w-5xl py-8 px-4 animate-fade-in">
        {/* Header with Gradient */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-lg shadow-rose-500/20">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-purple-600 dark:from-white dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
                My Conversations
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="mb-6 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations or characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all placeholder:text-gray-400 text-sm shadow-sm hover:shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Conversations List - Enhanced */}
        {filteredConversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Image
                src="/illustrations/empty-chat.webp"
                alt="No conversations"
                fill
                sizes="128px"
                className="object-contain opacity-40 dark:opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black to-transparent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Start chatting with AI characters to create your conversation history'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/dashboard/characters')}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-rose-500/30 transition-all font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Browse Characters</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conv) => {
              const lastMessageDate = conv.lastMessageAt 
                ? new Date(conv.lastMessageAt) 
                : new Date();
              const isValidDate = !isNaN(lastMessageDate.getTime());

              return (
                <div
                  key={conv._id}
                  onClick={() => handleConversationClick(conv)}
                  onMouseEnter={() => setHoveredId(conv._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/10 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-950/10 dark:to-purple-950/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex items-start gap-4">
                    {/* Character Avatar with Status Ring */}
                    <div className="relative flex-shrink-0">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-800 group-hover:ring-rose-500 transition-all">
                        {conv.character?.image ? (
                          <Image
                            src={conv.character.image}
                            alt={conv.character.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      {/* Online Indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Character */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                            {conv.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <span className="truncate">with {conv.character?.name || 'Unknown'}</span>
                            {conv.character?.category && (
                              <>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-medium">
                                  {conv.character.category}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDelete(conv._id, e)}
                          disabled={deleteLoading === conv._id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Delete conversation"
                        >
                          {deleteLoading === conv._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Last Message Preview */}
                      {conv.lastMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                          {conv.lastMessage}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="font-medium">{conv.messageCount}</span>
                          <span>messages</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {isValidDate 
                              ? formatDistanceToNow(lastMessageDate, { addSuffix: true })
                              : 'Just now'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer - Enhanced */}
        {filteredConversations.length > 0 && !searchQuery && (
          <div className="mt-8 p-5 bg-gradient-to-r from-rose-50 via-purple-50 to-blue-50 dark:from-rose-950/20 dark:via-purple-950/20 dark:to-blue-950/20 border-2 border-rose-200 dark:border-rose-900 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-900 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} saved
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    All conversations are auto-saved
                  </p>
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
