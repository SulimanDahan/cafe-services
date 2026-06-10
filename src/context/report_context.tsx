"use client";

import { REPORTS_API_ROUTE } from "@/config/api_routes";
import ReportModel from "@/models/data_models/report_model";
import { type ReactNode, useMemo } from "react";
import {
    createGenericContext,
    useGenericCrudLogic,
    type GenericContextType,
} from "./generic_context";

/** Specialized type for Report context operations. */
interface ReportContextType {
    reportsList: ReportModel[];
    total: number;
    totalPages: number;
    isReportsLoading: boolean;
    fetchAllReports: (queryParams?: Record<string, string>) => Promise<void>;
    addReport: (data: Partial<ReportModel>) => Promise<boolean>;
    updateReport: (id: string, data: Partial<ReportModel>) => Promise<boolean>;
    deleteReport: (id: string, onError?: (err: string) => void) => Promise<boolean>;
}

const { Context: ReportContext, useGenericContext } = createGenericContext<ReportModel>();

/**
 * Provider for Report CRUD operations.
 */
export function ReportProvider({ children }: { children: ReactNode }) {
    const {
        list: reportsList,
        total,
        totalPages,
        isListLoading: isReportsLoading,
        fetchAll: fetchAllReports,
        add: addReport,
        update: updateReport,
        deleteItem: deleteReport,
    } = useGenericCrudLogic<ReportModel>({
        apiRoute: REPORTS_API_ROUTE,
    });

    const value = useMemo(
        () => ({
            data: null,
            list: reportsList,
            total,
            totalPages,
            isLoading: false,
            isListLoading: isReportsLoading,
            setData: () => {},
            setList: () => {},
            clear: () => {},
            refresh: async () => null,
            fetchAll: fetchAllReports,
            add: addReport,
            update: updateReport,
            deleteItem: deleteReport,
        }),
        [reportsList, total, totalPages, isReportsLoading, fetchAllReports, addReport, updateReport, deleteReport]
    );

    return (
        <ReportContext.Provider value={value}>
            {children}
        </ReportContext.Provider>
    );
}

/** Hook to access Report context. */
export function useReport(): ReportContextType {
    const ctx = useGenericContext("useReport") as unknown as GenericContextType<ReportModel>;
    return {
        reportsList: ctx.list,
        total: ctx.total,
        totalPages: ctx.totalPages,
        isReportsLoading: ctx.isListLoading,
        fetchAllReports: ctx.fetchAll,
        addReport: ctx.add,
        updateReport: ctx.update,
        deleteReport: ctx.deleteItem,
    };
}
