type RoomModel = {
 name: string;
 id: string;
 created_at: Date;
 is_disable: boolean;
 qr_code: string;
};

export const initialRoomState: RoomModel = {
 name: "",
 id: "",
 created_at: new Date(),
 is_disable: false,
 qr_code: "",
};

export default RoomModel;
