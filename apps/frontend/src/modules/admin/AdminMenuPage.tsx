import { useState } from "react";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useCreateItemMutation,
  useDeleteCategoryMutation,
  useDeleteItemMutation,
  useItemsQuery,
  useUpdateCategoryMutation,
  useUpdateItemMutation
} from "@/hooks/useMenuQueries";
import {
  useCreateModifierMutation,
  useDeleteModifierMutation,
  useModifiersQuery,
  useUpdateModifierMutation
} from "@/hooks/useModifierQueries";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/Skeleton";

export function AdminMenuPage() {
  const [newCategory, setNewCategory] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("0");
  const [newItemCategoryId, setNewItemCategoryId] = useState("");
  const [newModifierName, setNewModifierName] = useState("");
  const [newModifierItemId, setNewModifierItemId] = useState("");
  const [newModifierPrice, setNewModifierPrice] = useState("0");

  const { data: categories, isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: items, isLoading: itemsLoading } = useItemsQuery();
  const { data: modifiers, isLoading: modifiersLoading } = useModifiersQuery();

  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  const createItemMutation = useCreateItemMutation();
  const updateItemMutation = useUpdateItemMutation();
  const deleteItemMutation = useDeleteItemMutation();

  const createModifierMutation = useCreateModifierMutation();
  const updateModifierMutation = useUpdateModifierMutation();
  const deleteModifierMutation = useDeleteModifierMutation();

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold">Admin Menu Management</h1>
        <p className="text-sm text-slate-500">Manage categories, items, modifiers, pricing and availability.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Categories</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Add category"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white"
              onClick={() => {
                if (!newCategory.trim()) {
                  return;
                }
                createCategoryMutation.mutate({ name: newCategory.trim() });
                setNewCategory("");
              }}
            >
              Add
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {categoriesLoading ? <Skeleton className="h-20" /> : null}
            {(categories ?? []).map((category) => (
              <div key={category._id} className="rounded border border-slate-200 p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{category.name}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-slate-600"
                      onClick={() => updateCategoryMutation.mutate({ id: category._id, payload: { isActive: !category.isActive } })}
                    >
                      {category.isActive ? "Disable" : "Enable"}
                    </button>
                    <button type="button" className="text-xs text-red-600" onClick={() => deleteCategoryMutation.mutate(category._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Menu Items</h2>
          <div className="mt-3 space-y-2">
            <input
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="Item name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={newItemPrice}
              onChange={(event) => setNewItemPrice(event.target.value)}
              placeholder="Price"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={newItemCategoryId}
              onChange={(event) => setNewItemCategoryId(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {(categories ?? []).map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-xs text-white"
              onClick={() => {
                if (!newItemName.trim() || !newItemCategoryId) {
                  return;
                }
                createItemMutation.mutate({
                  categoryId: newItemCategoryId,
                  name: newItemName.trim(),
                  price: Number(newItemPrice)
                });
                setNewItemName("");
                setNewItemPrice("0");
              }}
            >
              Add Item
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {itemsLoading ? <Skeleton className="h-20" /> : null}
            {(items ?? []).map((item) => (
              <div key={item._id} className="rounded border border-slate-200 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-slate-600"
                      onClick={() => updateItemMutation.mutate({ id: item._id, payload: { isAvailable: !item.isAvailable } })}
                    >
                      {item.isAvailable ? "Unavailable" : "Available"}
                    </button>
                    <button type="button" className="text-xs text-red-600" onClick={() => deleteItemMutation.mutate(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Modifiers</h2>
          <div className="mt-3 space-y-2">
            <input
              value={newModifierName}
              onChange={(event) => setNewModifierName(event.target.value)}
              placeholder="Modifier name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={newModifierPrice}
              onChange={(event) => setNewModifierPrice(event.target.value)}
              placeholder="Price adjustment"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={newModifierItemId}
              onChange={(event) => setNewModifierItemId(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select item</option>
              {(items ?? []).map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-xs text-white"
              onClick={() => {
                if (!newModifierName.trim() || !newModifierItemId) {
                  return;
                }
                createModifierMutation.mutate({
                  itemId: newModifierItemId,
                  name: newModifierName.trim(),
                  priceAdjustment: Number(newModifierPrice),
                  type: "add"
                });
                setNewModifierName("");
                setNewModifierPrice("0");
              }}
            >
              Add Modifier
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {modifiersLoading ? <Skeleton className="h-20" /> : null}
            {(modifiers ?? []).map((modifier) => (
              <div key={modifier._id} className="rounded border border-slate-200 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{modifier.name}</p>
                    <p className="text-xs text-slate-500">
                      {modifier.type} {formatCurrency(modifier.priceAdjustment)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-slate-600"
                      onClick={() =>
                        updateModifierMutation.mutate({
                          id: modifier._id,
                          payload: { type: modifier.type === "add" ? "remove" : "add" }
                        })
                      }
                    >
                      Toggle
                    </button>
                    <button type="button" className="text-xs text-red-600" onClick={() => deleteModifierMutation.mutate(modifier._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
