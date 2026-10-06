import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { deleteProject } from "@/app/actions/projects";

export default async function Dashboard() {
  const session = await getSession();
  const projects = await getDb().project.findMany({ where: { ownerId: session!.userId } });

  return (
    <main>
      <h1>Projects</h1>
      {projects.map((p) => (
        <form key={p.id} action={deleteProject.bind(null, p.id)}>
          <span dangerouslySetInnerHTML={{ __html: p.name }} />
          <button>Delete</button>
        </form>
      ))}
    </main>
  );
}
