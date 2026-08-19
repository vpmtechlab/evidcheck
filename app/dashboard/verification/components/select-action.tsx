"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ServiceType, ServiceAction } from "./choose-service";
import { getIcon } from "@/lib/icon-registry";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface SelectActionProps {
  service: ServiceType;
  onSelectAction: (action: ServiceAction) => void;
  onGoBack: () => void;
}

export function SelectAction({ service, onSelectAction, onGoBack }: SelectActionProps) {
  const [selectedActionSlug, setSelectedActionSlug] = useState<string>(
    service.actions[0]?.slug || ""
  );

  useEffect(() => {
    if (service.actions.length > 0 && !selectedActionSlug) {
      setSelectedActionSlug(service.actions[0].slug);
    }
  }, [service, selectedActionSlug]);

  const handleContinue = () => {
    const action = service.actions.find((a) => a.slug === selectedActionSlug) || service.actions[0];
    if (action) {
      onSelectAction(action);
    }
  };

  const IconComponent = getIcon(service.icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          Select Verification Scope
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Choose the action scope for <span className="font-semibold text-gray-800">{service.name}</span>
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className={`p-2.5 ${service.color} rounded-md shadow-2xs`}>
            <IconComponent size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">{service.name}</h3>
            <p className="text-xs text-gray-500">{service.description}</p>
          </div>
        </div>

        <RadioGroup
          value={selectedActionSlug}
          onValueChange={(val) => setSelectedActionSlug(val || "")}
          className="space-y-2.5 pt-1"
        >
          {service.actions.map((action) => {
            const isSelected = selectedActionSlug === action.slug;
            return (
              <motion.div
                key={action._id}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => setSelectedActionSlug(action.slug)}
                className={`
                  flex items-center justify-between p-3.5 border rounded-md transition-all cursor-pointer select-none
                  ${
                    isSelected
                      ? "border-[#188015] bg-green-50/30 text-gray-900 shadow-2xs"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-700"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={action.slug} id={action._id} className="border-gray-400" />
                  <Label htmlFor={action._id} className="font-medium text-xs cursor-pointer">
                    {action.label}
                  </Label>
                </div>

                {isSelected && (
                  <span className="text-[11px] font-bold text-[#188015] font-mono">
                    Selected
                  </span>
                )}
              </motion.div>
            );
          })}
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button 
          onClick={onGoBack} 
          variant="outline" 
          className="h-9 px-4 text-xs font-semibold rounded-md border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </Button>

        <Button 
          onClick={handleContinue}
          disabled={!selectedActionSlug && service.actions.length > 0}
          className="bg-[#188015] hover:bg-[#136610] text-white text-xs font-bold h-9 px-5 rounded-md flex items-center gap-1.5 shadow-xs"
        >
          <span>Continue to Details</span>
          <ArrowRight size={14} />
        </Button>
      </div>
    </motion.div>
  );
}
