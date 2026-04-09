import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import ItemForm from "@/components/admin/ItemForm";

export default async function NewProjectItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ sectionId?: string }>;
}) {
  const { projectId } = await params;
  const { sectionId: preselectedSectionId } = await searchParams;

  const [project, categoriesRaw] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        sections: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!project) redirect(`/admin`);
  if (project.sections.length === 0) {
    redirect(`/admin/projects/${projectId}/sections/new`);
  }

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    children: c.children.map((ch) => ({ id: ch.id, name: ch.name })),
  }));

  async function createItem(formData: FormData) {
    "use server";
    const sectionId = formData.get("sectionId") as string;
    if (!sectionId) {
      throw new Error("Section is required");
    }

    // Verify section belongs to this project
    const section = await prisma.section.findFirst({
      where: { id: sectionId, projectId },
      select: {
        id: true,
        items: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 },
      },
    });
    if (!section) {
      throw new Error("Invalid section");
    }

    const nextOrder = (section.items[0]?.sortOrder ?? -1) + 1;

    const specsJson = formData.get("specs") as string;
    const specs: { label: string; value: string }[] = specsJson ? JSON.parse(specsJson) : [];

    const categoryId = (formData.get("categoryId") as string) || null;
    let categoryName: string | null = null;
    if (categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { parent: true },
      });
      if (cat) {
        categoryName = cat.parent ? `${cat.parent.name} / ${cat.name}` : cat.name;
      }
    }

    const item = await prisma.item.create({
      data: {
        sectionId,
        name: formData.get("name") as string,
        categoryId,
        category: categoryName,
        roomLocation: (formData.get("roomLocation") as string) || null,
        finishType: (formData.get("finishType") as string) || null,
        description: (formData.get("description") as string) || null,
        vendorName: (formData.get("vendorName") as string) || null,
        vendorContact: (formData.get("vendorContact") as string) || null,
        vendorPhone: (formData.get("vendorPhone") as string) || null,
        vendorRef: (formData.get("vendorRef") as string) || null,
        videoUrl: (formData.get("videoUrl") as string) || null,
        pdfUrl: (formData.get("pdfUrl") as string) || null,
        sortOrder: nextOrder,
      },
    });

    for (let i = 0; i < specs.length; i++) {
      if (specs[i].label && specs[i].value) {
        await prisma.itemSpec.create({
          data: { itemId: item.id, label: specs[i].label, value: specs[i].value, sortOrder: i },
        });
      }
    }

    redirect(`/admin/projects/${projectId}/sections/${sectionId}/items/${item.id}`);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex gap-2 text-xs uppercase tracking-wider" style={{ color: "#999" }}>
        <a href="/admin">&larr; Projects</a>
        <span>/</span>
        <a href={`/admin/projects/${projectId}`}>{project.name}</a>
        <span>/</span>
        <span>New Item</span>
      </div>

      <div className="max-w-3xl">
        <h2 className="text-2xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
          New Item
        </h2>
        <ItemForm
          item={{
            name: "", category: null, categoryId: null, roomLocation: null, finishType: null,
            description: null, vendorName: null, vendorContact: null,
            vendorPhone: null, vendorRef: null, videoUrl: null, pdfUrl: null, specs: [{ label: "", value: "" }],
          }}
          categories={categories}
          sections={project.sections}
          defaultSectionId={preselectedSectionId}
          saveAction={createItem}
          deleteAction={async () => { "use server"; redirect(`/admin/projects/${projectId}`); }}
        />
      </div>
    </AdminShell>
  );
}
