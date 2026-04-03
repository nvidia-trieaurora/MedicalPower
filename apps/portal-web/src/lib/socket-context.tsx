'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';

interface SocketContextType {
  connected: boolean;
  emit: (event: string, data: unknown) => void;
  on: (event: string, handler: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  connected: false,
  emit: () => {},
  on: () => () => {},
});

export function useSocket() { return useContext(SocketContext); }

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4006';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    if (!user) return;

    let socket: any = null;

    (async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io(`${WS_URL}/ws`, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionAttempts: 10,
        });

        socket.on('connect', () => {
          setConnected(true);
          socket.emit('auth', { userId: user.id });
        });

        socket.on('disconnect', () => setConnected(false));

        socket.onAny((event: string, data: any) => {
          const handlers = listenersRef.current.get(event);
          if (handlers) handlers.forEach((h) => h(data));
        });

        socketRef.current = socket;
      } catch {}
    })();

    return () => {
      if (socket) { socket.disconnect(); socket = null; }
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
    listenersRef.current.get(event)!.add(handler);
    return () => { listenersRef.current.get(event)?.delete(handler); };
  }, []);

  return (
    <SocketContext.Provider value={{ connected, emit, on }}>
      {children}
    </SocketContext.Provider>
  );
}
