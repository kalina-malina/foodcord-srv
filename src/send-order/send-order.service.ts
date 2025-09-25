import { Injectable, Logger } from '@nestjs/common';
import { PositionDto } from './dto/create-send-order.dto';
import axios from 'axios';
import { CREATE_ORDER_SET_ENUM } from './enum/create-order-set.enum';
import moment from 'moment';

@Injectable()
export class SendOrderService {
  private readonly logger = new Logger(SendOrderService.name);
  private readonly baseUrl = 'http://10.32.2.51:8081/set-kit/softcheques';

  async sendOrder(
    orderNumber: string,
    shopNumber: number,
    createSendOrderDto: PositionDto[],
  ) {
    try {
      const url = `${this.baseUrl}/${orderNumber}/shop/${shopNumber}`; //${shopNumber}

      const payload = {
        status: CREATE_ORDER_SET_ENUM.READY_TO_PAYMENT,
        dateCreated: moment().format('YYYY-MM-DD HH:mm'),
        isEditable: false,
        discountsValue: 0,
        additionalInfo: 'привет я тестовый чек',
        totalPrice:
          Math.round(
            createSendOrderDto.reduce(
              (acc, position) =>
                acc + (position.unitPrice || 0.1) * (position.quantity || 1),
              0,
            ) * 10,
          ) / 10,
        positions: createSendOrderDto.map((position) => ({
          positionOrder: createSendOrderDto.indexOf(position) + 1,
          code: position.code, //'125195', //position.code ||
          quantity: position.quantity || 1,
          unitPrice: position.unitPrice || 0.1,
          totalPrice:
            Math.round(
              (position.unitPrice || 0.1) * (position.quantity || 1) * 10,
            ) / 10,
          discountValue: position.discountValue || 0,
          isFixedPrice:
            position.isFixedPrice !== undefined ? position.isFixedPrice : true,
          calculationMethod: position.calculationMethod || 4,
        })),
        operationType: 1,
        prePayment: 0,
        receiptEditable: true,
        positionsAddingAllowed: false,
      };

      const headers = {
        'Content-Type': 'application/json',
      };

      this.logger.log(`Отправляем заказ ${orderNumber} на URL: ${url}`);
      this.logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await axios.put(url, payload, { headers });

      this.logger.log(
        `Заказ ${orderNumber} успешно отправлен. Status: ${response.status}`,
      );

      return {
        success: true,
        status: response.status,
        data: response.data,
        orderNumber,
        message: 'Заказ успешно отправлен в SetRetail10',
      };
    } catch (error: any) {
      this.logger.error(
        `Ошибка при отправке заказа ${orderNumber}:`,
        JSON.stringify(
          {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
          },
          null,
          2,
        ),
      );

      if (error.response) {
        return {
          success: false,
          status: error.response.status,
          data: error.response.data,
          orderNumber,
          message: `Ошибка сервера: ${error.response.status}`,
          error: error.message,
          fullError: {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers,
          },
        };
      } else {
        return {
          success: false,
          orderNumber,
          message: 'Ошибка при отправке заказа в SetRetail10',
          error: error.message,
          fullError: error.toString(),
        };
      }
    }
  }
}
