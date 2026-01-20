import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrdersService } from './orders.service';
import { ORDERS_STATUS } from './enum/orders-status.enum';
import { Logger } from '@nestjs/common';

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
  namespace: '/orders',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly ordersService: OrdersService) {}

  private readonly logger = new Logger(OrdersGateway.name);

  async handleConnection(client: Socket) {
    client.join('orders_room');
    this.logger.log(`✅ клиент подключился: ${client.id}`);

    // Отправляем подтверждение подключения
    client.emit('connection_confirmed', {
      message: 'Успешно подключен к заказам',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ клиент отключился: ${client.id}`);
  }

  // Отправить новый заказ всем подключенным клиентам
  notifyNewOrder(order: any) {
    this.logger.log('📢 новый заказ:', order.orderId);
    this.server.to('orders_room').emit('new_order', order);
  }

  notifyNewOrderToStore(order: any, idStore: number) {
    this.logger.log(`📢 новый заказ:${order.orderId}. Магазин: ${idStore}`);
    this.server.to(`orders_room`).emit(`new_order_${idStore}`, order);
  }

  // Обновить статус заказа
  @SubscribeMessage('update_order_status')
  async handleUpdateOrderStatus(
    @MessageBody() data: { orderId: number; status: ORDERS_STATUS },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(
        `🔄 обновление статуса заказа ${data.orderId} на: ${data.status}`,
      );

      // Обновляем статус в базе данных
      await this.ordersService.updateStatus(data.orderId, data.status);

      // Уведомляем всех клиентов об изменении статуса
      this.server.to('orders_room').emit('order_status_updated', {
        orderId: data.orderId,
        status: data.status,
        updatedBy: client.id,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: 'Статус заказа обновлен' };
    } catch (error) {
      this.logger.error('❌ ошибка при обновлении статуса заказа:', error);
      return { success: false, message: 'Ошибка при обновлении статуса' };
    }
  }

  // Получить все заказы
  @SubscribeMessage('get_orders')
  async handleGetOrders(
    @MessageBody() idStore: number,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const orders = await this.ordersService.findAllStoreOrders(idStore);
      client.emit(`orders_list_${idStore}`, orders);
      return { success: true };
    } catch (error) {
      this.logger.error('❌ ошибка при получении заказов:', error);
      return { success: false, message: 'Ошибка при получении заказов' };
    }
  }

  // Присоединиться к комнате для администраторов (могут менять статусы)
  @SubscribeMessage('join_admin')
  handleJoinAdmin(@ConnectedSocket() client: Socket) {
    client.join('admin_room');
    this.logger.log(
      `👑 клиент ${client.id} присоединился к комнате администраторов`,
    );
    return {
      success: true,
      message: 'Присоединились к комнате администраторов',
    };
  }

  // Получить информацию о подключенных клиентах
  @SubscribeMessage('get_connected_clients')
  async handleGetConnectedClients(@ConnectedSocket() client: Socket) {
    try {
      const ordersRoom = await this.server.in('orders_room').allSockets();
      const adminRoom = await this.server.in('admin_room').allSockets();

      const clientsInfo = {
        ordersRoomClients: ordersRoom.size,
        adminRoomClients: adminRoom.size,
        totalClients: this.server.engine.clientsCount,
        requestedBy: client.id,
      };

      this.logger.log(`📊 статистика клиентов: ${JSON.stringify(clientsInfo)}`);

      client.emit('clients_info', clientsInfo);
      return { success: true };
    } catch (error) {
      this.logger.error(
        '❌ ошибка при получении информации о клиентах:',
        error,
      );
      return {
        success: false,
        message: 'Ошибка при получении информации о клиентах',
      };
    }
  }

  @SubscribeMessage('ping')
  async pong(@ConnectedSocket() client: Socket){
    client.emit('pong')
  }
}
