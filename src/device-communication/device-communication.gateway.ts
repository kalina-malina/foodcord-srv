import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  //MessageBody,
  //ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DeviceCommunicationService } from './device-communication.service';

@WebSocketGateway({
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'Upgrade',
      'Connection',
      'Sec-WebSocket-Key',
      'Sec-WebSocket-Version',
      'Sec-WebSocket-Protocol',
    ],
  },
  namespace: '/device-communication',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class DeviceCommunicationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly deviceCommunicationService: DeviceCommunicationService,
  ) {}

  private readonly logger = new Logger(DeviceCommunicationGateway.name);

  async handleConnection(client: Socket) {
    client.join('device-communication_room');
    this.logger.log(`Телевизор подключился: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Телевизор отключился: ${client.id}`);
  }

  sendIdStoreToMessage(code: number, idStore: number) {
    this.server.to(`code_${code}`).emit('store_assigned', {
      idStore: idStore,
    });
  }
  @SubscribeMessage('leave_pairing_room')
  handleLeavePairingRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(roomName);
  }

  @SubscribeMessage('join_pairing_room')
  handleJoinPairingRoom(
    @MessageBody() code: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`code_${code}`);
  }
}
