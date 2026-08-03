export type ResponseDTO<T = any> = {
  code: string;
  message: string;
  data: T;
};
