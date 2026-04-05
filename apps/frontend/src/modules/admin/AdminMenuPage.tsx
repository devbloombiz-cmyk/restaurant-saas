import { useEffect, useMemo, useState } from "react";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("0");
  const [newItemCategoryId, setNewItemCategoryId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [newModifierName, setNewModifierName] = useState("");
  const [newModifierItemId, setNewModifierItemId] = useState("");
  const [newModifierPrice, setNewModifierPrice] = useState("0");
  const [newModifierType, setNewModifierType] = useState<"add" | "remove">("add");

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

  const categoriesList = categories ?? [];
  const itemsList = items ?? [];
  const modifiersList = modifiers ?? [];

  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) {
      return itemsList;
    }

    return itemsList.filter((item) => item.categoryId === selectedCategoryId);
  }, [itemsList, selectedCategoryId]);

  const filteredModifiers = useMemo(() => {
    if (!selectedItemId) {
      return [];
    }

    return modifiersList.filter((modifier) => modifier.itemId === selectedItemId);
  }, [modifiersList, selectedItemId]);

  useEffect(() => {
    if (categoriesList.length === 0) {
      setSelectedCategoryId("");
      return;
    }

    const exists = categoriesList.some((category) => category._id === selectedCategoryId);

    if (!exists) {
      const fallbackCategoryId = categoriesList[0]._id;
      setSelectedCategoryId(fallbackCategoryId);
      setNewItemCategoryId(fallbackCategoryId);
    }
  }, [categoriesList, selectedCategoryId]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedItemId("");
      return;
    }

    const exists = filteredItems.some((item) => item._id === selectedItemId);

    if (!exists) {
      const fallbackItemId = filteredItems[0]._id;
      setSelectedItemId(fallbackItemId);
      setNewModifierItemId(fallbackItemId);
    }
  }, [filteredItems, selectedItemId]);

  const itemNameById = useMemo(() => {
    const map = new Map<string, string>();
    itemsList.forEach((item) => {
      map.set(item._id, item.name);
    });
    return map;
  }, [itemsList]);

  return (
    <section className="space-y-4">
      <header className="app-card p-4">
        <h1 className="text-lg font-semibold">Admin Menu Management</h1>
        <p className="text-sm text-slate-500">Manage categories, items, modifiers, pricing and availability.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="app-card p-4">
          <h2 className="text-sm font-semibold">Categories</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Add category"
              className="w-full px-3 py-2 text-sm"
            />
            <button
              type="button"
              className="app-btn-primary rounded-xl px-3 py-2 text-xs font-semibold"
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
            {categoriesList.map((category) => (
              <div
                key={category._id}
                className={`rounded-xl border p-2 ${
                  selectedCategoryId === category._id ? "border-teal-300 bg-teal-50/60" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="text-left text-sm font-medium text-slate-900"
                    onClick={() => {
                      setSelectedCategoryId(category._id);
                      setNewItemCategoryId(category._id);
                    }}
                  >
                    {category.name}
                  </button>
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

        <article className="app-card p-4">
          <h2 className="text-sm font-semibold">Menu Items by Category</h2>
          <div className="mt-3 space-y-2">
            <input
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="Item name"
              className="w-full px-3 py-2 text-sm"
            />
            <input
              value={newItemPrice}
              onChange={(event) => setNewItemPrice(event.target.value)}
              placeholder="Price"
              className="w-full px-3 py-2 text-sm"
            />
            <select
              value={newItemCategoryId}
              onChange={(event) => setNewItemCategoryId(event.target.value)}
              className="w-full px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categoriesList.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="app-btn-primary w-full rounded-xl px-3 py-2 text-xs font-semibold"
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
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`rounded-xl border p-2 ${
                  selectedItemId === item._id ? "border-teal-300 bg-teal-50/60" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => {
                      setSelectedItemId(item._id);
                      setNewModifierItemId(item._id);
                    }}
                  >
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-indigo-700"
                      onClick={() => updateItemMutation.mutate({ id: item._id, payload: { modifierEnabled: !item.modifierEnabled } })}
                    >
                      {item.modifierEnabled ? "Modifiers On" : "Modifiers Off"}
                    </button>
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
            {filteredItems.length === 0 && !itemsLoading ? <p className="text-xs text-slate-500">No items found in this category.</p> : null}
          </div>
        </article>

        <article className="app-card p-4">
          <h2 className="text-sm font-semibold">Modifiers by Item</h2>
          <div className="mt-3 space-y-2">
            <input
              value={newModifierName}
              onChange={(event) => setNewModifierName(event.target.value)}
              placeholder="Modifier name"
              className="w-full px-3 py-2 text-sm"
            />
            <input
              value={newModifierPrice}
              onChange={(event) => setNewModifierPrice(event.target.value)}
              placeholder="Price adjustment"
              className="w-full px-3 py-2 text-sm"
            />
            <select
              value={newModifierType}
              onChange={(event) => setNewModifierType(event.target.value as "add" | "remove")}
              className="w-full px-3 py-2 text-sm"
            >
              <option value="add">Add Extra (e.g., extra salad)</option>
              <option value="remove">Remove Option (e.g., no lettuce)</option>
            </select>
            <select
              value={newModifierItemId}
              onChange={(event) => setNewModifierItemId(event.target.value)}
              className="w-full px-3 py-2 text-sm"
            >
              <option value="">Select item</option>
              {filteredItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="app-btn-primary w-full rounded-xl px-3 py-2 text-xs font-semibold"
              onClick={() => {
                if (!newModifierName.trim() || !newModifierItemId) {
                  return;
                }
                createModifierMutation.mutate({
                  itemId: newModifierItemId,
                  name: newModifierName.trim(),
                  priceAdjustment: Number(newModifierPrice),
                  type: newModifierType
                });
                setNewModifierName("");
                setNewModifierPrice("0");
                setNewModifierType("add");
              }}
            >
              Add Modifier
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {modifiersLoading ? <Skeleton className="h-20" /> : null}
            {filteredModifiers.map((modifier) => (
              <div key={modifier._id} className="rounded-xl border border-slate-200 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{modifier.name}</p>
                    <p className="text-xs text-slate-500">
                      {modifier.type} {formatCurrency(modifier.priceAdjustment)}
                    </p>
                    <p className="text-xs text-slate-400">Item: {itemNameById.get(modifier.itemId) ?? "Unknown item"}</p>
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
            {selectedItemId && filteredModifiers.length === 0 && !modifiersLoading ? (
              <p className="text-xs text-slate-500">No modifiers found for selected item.</p>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
