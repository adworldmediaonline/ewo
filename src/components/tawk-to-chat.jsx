'use client';

import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import { useState } from 'react';
import ChatSkeleton from './chat-skeleton';

export default function TawkToChat() {
  const [isLoading, setIsLoading] = useState(true);

  const handleBeforeLoad = () => {
    setIsLoading(true);
  };

  const handleLoad = () => {
    // Hide skeleton once Tawk.to widget has loaded
    setIsLoading(false);
  };

  const handleStatusChange = status => {
    // Optional: Handle status changes (online, offline, etc.)
    // console.log('Tawk.to status changed:', status);
  };

  const handleChatMaximized = () => {
    // Optional: Handle when chat is maximized
    // console.log('Chat maximized');
  };

  const handleChatMinimized = () => {
    // Optional: Handle when chat is minimized
    // console.log('Chat minimized');
  };

  const handleChatHidden = () => {
    // Optional: Handle when chat is hidden
    // console.log('Chat hidden');
  };

  const handleChatStarted = () => {
    // Optional: Handle when chat conversation starts
    // console.log('Chat started');
  };

  const handleChatEnded = () => {
    // Optional: Handle when chat conversation ends
    // console.log('Chat ended');
  };

  const handlePrechatSubmit = data => {
    // Optional: Handle pre-chat form submission
    // console.log('Prechat submitted:', data);
  };

  const handleOfflineSubmit = data => {
    // Optional: Handle offline form submission
    // console.log('Offline form submitted:', data);
  };

  const handleUnreadCountChanged = count => {
    // Optional: Handle unread message count changes
    // console.log('Unread count changed:', count);
  };

  const handleFileUpload = data => {
    // Optional: Handle file upload events
    // console.log('File uploaded:', data);
  };

  const handleChatSatisfaction = data => {
    // Optional: Handle chat satisfaction rating
    //  console.log('Chat satisfaction:', data);
  };

  const handleChatMessageVisitor = data => {
    // Optional: Handle visitor messages
    // console.log('Visitor message:', data);
  };

  const handleAgentJoinChat = data => {
    // Optional: Handle when agent joins chat
    // console.log('Agent joined chat:', data);
  };

  const handleChatMessageSystem = data => {
    // Optional: Handle system messages
    // console.log('System message:', data);
  };

  return (
    <>
      {isLoading && <ChatSkeleton />}
      <TawkMessengerReact
        propertyId={`${process.env.NEXT_PUBLIC_TAWK_TO_CHAT_PROPERTY_ID}`}
        widgetId={`${process.env.NEXT_PUBLIC_TAWK_TO_CHAT_WIDGET_ID}`}
        onBeforeLoad={handleBeforeLoad}
        onLoad={handleLoad}
        onStatusChange={handleStatusChange}
        onChatMaximized={handleChatMaximized}
        onChatMinimized={handleChatMinimized}
        onChatHidden={handleChatHidden}
        onChatStarted={handleChatStarted}
        onChatEnded={handleChatEnded}
        onPrechatSubmit={handlePrechatSubmit}
        onOfflineSubmit={handleOfflineSubmit}
        onUnreadCountChanged={handleUnreadCountChanged}
        onFileUpload={handleFileUpload}
        onChatSatisfaction={handleChatSatisfaction}
        onChatMessageVisitor={handleChatMessageVisitor}
        onAgentJoinChat={handleAgentJoinChat}
        onChatMessageSystem={handleChatMessageSystem}
      />
    </>
  );
}
