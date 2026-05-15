import UserHeader from "@/components/headers/user_header";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-screen bg-[#07080a] text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black overflow-x-hidden">
            <UserHeader />
            {children}

            {/* Footer */}
            <footer className="py-8 h-auto border-t border-white/10 text-center text-xs text-zinc-500 bg-[#07080a]">
                {/* <p className="max-w-7xl mx-auto px-6">{t("home.footer")}</p> */}
            </footer>
        </div>
    );
};

export default UserLayout;
