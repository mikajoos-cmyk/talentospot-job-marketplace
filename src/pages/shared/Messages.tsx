import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Send, Search, ArrowLeft, Loader2, Paperclip, Check, CheckCheck, Plus, X, Download, FileText, MoreVertical } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { messagesService } from '../../services/messages.service';
import { storageService } from '../../services/storage.service';
import { candidateService } from '../../services/candidate.service';
import { employerService } from '../../services/employer.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string; name: string } | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectableUsers, setSelectableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // --- GROUP MESSAGES BY DATE ---
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; msgs: any[] }[] = [];
    messages.forEach((msg) => {
      const dateStr = new Date(msg.sent_at).toDateString();
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === dateStr) {
        lastGroup.msgs.push(msg);
      } else {
        groups.push({ date: dateStr, msgs: [msg] });
      }
    });
    return groups;
  }, [messages]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, selectedConversation]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [messageInput]);

  useEffect(() => {
    const loadConversations = async () => {
      if (!user.id) return;

      try {
        setLoading(true);
        const convData = await messagesService.getConversations(user.id);
        console.log('🔍 Loaded conversations:', convData);
        console.log('🔍 First conversation:', convData?.[0]);
        setConversations(convData || []);
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
        console.log('📨 Loaded messages:', msgData);
        console.log('📨 First message is_read:', msgData?.[0]?.is_read);
        setMessages(msgData || []);

        // Mark all as read when messages are loaded
        await messagesService.markAllAsRead(selectedConversation, user.id);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Live polling every 4 seconds
    const interval = setInterval(() => {
      if (selectedConversation) {
        messagesService.getMessages(selectedConversation).then(msgData => {
          setMessages(msgData || []);
          messagesService.markAllAsRead(selectedConversation, user.id);
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedConversation, user.id]);

  // Polling for conversation list updates
  useEffect(() => {
    if (!user.id) return;

    const interval = setInterval(async () => {
      try {
        const convData = await messagesService.getConversations(user.id);
        setConversations(convData || []);
      } catch (error) {
        console.error('Error polling conversations:', error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user.id]);


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
    const partner = isParticipant1 ? conversation.participant2 : conversation.participant1;

    console.log('🔍 Partner data:', partner);
    console.log('🔍 Partner role:', partner?.role);
    console.log('🔍 Employer profiles:', partner?.employer_profiles);

    // If partner is an employer, use employer profile data
    // Note: employer_profiles is an object, not an array
    if (partner?.role === 'employer' && partner?.employer_profiles) {
      const employerProfile = partner.employer_profiles;
      return {
        ...partner,
        display_name: employerProfile.company_name || partner.full_name,
        contact_person: employerProfile.contact_person,
        avatar_url: employerProfile.logo_url || partner.avatar_url,
        full_name: employerProfile.company_name || partner.full_name,
      };
    }

    return {
      ...partner,
      display_name: partner?.full_name,
      contact_person: null,
    };
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

  const handleSendMessage = async (text?: string, fileUrl?: string, fileType?: string, fileName?: string) => {
    const content = text || messageInput.trim();
    if (!content && !fileUrl) return;
    if (!selectedConversation) return;

    try {
      await messagesService.sendMessage(selectedConversation, user.id, content, fileUrl, fileType, fileName);

      const updatedMessages = await messagesService.getMessages(selectedConversation);
      setMessages(updatedMessages || []);

      // Reload conversations to update preview
      const convData = await messagesService.getConversations(user.id);
      console.log('✉️ Reloaded conversations after send:', convData);
      console.log('✉️ First conv last_message_content:', convData?.[0]?.last_message_content);
      setConversations(convData || []);

      if (!fileUrl) {
        setMessageInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedConversation) return;

    const file = e.target.files[0];
    let fileType = 'document';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type === 'application/pdf') {
      fileType = 'pdf';
    }

    setIsUploading(true);
    try {
      const publicUrl = await storageService.uploadDocument(user.id, file);
      await handleSendMessage(fileType === 'image' ? 'Sent an image' : `Sent a file: ${file.name}`, publicUrl, fileType, file.name);
    } catch (error) {
      console.error('Upload Error:', error);
      showToast({
        title: 'Upload Failed',
        description: 'Could not upload file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      window.open(url, '_blank');
    }
  };

  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setLoadingUsers(true);
    try {
      let users = [];
      if (user.role === 'candidate') {
        users = await employerService.searchEmployers();
      } else {
        users = await candidateService.searchCandidates();
      }
      setSelectableUsers(users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartConversation = async (partnerId: string) => {
    try {
      const conversation = await messagesService.getOrCreateConversation(user.id, partnerId);
      const convData = await messagesService.getConversations(user.id);
      setConversations(convData || []);
      setSelectedConversation(conversation.id);
      setIsNewChatOpen(false);
      setShowMobileChat(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const filteredUsers = selectableUsers.filter(u => {
    const name = u.full_name || u.company_name || u.profiles?.full_name || '';
    return name.toLowerCase().includes(userSearchQuery.toLowerCase());
  });

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
        <Card className="h-full border border-border bg-card overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversation List */}
            <div className={`flex flex-col border-r border-border ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Messages</h2>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-8 h-8"
                    onClick={handleOpenNewChat}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    type="search"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-9 rounded-full"
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <Button variant="link" size="sm" onClick={handleOpenNewChat}>Start a new one</Button>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const partner = getPartnerInfo(conversation);
                    const isSelected = selectedConversation === conversation.id;

                    console.log('🔍 Conversation:', conversation);
                    console.log('🔍 Partner info:', partner);
                    console.log('🔍 Last message content:', conversation.last_message_content);

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`w-full p-4 flex items-start space-x-3 transition-all border-b border-border/50 hover:bg-muted/50 ${isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                          }`}
                      >
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={partner?.avatar_url} alt={partner?.display_name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {partner?.display_name?.charAt(0) || partner?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {partner?.display_name || partner?.full_name || 'User'}
                              {partner?.contact_person && (
                                <span className="text-xs font-normal text-muted-foreground ml-2">
                                  ({partner.contact_person})
                                </span>
                              )}
                            </h4>
                            <span className="text-[10px] uppercase font-medium text-muted-foreground">
                              {formatTimestamp(conversation.last_message_at || conversation.created_at)}
                            </span>
                          </div>
                          <p className="text-xs truncate text-muted-foreground font-medium">
                            {conversation.last_message_content || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`md:col-span-2 flex flex-col bg-muted/10 ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
              {!selectedConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground/30">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Your Messages</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Connect with candidates and employers directly on the platform.
                  </p>
                  <Button className="mt-4 rounded-full" onClick={handleOpenNewChat}>New Message</Button>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-3 md:p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBackToList}
                        className="md:hidden bg-transparent -ml-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>

                      <div
                        className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                        onClick={handleNavigateToProfile}
                      >
                        <Avatar className="w-10 h-10 border border-border shadow-sm">
                          <AvatarImage src={currentPartner?.avatar_url} alt={currentPartner?.display_name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {currentPartner?.display_name?.charAt(0) || currentPartner?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {currentPartner?.display_name || currentPartner?.full_name || 'User'}
                            {currentPartner?.contact_person && (
                              <span className="text-xs font-normal text-muted-foreground ml-2">
                                ({currentPartner.contact_person})
                              </span>
                            )}
                          </h3>
                          <p className="text-[10px] text-primary font-medium hover:underline">View Profile</p>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col custom-scrollbar bg-slate-50/50">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Start the conversation!</p>
                      </div>
                    ) : (
                      groupedMessages.map((group) => (
                        <div key={group.date} className="space-y-4">
                          <div className="flex justify-center sticky top-0 z-10 py-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 backdrop-blur-md text-muted-foreground px-3 py-1 rounded-full shadow-sm border border-border/50">
                              {formatDateHeader(group.date)}
                            </span>
                          </div>
                          <div className="space-y-4 flex flex-col">
                            {group.msgs.map((message) => {
                              const isMe = message.sender_id === user.id;
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                  <div
                                    className={`group max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative ${isMe
                                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                                      : 'bg-white border border-border text-foreground rounded-tl-none'
                                      }`}
                                  >
                                    {message.file_url ? (
                                      <div className="space-y-2">
                                        {message.file_type === 'image' ? (
                                          <div
                                            className="rounded-lg overflow-hidden border border-black/5 cursor-pointer max-w-[280px]"
                                            onClick={() => setPreviewFile({ url: message.file_url, type: 'image', name: message.file_name || 'Image' })}
                                          >
                                            <img
                                              src={message.file_url}
                                              alt={message.file_name}
                                              className="w-full h-auto max-h-48 object-cover"
                                            />
                                          </div>
                                        ) : (
                                          <div
                                            className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer border ${isMe ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-muted/50 border-border'
                                              }`}
                                            onClick={() => setPreviewFile({ url: message.file_url, type: message.file_type || 'document', name: message.file_name || 'File' })}
                                          >
                                            <div className={`p-2 rounded-full ${isMe ? 'bg-white/20' : 'bg-primary/10'}`}>
                                              <FileText className={`w-4 h-4 ${isMe ? 'text-white' : 'text-primary'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-semibold truncate">{message.file_name || 'Document'}</p>
                                              <p className="text-[10px] opacity-70">Click to preview</p>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className={`w-7 h-7 rounded-full shrink-0 ${isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-primary/10 text-primary'}`}
                                              onClick={(e) => handleDownload(e, message.file_url, message.file_name || 'file')}
                                            >
                                              <Download className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        )}
                                        {message.content && message.content !== 'Sent an image' && !message.content.startsWith('Sent a file:') && (
                                          <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    )}
                                    <div className={`flex items-center justify-end space-x-1 mt-1 opacity-70`}>
                                      <span className="text-[9px] font-bold uppercase tracking-tighter">
                                        {formatMessageTime(message.sent_at)}
                                      </span>
                                      {isMe && (
                                        message.is_read ? (
                                          <CheckCheck className="w-3 h-3 text-white/90" />
                                        ) : (
                                          <Check className="w-3 h-3 text-white/60" />
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border bg-card shrink-0">
                    <div className="flex items-end space-x-2 bg-muted/30 p-1.5 rounded-2xl border border-transparent focus-within:border-primary/20 transition-all bg-slate-50">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf,.doc,.docx"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-9 h-9 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                      </Button>
                      <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none max-h-32 min-h-[36px] overflow-y-auto custom-scrollbar font-medium"
                      />
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!messageInput.trim() && !isUploading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 w-9 h-9 rounded-full p-0 flex items-center justify-center shrink-0 shadow-sm disabled:opacity-50"
                        aria-label="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none shadow-2xl">
          <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
            {previewFile && (
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full h-9 px-4 font-semibold"
                onClick={(e) => handleDownload(e, previewFile.url, previewFile.name)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => setPreviewFile(null)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-col h-[80vh]">
            <div className="p-4 bg-white/5 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white/90 truncate pr-24">
                {previewFile?.name}
              </h3>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto p-4 md:p-8">
              {previewFile?.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain rounded-md shadow-lg"
                />
              ) : previewFile?.type === 'pdf' ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-full bg-white rounded-md"
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10 text-white/50" />
                  </div>
                  <p className="text-white/60 font-medium">No preview available for this file type</p>
                  <Button
                    onClick={(e) => previewFile && handleDownload(e, previewFile.url, previewFile.name)}
                    className="rounded-full px-6"
                  >
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold">New Message</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={user.role === 'candidate' ? "Search for employers..." : "Search for candidates..."}
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-none rounded-2xl h-11 focus-visible:ring-1 focus-visible:ring-primary"
                autoFocus
              />
            </div>
          </div>
          <Separator />
          <div className="max-h-[350px] overflow-y-auto px-2 py-2 md:px-4 custom-scrollbar">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground font-medium">No results found</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const name = u.full_name || u.company_name || u.profiles?.full_name || 'Unknown User';
                const avatar = u.logo_url || u.avatar_url || u.profiles?.avatar_url;
                const subtext = u.industry || u.job_title || (u.role === 'candidate' ? 'Candidate' : 'Employer');

                return (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversation(u.id)}
                    className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors group text-left"
                  >
                    <Avatar className="w-11 h-11 border border-border shadow-sm group-hover:scale-105 transition-transform">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate">
                        {subtext}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Messages;
