/**
 * Типы операций с базой данных при использовании методов grud-posgres
 */

export enum GRUD_OPERATION {
  QUERY = 'executeQuery',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  INSERT_ON_UPDAETE = 'insertUpdate',
}
