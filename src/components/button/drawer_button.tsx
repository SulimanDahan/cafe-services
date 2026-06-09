import Link from "next/link";

type LinkType = {
	link: {
		path: string;
		icon: React.ReactNode;
		name: string;
	};
	isActive: boolean;
	setIsMobileOpen: (open: boolean) => void;
};

const DrawerButton = ({ link, setIsMobileOpen, isActive }: LinkType) => {
	return (
		<Link
			key={link.path}
			href={link.path}
            prefetch={true}
			onClick={() => setIsMobileOpen(false)}
			className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 relative group ${isActive
				? "bg-primary/10 text-primary-light border-s-4 border-s-primary"
				: "text-zinc-400 hover:text-white hover:bg-white/5"
				}`}
		>
			{link.icon}
			<span>{link.name}</span>
		</Link>
	);
};

export default DrawerButton;
