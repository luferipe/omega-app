import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import CategoryManager from "@/components/admin/CategoryManager";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      children: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { items: true } } } },
      _count: { select: { items: true } },
    },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  async function createCategory(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    const parentId = (formData.get("parentId") as string) || null;
    if (!name) return;

    const baseSlug = parentId
      ? `${slugify((await prisma.category.findUnique({ where: { id: parentId } }))?.name || "")}-${slugify(name)}`
      : slugify(name);

    let slug = baseSlug;
    let i = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const max = await prisma.category.aggregate({
      _max: { sortOrder: true },
      where: { parentId },
    });

    await prisma.category.create({
      data: { name, slug, parentId, sortOrder: (max._max.sortOrder ?? -1) + 1 },
    });
    revalidatePath("/admin/categories");
  }

  async function renameCategory(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const name = (formData.get("name") as string)?.trim();
    if (!id || !name) return;
    await prisma.category.update({ where: { id }, data: { name } });
    revalidatePath("/admin/categories");
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (!id) return;
    // Cascade deletes children via schema; items get categoryId set to null via SetNull
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
  }

  return (
    <AdminShell>
      <div className="mb-8">
        <h2 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
          Categories
        </h2>
        <p className="text-xs mt-1" style={{ color: "#999" }}>
          Manage product categories and subcategories
        </p>
      </div>

      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          itemCount: c._count.items,
          children: c.children.map((ch) => ({
            id: ch.id,
            name: ch.name,
            itemCount: ch._count.items,
          })),
        }))}
        createAction={createCategory}
        renameAction={renameCategory}
        deleteAction={deleteCategory}
      />
    </AdminShell>
  );
}
