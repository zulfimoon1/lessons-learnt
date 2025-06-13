
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "destructive";
}

const StatsCard: React.FC<StatsCardProps> = React.memo(({ title, value, icon: Icon, description, variant = "default" }) => {
  const cardVariant = variant === "destructive" ? "border-destructive" : "";
  const textVariant = variant === "destructive" ? "text-destructive" : "";

  return (
    <Card className={cardVariant}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${textVariant || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-lg font-semibold ${textVariant}`}>{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
});

StatsCard.displayName = "StatsCard";

export default StatsCard;
