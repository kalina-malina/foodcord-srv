import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    //MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
import { DeviceCommunicationService } from './device-communication.service';
  
  @WebSocketGateway({
    cors: {
      origin: [
        'https://statosphera.ru',
        'statosphera.ru',
        'http://localhost:3000',
      ],
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
  export class DeviceCommunicationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(
        private readonly deviceCommunicationService: DeviceCommunicationService
    ) {}
  
    private readonly logger = new Logger(DeviceCommunicationGateway.name);
  
    async handleConnection(client: Socket) {
      client.join('device-communication_room');
      
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`❌ клиент отключился: ${client.id}`);
    }
  
   
    @SubscribeMessage('get_orders')
    async handleGetOrders(@ConnectedSocket() client: Socket) {
      
    }
  
   
  }
  