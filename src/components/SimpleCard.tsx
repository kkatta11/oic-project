import { Plus } from "lucide-react";

interface SimpleCardProps {
  title: string;
  description: string;
}

const SimpleCard = ({ title, description }: SimpleCardProps) => {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <Plus size={16} />
        </button>
      </div>
      <div className="relative px-5 py-4">
        <div className="mb-3 h-0.5 w-12 rounded bg-redwood-gold" />
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default SimpleCard;
