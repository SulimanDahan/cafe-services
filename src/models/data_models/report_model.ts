import ReservationModel from "./reservation_model";

/**
 * Represents a client report / complaint.
 * Matches the Prisma clientReports model.
 */
type ReportModel = {
    id: string;
    message_text: string;
    is_read: boolean;
    reservation_id: string;
    created_at: Date;
    updated_at: Date;
    /** Included via Prisma relation */
    reservation?: ReservationModel;
};

export const initialReportState: ReportModel = {
    id: "",
    message_text: "",
    is_read: false,
    reservation_id: "",
    created_at: new Date(),
    updated_at: new Date(),
};

export default ReportModel;
