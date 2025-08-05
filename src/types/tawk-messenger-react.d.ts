declare module '@tawk.to/tawk-messenger-react' {
  interface TawkMessengerReactProps {
    propertyId: string;
    widgetId: string;
    onBeforeLoad?: () => void;
    onLoad?: () => void;
    onStatusChange?: (status: string) => void;
    onChatMaximized?: () => void;
    onChatMinimized?: () => void;
    onChatHidden?: () => void;
    onChatStarted?: () => void;
    onChatEnded?: () => void;
    onPrechatSubmit?: (data: any) => void;
    onOfflineSubmit?: (data: any) => void;
    onUnreadCountChanged?: (count: number) => void;
    onFileUpload?: (data: any) => void;
    onChatSatisfaction?: (data: any) => void;
    onChatMessageVisitor?: (data: any) => void;
    onAgentJoinChat?: (data: any) => void;
    onChatMessageSystem?: (data: any) => void;
  }
  
  const TawkMessengerReact: React.FC<TawkMessengerReactProps>;
  export default TawkMessengerReact;
}
