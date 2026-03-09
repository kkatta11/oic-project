import { Minimize2, Diamond, Share2, CircleDot, LayoutGrid, Cross, Building2, Library, ShieldCheck } from "lucide-react";

const iconMap = {
  Minimize2,
  Diamond,
  Share2,
  CircleDot,
  LayoutGrid,
  Cross,
  Building2,
  Library,
  ShieldCheck,
};

interface SidebarNavProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  items: { id: string; label: string; icon: string }[];
}

const SidebarNav = ({ activeItem, onItemClick, items }: SidebarNavProps) => {
  return (
    <nav className="flex w-14 flex-col items-center border-r border-border bg-card py-3 gap-1">
      {items.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const isActive = activeItem === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            title={item.label}
            className={`flex h-11 w-11 flex-col items-center justify-center rounded-md text-[10px] transition-colors ${
              isActive
                ? "bg-sidebar-accent text-redwood-gold font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
