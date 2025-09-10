export enum TYPE_PRODUCT_ENUM {
  INGREDIENT = 'ingredients',
  TYPE = 'type',
  EXTRAS = 'extras',
}

export const TYPE_PRODUCT_ENUM_VALUE: Record<TYPE_PRODUCT_ENUM, string> = {
  [TYPE_PRODUCT_ENUM.INGREDIENT]: 'Ингредиенты',
  [TYPE_PRODUCT_ENUM.TYPE]: 'Тип продукта',
  [TYPE_PRODUCT_ENUM.EXTRAS]: 'Дополнительные продукты',
};
