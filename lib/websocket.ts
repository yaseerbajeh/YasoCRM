import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

// WebSocket configuration from environment variables
const wsConfig = {
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_WS_KEY || 'whatsappcrm2024key',
  wsHost: process.env.NEXT_PUBLIC_WS_HOST || 'localhost',
  wsPort: parseInt(process.env.NEXT_PUBLIC_WS_PORT || '8080'),
  wssPort: parseInt(process.env.NEXT_PUBLIC_WS_PORT || '8080'),
  forceTLS: process.env.NEXT_PUBLIC_WS_FORCE_TLS === 'true',
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
};

// Initialize Laravel Echo instance
let echoInstance: Echo | null = null;

export const getEcho = (): Echo => {
  if (!echoInstance && typeof window !== 'undefined') {
    echoInstance = new Echo(wsConfig);
  }
  return echoInstance!;
};

// Hook to use WebSocket in components
export const useWebSocket = () => {
  const echo = getEcho();

  const subscribeToChannel = (channelName: string, eventName: string, callback: (data: any) => void) => {
    const channel = echo.channel(channelName);
    channel.listen(eventName, callback);
    return () => {
      channel.stopListening(eventName);
    };
  };

  const subscribeToPrivateChannel = (channelName: string, eventName: string, callback: (data: any) => void) => {
    const channel = echo.private(channelName);
    channel.listen(eventName, callback);
    return () => {
      channel.stopListening(eventName);
    };
  };

  const disconnect = () => {
    if (echoInstance) {
      echoInstance.disconnect();
      echoInstance = null;
    }
  };

  return {
    echo,
    subscribeToChannel,
    subscribeToPrivateChannel,
    disconnect,
  };
};

export default getEcho;
