
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Percent, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  description: string;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  school_name: string;
  duration_months: number;
  created_at: string;
}

interface DiscountCodeManagementProps {
  adminEmail: string;
}

const DiscountCodeManagement: React.FC<DiscountCodeManagementProps> = ({ adminEmail }) => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const fetchDiscountCodes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getDiscountCodes',
          adminEmail
        }
      });

      if (error) throw error;
      setDiscountCodes(data?.data || []);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch discount codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, [adminEmail]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discount Code Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Discount Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Discount Code</DialogTitle>
            </DialogHeader>
            <div className="text-center py-4 text-gray-500">
              Discount code creation form will be implemented here
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Active Discount Codes ({discountCodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discountCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Percent className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No discount codes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Code</th>
                    <th className="text-left p-3 font-medium">Discount</th>
                    <th className="text-left p-3 font-medium">Usage</th>
                    <th className="text-left p-3 font-medium">School</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {discountCodes.map((code) => (
                    <tr key={code.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono">{code.code}</td>
                      <td className="p-3">{code.discount_percent}%</td>
                      <td className="p-3">{code.current_uses}/{code.max_uses || '∞'}</td>
                      <td className="p-3">{code.school_name || 'All Schools'}</td>
                      <td className="p-3">
                        <Badge variant={code.is_active ? 'default' : 'secondary'}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountCodeManagement;
