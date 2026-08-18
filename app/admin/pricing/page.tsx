"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldAlert, Edit, Save, X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import AddPriceModal from "@/components/modals/add-price-modal";
import { getErrorMessage } from "@/lib/utils";

export default function SuperAdminPricingPage() {
  const prices = useQuery(api.pricing.getPrices);
  const updatePrice = useMutation(api.pricing.updatePrice);
  
  const [editingId, setEditingId] = useState<Id<"pricing"> | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Group prices by category
  const groupedPrices = prices?.reduce((acc, curr) => {
    if (!acc[curr.serviceCategory]) {
      acc[curr.serviceCategory] = [];
    }
    acc[curr.serviceCategory].push(curr);
    return acc;
  }, {} as Record<string, typeof prices>);

  const handleEdit = (id: Id<"pricing">, currentPrice: number) => {
    setEditingId(id);
    setEditValue(currentPrice.toString());
  };

  const handleSave = async (id: Id<"pricing">) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    setIsSaving(true);
    try {
      await updatePrice({ pricingId: id, newPrice });
      toast.success("Price updated successfully!");
      setEditingId(null);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (prices === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#188015]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Super Admin Notice */}
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-3.5 rounded-lg text-red-900 text-xs">
        <ShieldAlert className="shrink-0 text-red-700" size={18} />
        <div>
          <h2 className="font-bold">Super Admin Privilege</h2>
          <p className="text-red-700 mt-0.5">
            Changes to service rates immediately affect real-time billing and verification charges across all organizations.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Verification Rate Matrix
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure the unit cost per check across the 4 core registry pipelines.
          </p>
        </div>
        <Button 
          className="bg-[#188015] hover:bg-[#136610] text-white text-xs font-semibold h-8 px-3 rounded-md flex items-center gap-1.5 shadow-xs"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" /> Add Service Rate
        </Button>
      </div>

      {(!prices || prices.length === 0) && (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center mx-auto mb-3 border border-gray-200">
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No Services Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Get started by configuring your verification services and unit rates.
          </p>
          <Button 
            variant="outline" 
            className="mt-4 text-xs font-semibold rounded-md" 
            onClick={() => setIsAddModalOpen(true)}
          >
            Add First Service Rate
          </Button>
        </div>
      )}

      {Object.entries(groupedPrices || {}).map(([category, items]) => (
        <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="bg-gray-50/80 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs font-mono">
              {category} Verifications
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              {items.length} active service{items.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 hover:bg-gray-50/50 transition-colors">
                <div className="mb-3 sm:mb-0">
                  <p className="text-xs font-bold text-gray-900">{item.serviceName}</p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    Service ID: <code className="bg-gray-100 border border-gray-200 px-1.5 py-0.2 rounded-sm text-[10px] text-gray-700">{item.serviceId}</code>
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {editingId === item._id ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">$</span>
                        <Input 
                          type="number" 
                          step="0.01"
                          className="pl-6 h-8 text-xs font-mono w-28 rounded-md" 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-green-700 hover:text-green-800 hover:bg-green-50 rounded-md" onClick={() => handleSave(item._id)} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-400 hover:text-gray-600 rounded-md" onClick={() => setEditingId(null)} disabled={isSaving}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-base font-bold text-gray-900 font-mono w-20 text-right">
                        ${item.price.toFixed(2)}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-2.5 text-xs font-semibold rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 gap-1.5" 
                        onClick={() => handleEdit(item._id, item.price)}
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <AddPriceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
