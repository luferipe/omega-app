import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import ItemForm from "@/components/admin/ItemForm";

export default async function NewItemPage({
  params,
}: {
  params: Promise<{ projectId: string; sectionId: string }>;
}) {
  const { projectId, sectionId } = await params;

  const [section, categoriesRaw] = await Promise.all([
    prisma.section.findUnique({
      where: { id: sectionId },
      select: { name: true, project: { select: { name: true } }, items: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 } },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!section) redirect(`/admin/projects/${projectId}`);

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    children: c.children.map((ch) => ({ id: ch.id, name: ch.name })),
  }));

  const nextOrder = (section.items[0]?.sortOrder ?? -1) + 1;

  async function createItem(formData: FormData) {
    "use server";
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

    redirect(`/admin/projects/${projectId}/sections/${sectionId}`);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex gap-2 text-xs uppercase tracking-wider" style={{ color: "#999" }}>
        <a href="/admin">&larr; Projects</a>
        <span>/</span>
        <a href={`/admin/projects/${projectId}`}>{section.project.name}</a>
        <span>/</span>
        <a href={`/admin/projects/${projectId}/sections/${sectionId}`}>{section.name}</a>
      </div>

      <div className="max-w-3xl">
        <h2 className="text-2xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
          New Item
        </h2>
        <ItemForm
          item={{
            name: "", category: null, categoryId: null, roomLocation: null, finishType: null,
            description: null, vendorName: null, vendorContact: null,
            vendorPhone: null, vendorRef: null, videoUrl: null, specs: [{ label: "", value: "" }],
          }}
          categories={categories}
          saveAction={createItem}
          deleteAction={async () => { "use server"; redirect(`/admin/projects/${projectId}/sections/${sectionId}`); }}
        />
      </div>
    </AdminShell>
  );
}
