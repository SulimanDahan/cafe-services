/**
 * Interface representing a News item in the database.
 */
export default interface NewsModel {
    id: string;
    news_text: string;
    start_date: Date | string;
    end_date: Date | string;
    is_disable: boolean;
    created_at: Date | string;
    updated_at: Date | string;
}

/**
 * Initial empty state for a News item.
 */
export const initialNewsState: NewsModel = {
    id: "",
    news_text: "",
    start_date: new Date(),
    end_date: new Date(),
    is_disable: false,
    created_at: new Date(),
    updated_at: new Date(),
};
