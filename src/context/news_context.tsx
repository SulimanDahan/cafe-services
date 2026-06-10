"use client";

import { NEWS_API_ROUTE } from "@/config/api_routes";
import NewsModel from "@/models/data_models/news_model";
import { type ReactNode, useMemo } from "react";
import {
    createGenericContext,
    useGenericCrudLogic,
    type GenericContextType,
} from "./generic_context";

/** Specialized type for News context operations. */
interface NewsContextType {
    newsList: NewsModel[];
    total: number;
    totalPages: number;
    isNewsLoading: boolean;
    fetchAllNews: (queryParams?: Record<string, string>) => Promise<void>;
    addNews: (data: Partial<NewsModel>) => Promise<boolean>;
    updateNews: (id: string, data: Partial<NewsModel>) => Promise<boolean>;
    deleteNews: (id: string, onError?: (err: string) => void) => Promise<boolean>;
}

const { Context: NewsContext, useGenericContext } = createGenericContext<NewsModel>();

/**
 * Provider for News CRUD operations.
 */
export function NewsProvider({ children }: { children: ReactNode }) {
    const {
        list: newsList,
        total,
        totalPages,
        isListLoading: isNewsLoading,
        fetchAll: fetchAllNews,
        add: addNews,
        update: updateNews,
        deleteItem: deleteNews,
    } = useGenericCrudLogic<NewsModel>({
        apiRoute: NEWS_API_ROUTE,
    });

    const value = useMemo(
        () => ({
            data: null,
            list: newsList,
            total,
            totalPages,
            isLoading: false,
            isListLoading: isNewsLoading,
            setData: () => {},
            setList: () => {},
            clear: () => {},
            refresh: async () => null,
            fetchAll: fetchAllNews,
            add: addNews,
            update: updateNews,
            deleteItem: deleteNews,
        }),
        [newsList, total, totalPages, isNewsLoading, fetchAllNews, addNews, updateNews, deleteNews]
    );

    return (
        <NewsContext.Provider value={value}>
            {children}
        </NewsContext.Provider>
    );
}

/** Hook to access News context. */
export function useNews(): NewsContextType {
    const ctx = useGenericContext("useNews") as unknown as GenericContextType<NewsModel>;
    return {
        newsList: ctx.list,
        total: ctx.total,
        totalPages: ctx.totalPages,
        isNewsLoading: ctx.isListLoading,
        fetchAllNews: ctx.fetchAll,
        addNews: ctx.add,
        updateNews: ctx.update,
        deleteNews: ctx.deleteItem,
    };
}
