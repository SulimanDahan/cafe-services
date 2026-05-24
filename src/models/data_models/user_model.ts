type UserModel = {
 id: string;
 username: string;
 password: string;
 is_admin: boolean;
 is_disable: boolean;
 created_at: Date;
 updated_at: Date;
};

export const initialUserState: UserModel = {
 id: "",
 username: "",
 password: "",
 is_admin: false,
 is_disable: false,
 created_at: new Date(),
 updated_at: new Date(),
};

export default UserModel;