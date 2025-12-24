export type DepositDto = {
    id: number;
    depositStatus: number;
    eurAmount: number | null;
    message: string | null;
    daiColateral: number | null;
    feeRate: number;
    isApproved: boolean;
    keyWord: string;
    method: string;
    account: string;
    approved_at: string | null;
    created_at: string;
};

export enum DepositStatus {
    PROCESSING = 0,
    COMPLETE = 1,
    DENIED = 2,
    REQUEST = 3
}

export type PaginationType = {
    totalItems: number,
    currentPage: number,
    totalPages: number,
    pageSize: number,
}