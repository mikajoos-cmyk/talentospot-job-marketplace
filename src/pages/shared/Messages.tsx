import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { messagesService } from '@/services/messages.service';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    const loadConversations = async () => {
      if (!user.id) return;

      try {
        setLoading(true);
        const convData = await messagesService.getConversations(user.id);
        setConversations(convData || []);

        if (convData && convData.length > 0 && !selectedConversation) {
          setSelectedConversation(convData[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user.id]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return;

      try {
        setLoadingMessages(true);
        const msgData = await messagesService.getMessages(selectedConversation);
        setMessages(msgData || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedConversation]);


  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const getPartnerId = (conversation: any) => {
    return conversation.participant_1 === user.id
      ? conversation.participant_2
      : conversation.participant_1;
  };

  const getPartnerInfo = (conversation: any) => {
    const isParticipant1 = conversation.participant_1 === user.id;
    return isParticipant1 ? conversation.participant2 : conversation.participant1;
  };

  const handleNavigateToProfile = () => {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const partnerId = getPartnerId(conversation);

    if (user.role === 'candidate') {
      navigate(`/companies/${partnerId}`);
    } else {
      navigate(`/employer/candidates/${partnerId}`);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      await messagesService.sendMessage(selectedConversation, user.id, messageInput.trim());

      const updatedMessages = await messagesService.getMessages(selectedConversation);
      setMessages(updatedMessages || []);

      showToast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully',
      });
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const partner = getPartnerInfo(conv);
    const partnerName = partner?.full_name || '';
    return partnerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentPartner = currentConversation ? getPartnerInfo(currentConversation) : null;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100dvh-160px)] md:h-[calc(100vh-200px)]">
        <Card className="h-full border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversation List - Hidden on mobile when chat is open */}
            <div className={`border-r border-border ${showMobileChat ? 'hidden md:block' : 'block'}`}>
              <div className="p-4 border-b border-border">
                <h2 className="text-h3 font-heading text-foreground mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    type="search"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background text-foreground border-border"
                  />
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(100%-120px)]">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-body text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const partner = getPartnerInfo(conversation);
                    const partnerId = getPartnerId(conversation);

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`w-full p-4 flex items-start space-x-3 hover:bg-muted transition-colors border-b border-border ${
                          selectedConversation === conversation.id ? 'bg-muted' : ''
                        }`}
                      >
                        <Avatar
                          className="w-12 h-12 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user.role === 'candidate') {
                              navigate(`/companies/${partnerId}`);
                            } else {
                              navigate(`/employer/candidates/${partnerId}`);
                            }
                          }}
                        >
                          <AvatarImage src={partner?.avatar_url} alt={partner?.full_name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {partner?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className="text-body-sm font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (user.role === 'candidate') {
                                  navigate(`/companies/${partnerId}`);
                                } else {
                                  navigate(`/employer/candidates/${partnerId}`);
                                }
                              }}
                            >
                              {partner?.full_name || 'User'}
                            </h4>
                            <span className="text-caption text-muted-foreground flex-shrink-0 ml-2">
                              {formatTimestamp(conversation.last_message_at || conversation.created_at)}
                            </span>
                          </div>
                          <p className="text-body-sm truncate text-muted-foreground">
                            Last message {formatTimestamp(conversation.last_message_at || conversation.created_at)}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area - Full screen on mobile when open */}
            <div className={`md:col-span-2 flex flex-col ${showMobileChat ? 'block' : 'hidden md:flex'}`}>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center space-x-3">
                {/* Mobile Back Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="md:hidden bg-transparent text-foreground hover:bg-muted hover:text-foreground min-h-[44px] min-w-[44px]"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                </Button>

                {/* Clickable Profile Area */}
                <div
                  className="flex items-center space-x-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleNavigateToProfile}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={currentPartner?.avatar_url} alt={currentPartner?.full_name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentPartner?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-body font-medium text-foreground hover:text-primary transition-colors">
                      {currentPartner?.full_name || 'User'}
                    </h3>
                    <p className="text-caption text-muted-foreground">Click to view profile</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-body text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender_id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-body-sm">{message.content}</p>
                        <p className={`text-caption mt-1 ${
                          message.sender_id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatMessageTime(message.sent_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-background text-foreground border-border min-h-[44px]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal min-h-[44px] min-w-[44px]"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Messages;
