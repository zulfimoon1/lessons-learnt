
import { cn } from "@/lib/utils";

interface EmotionalStateSelectorProps {
  selectedState: string;
  onStateChange: (state: string) => void;
}

const emotionalStates = [
  { value: "excited", label: "Excited", emoji: "😄", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
  { value: "happy", label: "Happy", emoji: "😊", color: "bg-green-100 border-green-300 text-green-800" },
  { value: "confident", label: "Confident", emoji: "😌", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { value: "calm", label: "Calm", emoji: "😇", color: "bg-indigo-100 border-indigo-300 text-indigo-800" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-gray-100 border-gray-300 text-gray-800" },
  { value: "confused", label: "Confused", emoji: "😕", color: "bg-orange-100 border-orange-300 text-orange-800" },
  { value: "frustrated", label: "Frustrated", emoji: "😤", color: "bg-red-100 border-red-300 text-red-800" },
  { value: "anxious", label: "Anxious", emoji: "😰", color: "bg-purple-100 border-purple-300 text-purple-800" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "😵", color: "bg-pink-100 border-pink-300 text-pink-800" },
];

const EmotionalStateSelector = ({ selectedState, onStateChange }: EmotionalStateSelectorProps) => {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Select how you felt emotionally during the lesson. This helps your teacher understand the classroom environment.
      </p>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {emotionalStates.map((state) => (
          <button
            key={state.value}
            type="button"
            onClick={() => onStateChange(state.value)}
            className={cn(
              "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              selectedState === state.value
                ? `${state.color} border-current shadow-md`
                : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
            )}
          >
            <span className="text-2xl mb-2">{state.emoji}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {state.label}
            </span>
          </button>
        ))}
      </div>
      
      {selectedState && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Selected:</span> {emotionalStates.find(s => s.value === selectedState)?.label}
            <span className="ml-2">
              {emotionalStates.find(s => s.value === selectedState)?.emoji}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionalStateSelector;
