import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { socketService } from '@/services/websocket';
import { addNotification } from '@/store/slices/uiSlice';

/**
 * Hook to initialize WebSocket connection and manage subscriptions
 */
export function useWebSocket() {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  // Initialize WebSocket on mount
  useEffect(() => {
    if (accessToken) {
      socketService.connect(accessToken);

      return () => {
        socketService.disconnect();
      };
    }
  }, [accessToken, dispatch]);

  return socketService;
}

/**
 * Hook to subscribe to a design room
 */
export function useDesignRoom(designId: string | null) {
  useEffect(() => {
    if (designId) {
      socketService.subscribeToDesign(designId);

      return () => {
        socketService.unsubscribeFromDesign(designId);
      };
    }
  }, [designId]);
}

/**
 * Hook to subscribe to a project room
 */
export function useProjectRoom(projectId: string | null) {
  useEffect(() => {
    if (projectId) {
      socketService.subscribeToProject(projectId);
    }
  }, [projectId]);
}

/**
 * Hook to listen for design updates
 */
export function useDesignUpdates(
  callback: (data: any) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    socketService.on('design:updated', callback);

    return () => {
      socketService.off('design:updated', callback);
    };
  }, [callback, ...dependencies]);
}

/**
 * Hook to listen for collaboration events
 */
export function useCollaborationEvents() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleCollaboratorJoined = (data: any) => {
      dispatch(
        addNotification({
          type: 'info',
          message: `${data.user?.name} joined the room`,
          duration: 3000,
        })
      );
    };

    const handleCollaboratorLeft = (data: any) => {
      dispatch(
        addNotification({
          type: 'info',
          message: `${data.user?.name} left the room`,
          duration: 2000,
        })
      );
    };

    socketService.on('collaborator:joined', handleCollaboratorJoined);
    socketService.on('collaborator:left', handleCollaboratorLeft);

    return () => {
      socketService.off('collaborator:joined', handleCollaboratorJoined);
      socketService.off('collaborator:left', handleCollaboratorLeft);
    };
  }, [dispatch]);
}

/**
 * Hook to track cursor positions
 */
export function useCursorTracking(designId: string | null) {
  const handleCursorMove = useCallback(
    (e: MouseEvent) => {
      if (designId) {
        socketService.emitCursorPosition(designId, e.clientX, e.clientY);
      }
    },
    [designId]
  );

  useEffect(() => {
    if (designId) {
      window.addEventListener('mousemove', handleCursorMove);
      return () => {
        window.removeEventListener('mousemove', handleCursorMove);
      };
    }
  }, [designId, handleCursorMove]);
}

/**
 * Hook to request AI updates
 */
export function useAIAgent(designId: string | null) {
  const dispatch = useDispatch<AppDispatch>();

  const requestUpdate = useCallback(
    (agentType: string, prompt: string) => {
      if (!designId) return;

      socketService.requestAIUpdate(designId, agentType, prompt);
      dispatch(
        addNotification({
          type: 'info',
          message: 'AI is processing your request...',
          duration: 2000,
        })
      );
    },
    [designId, dispatch]
  );

  return { requestUpdate };
}
