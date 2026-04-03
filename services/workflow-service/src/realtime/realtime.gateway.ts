import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedUsers = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, sockets] of this.connectedUsers) {
      sockets.delete(client.id);
      if (sockets.size === 0) this.connectedUsers.delete(userId);
    }
  }

  @SubscribeMessage('auth')
  handleAuth(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (!data.userId) return;
    if (!this.connectedUsers.has(data.userId)) {
      this.connectedUsers.set(data.userId, new Set());
    }
    this.connectedUsers.get(data.userId)!.add(client.id);
    client.join(`user:${data.userId}`);
    this.logger.log(`User ${data.userId} authenticated (socket ${client.id})`);
  }

  @SubscribeMessage('chat:typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { taskId: string; userId: string; userName: string }) {
    client.to(`task:${data.taskId}`).emit('chat:typing', { userId: data.userId, userName: data.userName });
  }

  @SubscribeMessage('task:join')
  handleJoinTask(@ConnectedSocket() client: Socket, @MessageBody() data: { taskId: string }) {
    client.join(`task:${data.taskId}`);
    this.logger.log(`Socket ${client.id} joined task:${data.taskId}`);
  }

  @SubscribeMessage('task:leave')
  handleLeaveTask(@ConnectedSocket() client: Socket, @MessageBody() data: { taskId: string }) {
    client.leave(`task:${data.taskId}`);
  }

  emitTaskUpdated(taskId: string, data: Record<string, unknown>) {
    this.server.emit('task:updated', { taskId, ...data });
  }

  emitTaskAssigned(userId: string, data: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit('task:assigned', data);
  }

  emitChatMessage(taskId: string, message: Record<string, unknown>) {
    this.server.to(`task:${taskId}`).emit('chat:message', message);
  }

  emitNotification(userId: string, notification: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }
}
