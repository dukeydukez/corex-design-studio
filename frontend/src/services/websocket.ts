import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';

let socket: Socket | null = null;

export const socketService = {
  /**
   * Initialize WebSocket connection
   */
  connect: (token: string) => {
    if (socket?.connected) {
      return socket;
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    socket = io(serverUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('[WebSocket] Connected', socket?.id);
      store.dispatch(
        addNotification({
          type: 'success',
          message: 'Connected to real-time updates',
          duration: 2000,
        })
      );
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      store.dispatch(
        addNotification({
          type: 'error',
          message: 'Real-time connection error',
          duration: 3000,
        })
      );
    });

    // Design events
    socket.on('design:updated', (data) => {
      console.log('[WebSocket] Design updated:', data);
      // Dispatch Redux action to update design
    });

    socket.on('design:deleted', (data) => {
      console.log('[WebSocket] Design deleted:', data);
      // Dispatch Redux action to remove design
    });

    socket.on('design:shared', (data) => {
      console.log('[WebSocket] Design shared:', data);
      store.dispatch(
        addNotification({
          type: 'info',
          message: `${data.user} shared a design with you`,
          duration: 4000,
        })
      );
    });

    // Collaboration events
    socket.on('collaborator:joined', (data) => {
      console.log('[WebSocket] Collaborator joined:', data);
      store.dispatch(
        addNotification({
          type: 'info',
          message: `${data.user} is now editing`,
          duration: 3000,
        })
      );
    });

    socket.on('collaborator:left', (data) => {
      console.log('[WebSocket] Collaborator left:', data);
    });

    socket.on('cursor:moved', (data) => {
      console.log('[WebSocket] Cursor moved:', data);
      // Update cursor position in Redux
    });

    // Export events
    socket.on('export:ready', (data) => {
      console.log('[WebSocket] Export ready:', data);
      store.dispatch(
        addNotification({
          type: 'success',
          message: 'Export is ready for download',
          duration: 5000,
        })
      );
    });

    socket.on('export:error', (data) => {
      console.log('[WebSocket] Export error:', data);
      store.dispatch(
        addNotification({
          type: 'error',
          message: 'Export failed: ' + data.error,
          duration: 5000,
        })
      );
    });

    // AI Agent events
    socket.on('agent:progress', (data) => {
      console.log('[WebSocket] Agent progress:', data);
      store.dispatch(
        addNotification({
          type: 'info',
          message: `AI is analyzing your design...`,
          duration: 2000,
        })
      );
    });

    socket.on('agent:complete', (data) => {
      console.log('[WebSocket] Agent complete:', data);
      store.dispatch(
        addNotification({
          type: 'success',
          message: 'AI suggestions ready',
          duration: 4000,
        })
      );
    });

    return socket;
  },

  /**
   * Disconnect WebSocket
   */
  disconnect: () => {
    if (socket?.connected) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Get socket instance
   */
  getSocket: (): Socket | null => socket,

  /**
   * Subscribe to design room
   */
  subscribeToDesign: (designId: string) => {
    if (!socket?.connected) {
      console.warn('[WebSocket] Socket not connected');
      return;
    }

    socket.emit('subscribe:design', { designId }, (response: any) => {
      console.log('[WebSocket] Subscribed to design:', designId, response);
    });
  },

  /**
   * Unsubscribe from design room
   */
  unsubscribeFromDesign: (designId: string) => {
    if (!socket?.connected) {
      return;
    }

    socket.emit('unsubscribe:design', { designId }, (response: any) => {
      console.log('[WebSocket] Unsubscribed from design:', designId, response);
    });
  },

  /**
   * Subscribe to project room
   */
  subscribeToProject: (projectId: string) => {
    if (!socket?.connected) {
      console.warn('[WebSocket] Socket not connected');
      return;
    }

    socket.emit('subscribe:project', { projectId }, (response: any) => {
      console.log('[WebSocket] Subscribed to project:', projectId, response);
    });
  },

  /**
   * Emit cursor position (for real-time collaboration)
   */
  emitCursorPosition: (designId: string, x: number, y: number) => {
    if (!socket?.connected) {
      return;
    }

    socket.emit('cursor:move', { designId, x, y });
  },

  /**
   * Request design update from AI agent
   */
  requestAIUpdate: (designId: string, agentType: string, prompt: string) => {
    if (!socket?.connected) {
      console.warn('[WebSocket] Socket not connected');
      return;
    }

    socket.emit('agent:request', { designId, agentType, prompt }, (response: any) => {
      console.log('[WebSocket] AI request sent:', response);
    });
  },

  /**
   * Listen to custom event
   */
  on: (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  /**
   * Emit custom event
   */
  emit: (event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  },

  /**
   * Remove event listener
   */
  off: (event: string, callback?: Function) => {
    if (socket) {
      socket.off(event, callback as any);
    }
  },
};

export default socketService;
