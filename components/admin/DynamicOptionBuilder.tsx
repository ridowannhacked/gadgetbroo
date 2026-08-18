import { useState } from "react";
import { Plus, X, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProductOption = {
  name: string;
  values: string[];
};

export function DynamicOptionBuilder({
  options,
  onOptionsChange,
  onGenerateVariants,
}: {
  options: ProductOption[];
  onOptionsChange: (options: ProductOption[]) => void;
  onGenerateVariants: (options: ProductOption[]) => void;
}) {
  const [newOptionName, setNewOptionName] = useState("");
  const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({});

  const addOption = () => {
    if (!newOptionName.trim()) return;
    const newOptions = [...(options || []), { name: newOptionName.trim(), values: [] }];
    onOptionsChange(newOptions);
    setNewOptionName("");
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onOptionsChange(newOptions);
    onGenerateVariants(newOptions);
  };

  const addValue = (optIndex: number) => {
    const val = newValueInputs[optIndex];
    if (!val || !val.trim()) return;
    
    const newOptions = [...options];
    if (!newOptions[optIndex].values.includes(val.trim())) {
      newOptions[optIndex].values.push(val.trim());
      onOptionsChange(newOptions);
      onGenerateVariants(newOptions);
    }
    setNewValueInputs({ ...newValueInputs, [optIndex]: "" });
  };

  const removeValue = (optIndex: number, valIndex: number) => {
    const newOptions = [...options];
    newOptions[optIndex].values.splice(valIndex, 1);
    onOptionsChange(newOptions);
    onGenerateVariants(newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 space-y-1 w-full">
          <label className="text-xs font-medium text-slate-400">Option Name (e.g., Color, Size, Material)</label>
          <Input 
            placeholder="e.g. Color" 
            value={newOptionName} 
            onChange={e => setNewOptionName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addOption())}
          />
        </div>
        <Button type="button" onClick={addOption} className="bg-slate-700 hover:bg-slate-600 text-white gap-2 w-full sm:w-auto">
          <Plus size={16} /> Add Option
        </Button>
      </div>

      {options && options.length > 0 && (
        <div className="space-y-4 border border-slate-800 rounded-xl p-4 bg-[#0a0a0a]">
          {options.map((opt, i) => (
            <div key={i} className="space-y-3 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{opt.name}</span>
                <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-300">
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {opt.values.map((v, j) => (
                  <div key={j} className="flex items-center gap-1 bg-slate-800 text-slate-200 px-3 py-1.5 rounded-md text-sm border border-slate-700">
                    {v}
                    <button type="button" onClick={() => removeValue(i, j)} className="text-slate-400 hover:text-red-400 ml-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 items-center max-w-xs">
                <Input 
                  placeholder={`Add ${opt.name} value...`}
                  value={newValueInputs[i] || ""}
                  onChange={e => setNewValueInputs({ ...newValueInputs, [i]: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addValue(i))}
                  className="h-8 text-sm"
                />
                <Button type="button" size="sm" onClick={() => addValue(i)} className="h-8 px-2 bg-blue-600 hover:bg-blue-500">
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Button type="button" variant="outline" className="w-full border-dashed border-slate-700 text-slate-400 hover:text-white" onClick={() => onGenerateVariants(options)}>
              <ListPlus size={16} className="mr-2" />
              Force Regenerate Variants
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
