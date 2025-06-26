
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Eye, Calendar, User, School, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useOptimizedMentalHealthAlerts } from "@/hooks/useOptimizedMentalHealthAlerts";
import { useState } from 'react';
import { cn } from "@/lib/utils";

const MobileOptimizedMentalHealthAlerts = () => {
  const { alerts, isLoading, isAuthorized, markAsReviewed, alertStats } = useOptimizedMentalHealthAlerts();
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Memoize filtered alerts for performance
  const { criticalAlerts, reviewedAlerts, unreviewedAlerts } = useMemo(() => {
    const critical = alerts.filter(alert => alert.severity_level > 7);
    const reviewed = alerts.filter(alert => alert.is_reviewed);
    const unreviewed = alerts.filter(alert => !alert.is_reviewed);
    
    return {
      criticalAlerts: critical,
      reviewedAlerts: reviewed,
      unreviewedAlerts: unreviewed
    };
  }, [alerts]);

  if (!isAuthorized) {
    return (
      <Card className="mx-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-red-500" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4">
          <Shield className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-2">
            Medical authorization required
          </p>
          <p className="text-xs text-gray-500">
            Contact system administrator
          </p>
        </CardContent>
      </Card>
    );
  }

  const toggleAlert = (alertId: string) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  if (isLoading) {
    return (
      <Card className="mx-2">
        <CardContent className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-teal mx-auto mb-2"></div>
          <p className="text-xs">Loading alerts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 px-2">
      {/* Mobile Stats Overview */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{alertStats.critical}</div>
            <div className="text-xs text-gray-600">Critical</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{alertStats.unreviewed}</div>
            <div className="text-xs text-gray-600">Unreviewed</div>
          </div>
        </Card>
      </div>

      {/* Mobile Alerts List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Mental Health Alerts
            <Badge variant="outline" className="text-xs">
              <Shield className="w-2 h-2 mr-1" />
              Secure
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Tap alerts to expand details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="text-center py-6 px-4">
              <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600">No alerts found</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 p-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="border rounded-lg bg-red-50/30">
                    {/* Compact Alert Header */}
                    <div 
                      className="p-3 cursor-pointer"
                      onClick={() => toggleAlert(alert.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-red-900 truncate">
                            {alert.student_name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                            <School className="w-3 h-3" />
                            <span className="truncate">{alert.school}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Badge
                            variant={alert.severity_level > 7 ? "destructive" : "secondary"}
                            className="text-xs px-1"
                          >
                            {alert.severity_level}
                          </Badge>
                          {expandedAlert === alert.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Preview of content */}
                      <p className="text-xs text-red-800 line-clamp-2">
                        {alert.content}
                      </p>
                    </div>

                    {/* Expanded Alert Details */}
                    {expandedAlert === alert.id && (
                      <div className="px-3 pb-3 border-t bg-white/50">
                        <div className="pt-3 space-y-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <User className="w-3 h-3" />
                            <span>Grade {alert.grade}</span>
                            <Calendar className="w-3 h-3 ml-2" />
                            <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="p-2 bg-red-100/50 rounded text-xs text-red-800">
                            {alert.content}
                          </div>
                          
                          <div className="flex justify-end">
                            {!alert.is_reviewed ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReviewed(alert.id);
                                }}
                                className="border-green-300 text-green-700 hover:bg-green-50 text-xs h-7"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Mark Reviewed
                              </Button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  ✓ Reviewed
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimizedMentalHealthAlerts;
