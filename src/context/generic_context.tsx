"use client";

import {
    createContext,
    useContext,
    type ReactNode,
    useState,
    useCallback,
    useRef,
    useEffect,
} from "react";

/**
 * Generic Context Type for CRUD operations.
 */
export interface GenericContextType<T> {
    data: T | null; // Active item (e.g., current session user or selected item)
    list: T[]; // List of all items
    total: number; // Total count of items across all pages (server-reported)
    totalPages: number; // Total number of pages (server-reported)
    isLoading: boolean; // Loading state for single item/initialization
    isListLoading: boolean; // Loading state for the list
    setData: (data: T | null) => void;
    setList: (list: T[]) => void;
    clear: () => void;
    refresh: () => Promise<T | null>;
    fetchAll: (queryParams?: Record<string, string>) => Promise<void>;
    add: (itemData: Partial<T>) => Promise<boolean>;
    update: (id: string, itemData: Partial<T>) => Promise<boolean>;
    deleteItem: (id: string) => Promise<boolean>;
}

/**
 * Creates a Generic Context and Provider.
 * This pattern allows us to reuse CRUD logic across different entities.
 */
export function createGenericContext<T>() {
    const Context = createContext<GenericContextType<T> | undefined>(undefined);

    const useGenericContext = (contextName: string) => {
        const context = useContext(Context);
        if (context === undefined) {
            throw new Error(`${contextName} must be used within its Provider`);
        }
        return context;
    };

    return { Context, useGenericContext };
}

/**
 * Base Props for the Generic Provider.
 */
export interface GenericProviderProps<T> {
    children: ReactNode;
    apiRoute: string;
    refreshRoute?: string;
    // Optional mapper to extract data from custom API response structures
    dataMapper?: (response: unknown) => T | null;
}

/**
 * A reusable hook-like logic for CRUD state.
 */
export function useGenericCrudLogic<T>({
    apiRoute,
    refreshRoute,
    dataMapper = (res: unknown) => ((res as { data?: T }) || res) as T,
}: Omit<GenericProviderProps<T>, "children">) {
    const [data, setData] = useState<T | null>(null);
    const [list, setList] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isListLoading, setIsListLoading] = useState(false);

    // Keep a stable ref to dataMapper to prevent infinite loops in hooks/effects
    const dataMapperRef = useRef(dataMapper);
    useEffect(() => {
        dataMapperRef.current = dataMapper;
    }, [dataMapper]);

    const refresh = useCallback(async () => {
        if (!refreshRoute) {
            setIsLoading(false);
            return null;
        }
        try {
            const response = await fetch(refreshRoute);
            if (response.ok) {
                const result = await response.json();
                const extracted = dataMapperRef.current(result);
                setData(extracted);
                return extracted;
            }
            setData(null);
            return null;
        } catch (error) {
            console.error(`Failed to refresh:`, error);
            setData(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [refreshRoute]);

    const fetchAll = useCallback(
        async (queryParams?: Record<string, string>) => {
            setIsListLoading(true);
            try {
                let url = apiRoute;
                if (queryParams) {
                    const queryString = new URLSearchParams(
                        queryParams,
                    ).toString();
                    if (queryString) {
                        url = `${apiRoute}?${queryString}`;
                    }
                }
                const response = await fetch(url);
                if (response.ok) {
                    const result = await response.json();
                    // Support paginated response shape { data, total, totalPages }
                    if (
                        result &&
                        typeof result === "object" &&
                        "data" in result &&
                        "total" in result
                    ) {
                        setList(result.data as T[]);
                        setTotal(result.total as number);
                        setTotalPages(result.totalPages as number);
                    } else {
                        // Plain array fallback (non-paginated endpoints)
                        setList(result as T[]);
                        setTotal((result as T[]).length);
                        setTotalPages(1);
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch all:`, error);
            } finally {
                setIsListLoading(false);
            }
        },
        [apiRoute],
    );

    const add = useCallback(
        async (itemData: Partial<T>) => {
            try {
                const response = await fetch(apiRoute, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(itemData),
                });
                if (response.ok) {
                    const result = await response.json();
                    const newItem = result.data || result;
                    setList((prev) => [newItem, ...prev]);
                    setTotal((prev) => prev + 1);
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`Failed to add:`, error);
                return false;
            }
        },
        [apiRoute],
    );

    const update = useCallback(
        async (id: string, itemData: Partial<T>) => {
            try {
                const response = await fetch(`${apiRoute}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(itemData),
                });
                if (response.ok) {
                    const result = await response.json();
                    const updatedItem = result.data || result;
                    setList((prev) =>
                        prev.map((item) =>
                            (item as { id?: string }).id === id
                                ? { ...item, ...updatedItem }
                                : item,
                        ),
                    );
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`Failed to update:`, error);
                return false;
            }
        },
        [apiRoute],
    );

    const deleteItem = useCallback(
        async (id: string) => {
            try {
                const response = await fetch(`${apiRoute}/${id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    setList((prev) =>
                        prev.filter(
                            (item) => (item as { id?: string }).id !== id,
                        ),
                    );
                    setTotal((prev) => prev - 1);
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`Failed to delete:`, error);
                return false;
            }
        },
        [apiRoute],
    );

    const clear = useCallback(() => {
        setData(null);
    }, []);

    return {
        data,
        list,
        total,
        totalPages,
        isLoading,
        isListLoading,
        setData,
        setList,
        clear,
        refresh,
        fetchAll,
        add,
        update,
        deleteItem,
    };
}
