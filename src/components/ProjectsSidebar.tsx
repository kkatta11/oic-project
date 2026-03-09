import { Home, FolderKanban, Pencil, Building2, Heart, Eye, Settings, LayoutTemplate, GitBranch, ChevronRight } from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "design", label: "Design", icon: Pencil, hasChevron: true },
  { id: "b2b", label: "B2B", icon: Building2, hasChevron: true },
  { id: "healthcare", label: "Healthcare", icon: Heart, hasChevron: true },
  { id: "observability", label: "Observability", icon: Eye, hasChevron: true },
  { id: "settings", label: "Settings", icon: Settings, hasChevron: true },
  { id: "visual-builder", label: "Visual Builder", icon: LayoutTemplate },
  { id: "process", label: "Process", icon: GitBranch, hasChevron: true },
];

const ProjectsSidebar = () => {
  return (
    <nav className="flex w-56 flex-col border-r border-border bg-card py-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === "projects";
        return (
          <button
            key={item.id}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              isActive
                ? "bg-sidebar-accent text-foreground font-semibold border-l-2 border-redwood-gold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
            }`}
          >
            <Icon size={18} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.hasChevron && <ChevronRight size={14} className="text-muted-foreground" />}
          </button>
        );
      })}
    </nav>
  );
};

export default ProjectsSidebar;
