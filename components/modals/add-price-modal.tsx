import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

interface AddPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPriceModal({ isOpen, onClose }: AddPriceModalProps) {
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [category, setCategory] = useState("kyc");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addPrice = useMutation(api.pricing.addPrice);

  const handleSubmit = async () => {
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    setIsLoading(true);
    try {
      await addPrice({
        serviceName: name,
        serviceId,
        serviceCategory: category,
        price: priceNum,
      });
      toast.success("Service pricing added successfully!");
      
      // Reset form
      setName("");
      setServiceId("");
      setCategory("kyc");
      setPrice("");
      
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Service Pricing</DialogTitle>
          <DialogDescription>
            Create a new verification service and set its global price per successful check.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              placeholder="e.g., National ID Verification"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serviceId">Service ID (Unique)</Label>
            <Input
              id="serviceId"
              placeholder="e.g., iprs_id"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="kyc">KYC (Individual Document)</option>
              <option value="kyb">KYB (Business Registration)</option>
              <option value="kra">KRA (Tax Compliance)</option>
              <option value="crb">CRB (Credit Bureau Risk)</option>
              <option value="other">Other Services</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price per Successful Check ($)</Label>
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Service
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
