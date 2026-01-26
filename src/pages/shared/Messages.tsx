import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, ArrowLeft } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

interface Conversation {
  id: string;
  partnerId: string;
  partnerRole: 'candidate' | 'employer';
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  content: string;
  timestamp: string;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      partnerId: 'techcorp',
      partnerRole: 'employer',
      name: 'TechCorp HR',
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
      lastMessage: 'Thank you for your application. We would like to schedule an interview.',
      timestamp: '2 hours ago',
      unread: true,
    },
    {
      id: '2',
      partnerId: 'startupxyz',
      partnerRole: 'employer',
      name: 'StartupXYZ',
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_2.png',
      lastMessage: 'Your profile looks great! Are you available for a call?',
      timestamp: '1 day ago',
      unread: false,
    },
    {
      id: '3',
      partnerId: 'designhub',
      partnerRole: 'employer',
      name: 'DesignHub',
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_3.png',
      lastMessage: 'We received your portfolio. Impressive work!',
      timestamp: '2 days ago',
      unread: false,
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      sender: 'other',
      content: 'Hello! Thank you for applying to the Senior Frontend Developer position.',
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      sender: 'me',
      content: 'Thank you for reaching out! I\'m very interested in this opportunity.',
      timestamp: '10:35 AM',
    },
    {
      id: '3',
      sender: 'other',
      content: 'Great! We would like to schedule an interview with you. Are you available next week?',
      timestamp: '10:40 AM',
    },
    {
      id: '4',
      sender: 'me',
      content: 'Yes, I\'m available. What days work best for you?',
      timestamp: '10:45 AM',
    },
  ];


  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const handleNavigateToProfile = () => {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    if (user.role === 'candidate') {
      navigate(`/companies/${conversation.partnerId}`);
    } else {
      navigate(`/employer/candidates/${conversation.partnerId}`);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Add message to the conversation
      showToast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully',
      });
      setMessageInput('');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);

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
                {filteredConversations.map((conversation) => (
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
                          navigate(`/companies/${conversation.partnerId}`);
                        } else {
                          navigate(`/employer/candidates/${conversation.partnerId}`);
                        }
                      }}
                    >
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {conversation.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h4 
                          className="text-body-sm font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user.role === 'candidate') {
                              navigate(`/companies/${conversation.partnerId}`);
                            } else {
                              navigate(`/employer/candidates/${conversation.partnerId}`);
                            }
                          }}
                        >
                          {conversation.name}
                        </h4>
                        <span className="text-caption text-muted-foreground flex-shrink-0 ml-2">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p className={`text-body-sm truncate ${
                        conversation.unread ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                    )}
                  </button>
                ))}
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
                    <AvatarImage src={currentConversation?.avatar} alt={currentConversation?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentConversation?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-body font-medium text-foreground hover:text-primary transition-colors">
                      {currentConversation?.name}
                    </h3>
                    <p className="text-caption text-muted-foreground">Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-body-sm">{message.content}</p>
                      <p className={`text-caption mt-1 ${
                        message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
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
