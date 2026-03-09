import { ShieldCheck } from "lucide-react";
import integrationIcon from "@/assets/sidebar/integration.png";
import aiAgentsIcon from "@/assets/sidebar/ai-agents.png";
import rpaRobotIcon from "@/assets/sidebar/rpa-robot.png";
import hitlIcon from "@/assets/sidebar/hitl.png";
import decisionIcon from "@/assets/sidebar/decision.png";
import healthcareIcon from "@/assets/sidebar/healthcare.png";
import b2bIcon from "@/assets/sidebar/b2b.png";
import knowledgeBaseIcon from "@/assets/sidebar/knowledge-base.png";

const imageIconMap: Record<string, string> = {
  integration: integrationIcon,
  "ai-agents": aiAgentsIcon,
  "rpa-robot": rpaRobotIcon,
  hitl: hitlIcon,
  decision: decisionIcon,
  healthcare: healthcareIcon,
  b2b: b2bIcon,
  "knowledge-base": knowledgeBaseIcon,
};

const lucideIconMap = { ShieldCheck };

interface SidebarNavProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  items: { id: string; label: string; icon: string }[];
}

const SidebarNav = ({ activeItem, onItemClick, items }: SidebarNavProps) => {
  return (
    <nav className="flex w-14 flex-col items-center border-r border-border bg-card py-3 gap-1">
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const customImage = imageIconMap[item.icon];
        const LucideIcon = lucideIconMap[item.icon as keyof typeof lucideIconMap];
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
            {customImage ? (
              <img src={customImage} alt={item.label} className="w-5 h-5 object-contain" />
            ) : LucideIcon ? (
              <LucideIcon size={20} />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
