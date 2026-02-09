import { useRef, useEffect, useState } from "react";
import { Message, TaxEstimatorState, Stage } from "@/app/types";
import { Check, X, Pencil } from "lucide-react";

interface TaxEstimatorSummaryProps {
  state: TaxEstimatorState;
  questions: Record<string, any>;
  stages: Stage[];
  onUpdate: (field: string, value: string | number | boolean) => void;
}

export function TaxEstimatorSummary({
  state,
  questions,
  stages,
  onUpdate,
}: TaxEstimatorSummaryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string | number | boolean>("");

  // Auto-scroll to bottom of summary when updated
  useEffect(() => {
    if (scrollRef.current && !editingId) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state, editingId]);

  // Helper to format values
  const formatValue = (value: string | number | boolean, type: string) => {
    if (type === "number" && typeof value === "number") {
      return `₦ ${value.toLocaleString()}`;
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  // Helper to find answer for a question
  const getAnswer = (question: any) => {
    const path = question.field.split(".");
    let current: any = state;
    for (const key of path) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    return current;
  };

  const handleEditClick = (question: any, currentValue: any) => {
    setEditingId(question.id);
    setEditValue(currentValue);
  };

  const handleSave = (question: any) => {
    // Parse value based on type
    let finalValue = editValue;
    if (question.type === "number") {
      if (typeof editValue === "string") {
        finalValue = parseFloat(editValue.replace(/,/g, ""));
      } else {
        finalValue = Number(editValue);
      }
    } else if (question.type === "boolean") {
      finalValue = editValue === "true" || editValue === true;
    }

    onUpdate(question.field, finalValue);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div
      ref={scrollRef}
      className="w-full h-full overflow-y-auto pr-2 custom-scrollbar bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-md shadow-sm shadow-gray-200"
    >
      <div className="p-4 md:p-5 space-y-8">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-3">
          Response Summary
        </h3>

        {stages.map((stage) => {
          // Find questions in this stage that have answers in history
          const stageQuestions = Object.values(questions).filter(
            (q: any) =>
              q.stage === stage.id &&
              state.history.includes(q.id) &&
              q.type !== "summary",
          );

          if (stageQuestions.length === 0) return null;

          return (
            <div
              key={stage.id}
              className="space-y-3 animate-in fade-in duration-500"
            >
              <h4 className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                {stage.label}
              </h4>

              <div className="space-y-3 lg:pl-2.5 xl:pl-3.5 border-l border-zinc-100 dark:border-zinc-800">
                {stageQuestions.map((question: any) => {
                  const answer = getAnswer(question);
                  if (answer === undefined) return null;
                  const isEditing = editingId === question.id;

                  return (
                    <div key={question.id} className="group relative">
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-0.5 line-clamp-1 group-hover:line-clamp-none transition-all">
                        {question.text}
                      </p>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          {question.type === "boolean" ? (
                            <select
                              value={String(editValue)}
                              onChange={(e) =>
                                setEditValue(e.target.value === "true")
                              }
                              className="w-full text-sm p-1.5 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : question.type === "choice" && question.options ? (
                            <select
                              value={String(editValue)}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full text-sm p-1.5 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {question.options.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={
                                question.type === "number" ? "number" : "text"
                              }
                              value={String(editValue)}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave(question);
                                if (e.key === "Escape") handleCancel();
                              }}
                              className="w-full text-sm p-1.5 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              autoFocus
                            />
                          )}
                          <button
                            onClick={() => handleSave(question)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group/item">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1.5 rounded-md border border-zinc-100 dark:border-zinc-800/50 grow">
                            {formatValue(answer, question.type)}
                          </p>
                          <button
                            onClick={() => handleEditClick(question, answer)}
                            className="ml-2 opacity-0 group-hover/item:opacity-100 text-zinc-400 hover:text-indigo-600 transition-opacity p-1"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {state.history.length === 0 && (
          <div className="text-center py-10 text-zinc-400 dark:text-zinc-600 text-sm">
            <p>Responses will appear here as you progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
