import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TranslationAuditService } from '@/services/translationAuditService';

/**
 * PHASE 1 TEST COMPONENT - Verify audit service works
 * This component safely tests the audit without affecting core systems
 */
const TranslationAuditTest: React.FC = () => {
  const report = TranslationAuditService.generateAuditReport();
  const prioritizedKeys = TranslationAuditService.getPrioritizedMissingKeys();

  // Log to console for development
  React.useEffect(() => {
    TranslationAuditService.logAuditSummary();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Translation Coverage Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {report.coveragePercentage}%
            </div>
            <div className="text-sm text-gray-600">Lithuanian Coverage</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {report.missingLithuanianKeys.length}
            </div>
            <div className="text-sm text-gray-600">Missing Keys</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Top Missing Categories:</h4>
          <div className="flex flex-wrap gap-2">
            {prioritizedKeys
              .reduce((acc, key) => {
                const existing = acc.find(item => item.category === key.category);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ category: key.category, count: 1 });
                }
                return acc;
              }, [] as Array<{ category: string; count: number }>)
              .slice(0, 6)
              .map(({ category, count }) => (
                <Badge key={category} variant="outline">
                  {category}: {count}
                </Badge>
              ))
            }
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <strong>Total Keys:</strong> {report.totalEnglishKeys} English, {report.totalLithuanianKeys} Lithuanian
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslationAuditTest;