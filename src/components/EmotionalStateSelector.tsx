
import { cn } from "@/lib/utils";

interface EmotionalStateSelectorProps {
  selectedState: string;
  onStateChange: (state: string) => void;
}

const emotionalStates = [
  { value: "excited", label: "Excited", emoji: "😄", color: "bg-green-100 border-green-300 text-green-800", trafficLight: "green" },
  { value: "happy", label: "Happy", emoji: "😊", color: "bg-green-100 border-green-300 text-green-800", trafficLight: "green" },
  { value: "confident", label: "Confident", emoji: "😌", color: "bg-green-100 border-green-300 text-green-800", trafficLight: "green" },
  { value: "calm", label: "Calm", emoji: "😇", color: "bg-yellow-100 border-yellow-300 text-yellow-800", trafficLight: "yellow" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-yellow-100 border-yellow-300 text-yellow-800", trafficLight: "yellow" },
  { value: "confused", label: "Confused", emoji: "😕", color: "bg-orange-100 border-orange-300 text-orange-800", trafficLight: "orange" },
  { value: "frustrated", label: "Frustrated", emoji: "😤", color: "bg-red-100 border-red-300 text-red-800", trafficLight: "red" },
  { value: "anxious", label: "Anxious", emoji: "😰", color: "bg-red-100 border-red-300 text-red-800", trafficLight: "red" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "😵", color: "bg-red-100 border-red-300 text-red-800", trafficLight: "red" },
];

const getTrafficLightColor = (state: string) => {
  const emotionalState = emotionalStates.find(s => s.value === state);
  if (!emotionalState) return "text-gray-600";
  
  switch (emotionalState.trafficLight) {
    case "green":
      return "text-green-600 bg-green-50 border-green-200";
    case "yellow":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "orange":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "red":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

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
        <div className={cn(
          "mt-4 p-3 border rounded-lg",
          getTrafficLightColor(selectedState)
        )}>
          <p className="text-sm">
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

export { getTrafficLightColor };
export default EmotionalStateSelector;
