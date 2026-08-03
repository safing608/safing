import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1 * 60 * 1000
    },
    mutations: {},
  },
});

export default queryClient;
