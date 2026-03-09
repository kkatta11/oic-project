import { Search, Filter, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OracleHeader from "@/components/OracleHeader";
import ProjectsSidebar from "@/components/ProjectsSidebar";
import { projects } from "@/data/projectsData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Projects = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OracleHeader />
      <div className="h-1.5 bg-gradient-to-r from-redwood-gold via-redwood-banner to-redwood-gold" />

      <div className="flex flex-1">
        <ProjectsSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground">{projects.length} projects</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter"
                  className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Filter size={16} />
              </button>
              <div className="mx-1 h-5 w-px bg-border" />
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <LayoutGrid size={16} />
              </button>
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <List size={16} />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <TableCell>
                      <div>
                        <span className="font-medium text-foreground hover:text-redwood-gold cursor-pointer">
                          {project.name}
                        </span>
                        {project.subtitle && (
                          <p className="text-xs text-muted-foreground mt-0.5">{project.subtitle}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.type}</TableCell>
                    <TableCell className="text-muted-foreground">{project.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Projects;
