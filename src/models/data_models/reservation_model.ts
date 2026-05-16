type ReservationModel = {
    id: string;
    client_name: string;
    number: number;
    phone: string;
    date_time: Date;
    room_id: string;
    accepted: boolean;
    completed: boolean;
    created_at: Date;
    updated_at: Date;
};

export const initialReservationState: ReservationModel = {
    id: "",
    client_name: "",
    number: 0,
    phone: "",
    date_time: new Date(),
    room_id: "",
    accepted: false,
    completed: false,
    created_at: new Date(),
    updated_at: new Date(),
};

export default ReservationModel;
