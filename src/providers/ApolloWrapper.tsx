"use client";

import {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";


const QueryClientWrapper = ({children}: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5分钟
        retry: 1,
      },
    },
  });
  return <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>;
};

export {QueryClientWrapper};
