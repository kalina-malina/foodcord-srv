export enum TYPE_PRODUCT_ENUM {
  INGRIDIENT = 'ingridient',
  SIZE_PRODUCT = 'size',
}

export const TYPE_PRODUCT_ENUM_VALUE: Record<TYPE_PRODUCT_ENUM, string> = {
  [TYPE_PRODUCT_ENUM.INGRIDIENT]: 'Ингредиенты',
  [TYPE_PRODUCT_ENUM.SIZE_PRODUCT]: 'Размер продукта',
};
