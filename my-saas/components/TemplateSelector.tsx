"use client";
import { CheckCircle2 } from "lucide-react";

type Template = "modern" | "classic" | "minimal";

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  selected: Template;
}

export default function TemplateSelector({ onSelect, selected }: TemplateSelectorProps) {
  const templates = [
    {
      id: "modern" as Template,
      name: "Modern",
      description: "Gradient header with clean design",
      preview: "bg-gradient-to-r from-indigo-500 to-purple-500",
      features: ["Gradient header", "Color-coded", "Professional"],
    },
    {
      id: "classic" as Template,
      name: "Classic",
      description: "Traditional business invoice",
      preview: "bg-gray-800",
      features: ["Traditional", "Bordered", "Formal"],
    },
    {
      id: "minimal" as Template,
      name: "Minimal",
      description: "Clean and simple design",
      preview: "bg-gray-400",
      features: ["Ultra-clean", "Readable", "Modern"],
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose Template
      </label>
      <div className="grid grid-cols-1 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={`p-4 border-2 rounded-lg text-left transition ${
              selected === template.id
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-300 bg-white"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-12 h-16 rounded ${template.preview} flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{template.name}</h3>
                  {selected === template.id && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="flex gap-1">
                  {template.features.map((f, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}