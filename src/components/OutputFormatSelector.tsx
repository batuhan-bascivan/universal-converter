"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface OutputFormatSelectorProps {
  onFormatChange: (format: string) => void;
  selectedFormat: string;
  label: string;
  options: { value: string; label: string }[];
}

const OutputFormatSelector: React.FC<OutputFormatSelectorProps> = ({ onFormatChange, selectedFormat, label, options }) => {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor={`output-format-${label.replace(/\s/g, '-')}`} className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <Select onValueChange={onFormatChange} value={selectedFormat}>
        <SelectTrigger id={`output-format-${label.replace(/\s/g, '-')}`} className="w-full focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder={`Select a ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default OutputFormatSelector;