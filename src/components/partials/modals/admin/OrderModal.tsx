"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, type OrderInput } from "@/lib/validations/order";
import { useLanguage } from "@/config/i18n";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";
import OrderModel from "@/models/data_models/order_model";
import ItemModel from "@/models/data_models/item_model";
import { useSettings } from "@/context/settings_context";
import TabBar from "@/components/tab_bar";
import { TrashIcon } from "@/components/icons";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OrderInput) => Promise<boolean>;
  order: OrderModel | null;
  items: ItemModel[];
  reservationId: string;
}

export default function OrderModal({
  isOpen,
  onClose,
  onSave,
  order,
  items,
  reservationId,
}: OrderModalProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema) as unknown as Resolver<OrderInput>,
    defaultValues: {
      reservation_id: reservationId,
      item_id: "",
      quantity: 1,
      notes: "",
    },
  });

  const selectedItemId = useWatch({ control, name: "item_id" });
  const selectedQty = useWatch({ control, name: "quantity" }) || 1;
  const selectedItem = items.find((i) => i.id === selectedItemId);
  const totalPrice = selectedItem
    ? Number(selectedItem.price) * selectedQty
    : 0;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cart, setCart] = useState<OrderInput[]>([]);
  const [activeTab, setActiveTab] = useState<"form" | "basket">("form");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const catMap = new Map<string, { id: string; name: string }>();
    items.forEach((item) => {
      if (item.group) {
        catMap.set(item.group_id, { id: item.group_id, name: item.group.name });
      }
    });
    return [
      { id: "all", label: t("orders.catAll") || "All" },
      ...Array.from(catMap.values()).map((g) => ({ id: g.id, label: g.name })),
    ];
  }, [items, t]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.group_id === selectedCategory;
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      (() => setCart([]))();
      (() => setActiveTab("form"))();
      if (order) {
        reset({
          reservation_id: order.reservation_id,
          item_id: order.item_id,
          quantity: order.quantity,
          notes: order.notes || "",
        });
        const item = items.find((i) => i.id === order.item_id);
        if (item) (() => setSearchQuery(item.name))();
      } else {
        reset({
          reservation_id: reservationId,
          item_id: "",
          quantity: 1,
          notes: "",
        });
        (() => setSearchQuery(""))();
      }
      (() => setSelectedCategory("all"))();
      (() => setIsDropdownOpen(false))();
    }
  }, [isOpen, order, reset, reservationId, items]);

  const handleFormSubmit = async (data: OrderInput) => {
    if (order) {
      const success = await onSave(data);
      if (success) {
        onClose();
      }
    } else {
      setCart((prev) => [...prev, data]);
      setValue("item_id", "");
      setValue("quantity", 1);
      setValue("notes", "");
      setSearchQuery("");
      setSelectedCategory("all");
    }
  };

  const handleConfirmCart = async () => {
    let allSuccess = true;
    for (const item of cart) {
      const success = await onSave(item);
      if (!success) allSuccess = false;
    }
    if (allSuccess) {
      onClose();
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={order ? "max-w-md" : "max-w-md lg:max-w-4xl"}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            {order ? t("orders.modalEditTitle") : t("orders.modalAddTitle")}
          </h2>
        </div>

        {!order && (
          <div className="block lg:hidden">
            <TabBar
              tabs={[
                { id: "form", label: t("orders.tabItems") || "Items" },
                {
                  id: "basket",
                  label: `${t("orders.tabCart") || "Basket"} (${cart.length})`,
                },
              ]}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as "form" | "basket")}
            />
          </div>
        )}

        <div
          className={`grid grid-cols-1 ${!order ? "lg:grid-cols-2 lg:gap-8" : ""} gap-6`}
        >
          {/* Form Column */}
          <div
            className={`flex flex-col gap-6 ${!order && activeTab === "basket" ? "hidden lg:flex" : "flex"}`}
          >
            <form
              id="order-form"
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-5"
            >
              <input type="hidden" {...register("reservation_id")} />
              <input type="hidden" {...register("item_id")} />

              <div className="space-y-1.5 w-full" ref={dropdownRef}>
                <label className="text-xs font-bold text-zinc-400 block">
                  {t("orders.columnItem")}
                </label>
                <div className="pb-2">
                  <TabBar
                    tabs={categories}
                    activeTab={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      t("orders.selectItemPlaceholder") || "Select Item"
                    }
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      setValue("item_id", "");
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full bg-background border border-white/10 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all duration-200"
                  />
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 z-100 w-full mt-1 max-h-48 overflow-y-auto bg-[#1a1c2c] border border-white/10 rounded-2xl shadow-xl">
                      {filteredItems.length === 0 ? (
                        <div className="p-4 text-center text-zinc-500 text-sm">
                          No items found
                        </div>
                      ) : (
                        filteredItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setValue("item_id", item.id, {
                                shouldValidate: true,
                              });
                              setSearchQuery(item.name);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors text-sm font-bold text-white flex justify-between items-center"
                          >
                            <span>{item.name}</span>
                            <span className="text-primary text-xs">
                              {Number(item.price)}{" "}
                              {t(`common.${settings.currency_name}`)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.item_id?.message && (
                  <p className="text-[10px] text-red-400 font-medium mt-1">
                    {t(String(errors.item_id.message))}
                  </p>
                )}
              </div>

              <InputField
                label={t("orders.qty")}
                id="orderQty"
                type="number"
                min="1"
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity?.message && (
                <p className="text-[10px] text-red-400 font-medium mt-1">
                  {t(String(errors.quantity.message))}
                </p>
              )}

              <InputField
                label={t("orders.columnPrice") || "Total Price"}
                id="orderPrice"
                type="text"
                readOnly
                value={
                  selectedItem
                    ? `${totalPrice} ${t(`common.${settings.currency_name}`)}`
                    : ""
                }
                placeholder="0"
                className="bg-white/5 opacity-70 cursor-not-allowed"
              />

              <InputField
                label={t("orders.notePrefix")}
                id="orderNotes"
                type="text"
                {...register("notes")}
                placeholder={t("orders.notesPlaceholder") || "Optional notes"}
              />
              {errors.notes?.message && (
                <p className="text-[10px] text-red-400 font-medium mt-1">
                  {t(String(errors.notes.message))}
                </p>
              )}
            </form>

            <div className="pt-4 mt-2 border-t border-white/5 flex gap-3">
              {!order ? (
                <>
                  <PrimaryButton
                    type="submit"
                    form="order-form"
                    variant="secondary"
                    className="flex-1 bg-white/5 hover:bg-white/10"
                  >
                    {t("orders.btnAddOrder") || "Add to List"}
                  </PrimaryButton>
                  <PrimaryButton
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                    className="shrink-0 text-zinc-400 hover:text-white lg:hidden"
                  >
                    {t("common.cancel")}
                  </PrimaryButton>
                </>
              ) : (
                <>
                  <PrimaryButton
                    type="submit"
                    form="order-form"
                    className="flex-1"
                  >
                    {t("common.save")}
                  </PrimaryButton>
                  <PrimaryButton
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                    className="shrink-0 text-zinc-400 hover:text-white"
                  >
                    {t("common.cancel")}
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>

          {/* Basket Column */}
          {!order && (
            <div
              className={`flex flex-col min-h-0 h-full ${activeTab === "form" ? "hidden lg:flex" : "flex"}`}
            >
              <div className="flex-1 border-white/10 lg:border-none flex flex-col min-h-0">
                <h3 className="shrink-0 text-sm font-bold text-zinc-300 mb-4">
                  {t("orders.pendingCart")}
                </h3>

                {cart.length > 0 ? (
                  <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar min-h-0 max-h-[50vh] lg:max-h-full">
                    {cart.map((cartItem, idx) => {
                      const itemDef = items.find(
                        (i) => i.id === cartItem.item_id,
                      );
                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-start bg-white/5 border border-white/5 rounded-xl lg:rounded-lg p-3 lg:p-2 lg:py-1.5 shadow-sm"
                        >
                          <div className="flex-1 min-w-0 flex flex-col">
                            <span className="text-sm lg:text-xs text-white font-bold truncate">
                              {itemDef?.name || "Unknown"}
                            </span>

                            <div className="text-xs lg:text-[10px] text-zinc-400 font-medium mt-1.5 flex items-center gap-1.5">
                              <span className="font-black text-white bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                                {cartItem.quantity}
                              </span>
                              <span>
                                ×{" "}
                                {Number(itemDef?.price || 0).toLocaleString(
                                  "en-US",
                                )}{" "}
                                {t(`common.${settings.currency_name}`)}
                              </span>
                            </div>

                            {cartItem.notes && (
                              <span className="text-[11px] lg:text-[10px] text-amber-400 font-bold mt-1.5 bg-amber-400/10 inline-flex items-center px-2 py-0.5 rounded-md border border-amber-400/20 w-fit">
                                {t("orders.notePrefix")}
                                {cartItem.notes}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2 lg:gap-1.5 shrink-0">
                            <span className="font-black text-white text-sm lg:text-xs bg-black/40 px-2 py-1 rounded-lg border border-white/5 inline-flex items-center gap-1 shadow-inner">
                              {(
                                Number(itemDef?.price || 0) * cartItem.quantity
                              ).toLocaleString("en-US")}{" "}
                              <span className="text-[10px] lg:text-[9px] text-primary">
                                {t(`common.${settings.currency_name}`)}
                              </span>
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setCart((c) => c.filter((_, i) => i !== idx))
                              }
                              className="text-red-400 hover:text-red-200 hover:bg-red-500/20 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl p-6 min-h-50">
                    <span className="text-zinc-500 text-sm font-bold">
                      {t("orders.basketEmpty") || "Basket is empty"}
                    </span>
                  </div>
                )}

                <div className="shrink-0 pt-4 mt-auto border-t border-white/5 flex gap-3 lg:pl-0 w-full">
                  <PrimaryButton
                    type="button"
                    className="flex-1"
                    disabled={cart.length === 0}
                    onClick={handleConfirmCart}
                  >
                    {t("common.save")} ({cart.length})
                  </PrimaryButton>
                  <PrimaryButton
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                    className="shrink-0 text-zinc-400 hover:text-white"
                  >
                    {t("common.cancel")}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
