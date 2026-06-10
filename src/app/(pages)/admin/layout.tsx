import { Metadata } from "next";
import AdminLayoutClient from "./admin_layout_client";
import { UserProvider } from "@/context/user_context";

export const metadata: Metadata = {
    manifest: "/admin-manifest.json?v=3",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <AdminLayoutClient>{children}</AdminLayoutClient>
        </UserProvider>
    );
}
