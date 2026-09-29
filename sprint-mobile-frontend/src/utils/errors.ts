import { isAxiosError } from 'axios';

// Converte erros de requisição em mensagens claras para o usuário,
// diferenciando falha de conexão de erros retornados pela API.
export const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução e o endereço em "Servidor" abaixo.';
    }
  }
  return fallback;
};
