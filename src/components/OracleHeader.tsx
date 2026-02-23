import { Bell, User, HelpCircle } from "lucide-react";

const OracleHeader = () => {
  return (
    <header className="flex h-12 items-center justify-between bg-redwood-header px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-wide text-redwood-header-foreground">
          ORACLE
        </span>
        <span className="text-sm text-redwood-header-foreground/60">
          Integration
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className="mr-3 text-xs text-redwood-header-foreground/70">
          oic-instance-prod
        </span>
        <button className="rounded p-2 text-redwood-header-foreground/70 hover:text-redwood-header-foreground">
          <HelpCircle size={18} />
        </button>
        <button className="rounded p-2 text-redwood-header-foreground/70 hover:text-redwood-header-foreground">
          <Bell size={18} />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-redwood-gold text-xs font-bold text-accent-foreground">
          <User size={16} />
        </button>
      </div>
    </header>
  );
};

export default OracleHeader;
