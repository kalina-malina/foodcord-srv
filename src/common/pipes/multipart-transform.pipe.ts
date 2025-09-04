import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class MultipartTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value) {
      const transformed = this.transformMultipartData(value);

      return transformed;
    }
    return value;
  }

  private transformMultipartData(data: any): any {
    const result = { ...data };

    // Список полей, которые должны быть массивами
    const arrayFields = [
      'visualType',
      'group',
      'subgroup',
      'types',
      'ingredients',
    ];

    // Список полей, которые должны быть числами
    const numberFields = ['fats', 'proteins', 'carbohydrates', 'calories'];

    // Трансформируем массивы
    arrayFields.forEach((field) => {
      if (result[field] && typeof result[field] === 'string') {
        try {
          result[field] = JSON.parse(result[field]);
        } catch {
          // Если не JSON, разбираем как строку с запятыми
          if (field === 'subgroup') {
            result[field] = result[field]
              .split(',')
              .map((item: string) => item.trim());
          } else {
            result[field] = result[field]
              .split(',')
              .map((item: string) => parseInt(item.trim()));
          }
        }
      }
    });

    // Трансформируем числа
    numberFields.forEach((field) => {
      if (result[field] && typeof result[field] === 'string') {
        const num = parseFloat(result[field]);
        result[field] = isNaN(num) ? 0 : num;
      }
    });

    return result;
  }
}
