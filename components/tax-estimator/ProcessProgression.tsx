import { Stage, StageId } from "@/app/types";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessProgressionProps {
  currentStageId: StageId;
  stages: Stage[];
}

export function ProcessProgression({
  currentStageId,
  stages,
}: ProcessProgressionProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentStageId);

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-max px-1">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={stage.id}
              className="flex flex-col items-center relative flex-1 group"
            >
              {/* Connecting Line */}
              {index !== 0 && (
                <div
                  className={cn(
                    "absolute top-3 right-[50%] w-full h-[2px] -translate-y-1/2 -z-10",
                    isCompleted
                      ? "bg-indigo-600 dark:bg-indigo-400"
                      : "bg-zinc-200 dark:bg-zinc-800",
                  )}
                />
              )}

              {/* Indicator Circle */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300 z-10 bg-white dark:bg-zinc-950",
                  isCompleted
                    ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-400 dark:text-zinc-900"
                    : isCurrent
                      ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-300 dark:text-zinc-700",
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-current" />
                ) : (
                  <Circle className="w-2 h-2 fill-current" />
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center px-2">
                <span
                  className={cn(
                    "text-xs font-medium block whitespace-nowrap transition-colors duration-300",
                    isCurrent
                      ? "text-indigo-700 dark:text-indigo-300 font-bold"
                      : isCompleted
                        ? "text-zinc-700 dark:text-zinc-300"
                        : "text-zinc-400 dark:text-zinc-600",
                  )}
                >
                  {stage.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
