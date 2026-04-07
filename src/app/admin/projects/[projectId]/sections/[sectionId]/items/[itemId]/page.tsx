import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import ItemForm from "@/components/admin/ItemForm";
import ImageUploader from "@/components/admin/ImageUploader";

export default async function ItemEditPage({
  params,
}: {
  params: Promise<{ projectId: string; sectionId: string; itemId: string }>;
}) {
  const { projectId, sectionId, itemId } = await params;

  const [item, categoriesRaw] = await Promise.all([
    prisma.item.findUnique({
      where: { id: itemId },
      include: {
        specs: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        section: { select: { name: true, project: { select: { name: true } } } },
      },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!item) notFound();

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    children: c.children.map((ch) => ({ id: ch.id, name: ch.name })),
  }));

  async function saveItem(formData: FormData) {
    "use server";
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

    const data = {
      name: formData.get("name") as string,
      categoryId,
      category: categoryName,
      roomLocation: formData.get("roomLocation") as string || null,
      finishType: formData.get("finishType") as string || null,
      description: formData.get("description") as string || null,
      vendorName: formData.get("vendorName") as string || null,
      vendorContact: formData.get("vendorContact") as string || null,
      vendorPhone: formData.get("vendorPhone") as string || null,
      vendorRef: formData.get("vendorRef") as string || null,
      videoUrl: formData.get("videoUrl") as string || null,
      pdfUrl: formData.get("pdfUrl") as string || null,
    };

    // Parse specs JSON
    const specsJson = formData.get("specs") as string;
    const specs: { label: string; value: string }[] = specsJson ? JSON.parse(specsJson) : [];

    await prisma.item.update({ where: { id: itemId }, data });

    // Replace specs
    await prisma.itemSpec.deleteMany({ where: { itemId } });
    for (let i = 0; i < specs.length; i++) {
      if (specs[i].label && specs[i].value) {
        await prisma.itemSpec.create({
          data: { itemId, label: specs[i].label, value: specs[i].value, sortOrder: i },
        });
      }
    }

    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { slug: true } });
    if (project?.slug) revalidatePath(`/catalog/${project.slug}`);
    revalidatePath(`/admin/projects/${projectId}/sections/${sectionId}`);

    redirect(`/admin/projects/${projectId}/sections/${sectionId}`);
  }

  async function deleteItem() {
    "use server";
    await prisma.item.delete({ where: { id: itemId } });
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { slug: true } });
    if (project?.slug) revalidatePath(`/catalog/${project.slug}`);
    revalidatePath(`/admin/projects/${projectId}/sections/${sectionId}`);
    redirect(`/admin/projects/${projectId}/sections/${sectionId}`);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex gap-2 text-xs uppercase tracking-wider" style={{ color: "#999" }}>
        <a href="/admin">&larr; Projects</a>
        <span>/</span>
        <a href={`/admin/projects/${projectId}`}>{item.section.project.name}</a>
        <span>/</span>
        <a href={`/admin/projects/${projectId}/sections/${sectionId}`}>{item.section.name}</a>
      </div>

      <div className="max-w-3xl">
        <h2 className="text-2xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
          Edit Item
        </h2>

        <ImageUploader
          itemId={itemId}
          images={item.images.map((img) => ({
            id: img.id,
            url: img.url,
            storageKey: img.storageKey,
            isPrimary: img.isPrimary,
          }))}
        />

        <div className="mt-6" />

        <ItemForm
          item={{
            name: item.name,
            category: item.category,
            categoryId: item.categoryId,
            roomLocation: item.roomLocation,
            finishType: item.finishType,
            description: item.description,
            vendorName: item.vendorName,
            vendorContact: item.vendorContact,
            vendorPhone: item.vendorPhone,
            vendorRef: item.vendorRef,
            videoUrl: item.videoUrl,
            pdfUrl: item.pdfUrl,
            specs: item.specs.map((s) => ({ label: s.label, value: s.value })),
          }}
          categories={categories}
          saveAction={saveItem}
          deleteAction={deleteItem}
        />
      </div>
    </AdminShell>
  );
}
