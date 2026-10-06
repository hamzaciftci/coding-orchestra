"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function deleteProject(projectId: string) {
  await getDb().project.delete({ where: { id: projectId } });
  revalidatePath("/dashboard");
}

export async function renameProject(projectId: string, name: string) {
  await getDb().project.update({ where: { id: projectId }, data: { name } });
  revalidatePath("/dashboard");
}

export async function archiveProject(projectId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  await getDb().project.update({ where: { id: projectId }, data: { name: "[archived]" } });
  revalidatePath("/dashboard");
}
