"use client";

import {ReactNode, useMemo} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useWebSocketCacheInvalidation} from "@/hooks/useWebSocketCacheInvalidation";
import {useRouter} from "next/navigation";

interface QueryClientWrapperProps {
    children: ReactNode;
    websocketUrl?: string;
}

const QueryClientWrapper = ({children, websocketUrl}: QueryClientWrapperProps) => {
    const router = useRouter();
    const queryClient = useMemo(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                retry: 3,
            },
        },
    }), []);

    useWebSocketCacheInvalidation(queryClient, {
        url: websocketUrl || process.env.NEXT_PUBLIC_WEBSOCKET_URL || "",
        reconnectDelay: 3000,
        maxReconnectAttempts: 10,
        onInvalidate: () => router.refresh(),
    });

    return <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>;
};

export {QueryClientWrapper};
