
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, Calendar, User, School, Shield, RefreshCw, TrendingUp } from "lucide-react";
import { useOptimizedMentalHealthAlerts } from "@/hooks/useOptimizedMentalHealthAlerts";

// Memoized alert card for better performance
const AlertCard = memo(({ alert, onMarkAsReviewed }: { 
  alert: any; 
  onMarkAsReviewed: (id: string) => void; 
}) => (
  <div key={alert.id} className="border rounded-md p-4 bg-red-50/30">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-red-900">{alert.student_name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <School className="w-4 h-4" />
          <span>{alert.school}</span>
          <User className="w-4 h-4" />
          <span>Grade {alert.grade}</span>
          <Calendar className="w-4 h-4" />
          <span>{new Date(alert.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={alert.severity_level > 7 ? "destructive" : "secondary"}>
          Risk Level: {alert.severity_level}
        </Badge>
        <Badge variant="outline">
          <Shield className="w-3 h-3 mr-1" />
          Confidential
        </Badge>
      </div>
    </div>
    <div className="mt-3 p-3 bg-red-100/50 rounded border-l-4 border-red-300">
      <p className="text-sm text-red-800">{alert.content}</p>
    </div>
    <div className="mt-4 flex justify-end">
      {!alert.is_reviewed ? (
        <Button
          variant="outline"
          onClick={() => onMarkAsReviewed(alert.id)}
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <Eye className="w-4 h-4 mr-2" />
          Mark as Reviewed
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✓ Reviewed
          </Badge>
          {alert.reviewed_by && (
            <span className="text-xs text-gray-500">
              by {alert.reviewed_by}
            </span>
          )}
        </div>
      )}
    </div>
  </div>
));

AlertCard.displayName = "AlertCard";

// Memoized statistics component
const AlertStats = memo(({ stats }: { stats: any }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-orange-500" />
        <div>
          <p className="text-sm text-gray-600">Total Alerts</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-blue-500" />
        <div>
          <p className="text-sm text-gray-600">Unreviewed</p>
          <p className="text-2xl font-bold text-red-600">{stats.unreviewed}</p>
        </div>
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-red-500" />
        <div>
          <p className="text-sm text-gray-600">Critical</p>
          <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
        </div>
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <School className="w-4 h-4 text-green-500" />
        <div>
          <p className="text-sm text-gray-600">Schools</p>
          <p className="text-2xl font-bold">{Object.keys(stats.bySchool).length}</p>
        </div>
      </div>
    </Card>
  </div>
));

AlertStats.displayName = "AlertStats";

const OptimizedMentalHealthAlerts = memo(() => {
  const { 
    alerts, 
    isLoading, 
    isAuthorized, 
    alertStats, 
    markAsReviewed, 
    refreshAlerts 
  } = useOptimizedMentalHealthAlerts();

  if (!isAuthorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            Mental health data access requires proper medical authorization
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            This sensitive data is only accessible to authorized medical professionals
          </p>
          <p className="text-sm text-gray-500">
            Contact your system administrator if you believe you should have access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Mental Health Alerts Dashboard
                <Badge variant="outline" className="ml-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure Access
                </Badge>
              </CardTitle>
              <CardDescription>
                Comprehensive monitoring and review of mental health concerns
              </CardDescription>
            </div>
            <Button 
              onClick={refreshAlerts} 
              variant="outline" 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto mb-4"></div>
              <p>Securely loading mental health alerts...</p>
            </div>
          ) : (
            <>
              <AlertStats stats={alertStats} />
              
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>No mental health alerts found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Priority section for unreviewed critical alerts */}
                  {alertStats.criticalAlerts.filter(a => !a.is_reviewed).length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-800">
                          Critical Unreviewed Alerts ({alertStats.criticalAlerts.filter(a => !a.is_reviewed).length})
                        </h3>
                      </div>
                      {alertStats.criticalAlerts
                        .filter(alert => !alert.is_reviewed)
                        .map(alert => (
                          <AlertCard 
                            key={alert.id} 
                            alert={alert} 
                            onMarkAsReviewed={markAsReviewed} 
                          />
                        ))}
                      <hr className="my-6" />
                    </>
                  )}
                  
                  {/* All other alerts */}
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold">All Alerts</h3>
                  </div>
                  {alerts.map(alert => (
                    <AlertCard 
                      key={alert.id} 
                      alert={alert} 
                      onMarkAsReviewed={markAsReviewed} 
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedMentalHealthAlerts.displayName = "OptimizedMentalHealthAlerts";

export default OptimizedMentalHealthAlerts;
