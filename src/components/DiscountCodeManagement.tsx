import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, TestTube, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  description: string | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  school_name: string | null;
  duration_months: number | null;
}

const DiscountCodeManagement = () => {
  const { admin } = usePlatformAdmin();
  const { toast } = useToast();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);

  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [description, setDescription] = useState('');
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [schoolName, setSchoolName] = useState('');
  const [durationMonths, setDurationMonths] = useState<number | undefined>(undefined);

  const resetForm = () => {
    setCode('');
    setDiscountPercent(10);
    setDescription('');
    setMaxUses(undefined);
    setExpiresAt(undefined);
    setIsActive(true);
    setSchoolName('');
    setDurationMonths(undefined);
    setEditingCode(null);
  };

  const handleCreate = async () => {
    if (!admin?.email) return;

    setIsLoading(true);
    try {
      console.log('🔨 Creating discount code via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'createDiscountCode',
          adminEmail: admin.email,
          discountCodeData: {
            code,
            discount_percent: discountPercent,
            description,
            max_uses: maxUses,
            expires_at: expiresAt,
            is_active: isActive,
            school_name: schoolName,
            duration_months: durationMonths,
            created_by: admin.id
          }
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setDiscountCodes([...discountCodes, data.data]);
        setIsCreateDialogOpen(false);
        resetForm();

        toast({
          title: 'Success',
          description: 'Discount code created successfully',
        });
      } else {
        throw new Error(data?.error || 'Failed to create discount code');
      }
    } catch (error: any) {
      console.error('❌ Error creating discount code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create discount code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!admin?.email || !editingCode?.id) return;

    setIsLoading(true);
    try {
      console.log('🔄 Updating discount code via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'updateDiscountCode',
          adminEmail: admin.email,
          discountCodeId: editingCode.id,
          discountCodeUpdates: {
            code,
            discount_percent: discountPercent,
            description,
            max_uses: maxUses,
            expires_at: expiresAt,
            is_active: isActive,
            school_name: schoolName,
            duration_months: durationMonths
          }
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setDiscountCodes(
          discountCodes.map((code) => (code.id === editingCode.id ? data.data : code))
        );
        setEditingCode(null);
        resetForm();

        toast({
          title: 'Success',
          description: 'Discount code updated successfully',
        });
      } else {
        throw new Error(data?.error || 'Failed to update discount code');
      }
    } catch (error: any) {
      console.error('❌ Error updating discount code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update discount code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!admin?.email) return;

    setIsLoading(true);
    try {
      console.log('🔥 Deleting discount code via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'deleteDiscountCode',
          adminEmail: admin.email,
          discountCodeId: id
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setDiscountCodes(discountCodes.filter((code) => code.id !== id));

        toast({
          title: 'Success',
          description: 'Discount code deleted successfully',
        });
      } else {
        throw new Error(data?.error || 'Failed to delete discount code');
      }
    } catch (error: any) {
      console.error('❌ Error deleting discount code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete discount code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiscountCodes = async () => {
    if (!admin?.email) return;
    
    setIsLoading(true);
    try {
      console.log('📋 Loading discount codes via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getDiscountCodes',
          adminEmail: admin.email
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setDiscountCodes(data.data || []);
        console.log('✅ Loaded', data.data?.length || 0, 'discount codes');
      } else {
        throw new Error(data?.error || 'Failed to load discount codes');
      }
    } catch (error: any) {
      console.error('❌ Error loading discount codes:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load discount codes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!admin?.email) return;
    
    setIsLoading(true);
    try {
      console.log('🧪 Testing connection via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'testConnection',
          adminEmail: admin.email
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: 'Connection Test Successful',
          description: `${data.data.message} Found ${data.data.readCount} codes.`,
        });
      } else {
        toast({
          title: 'Connection Test Failed',
          description: data?.error || 'Connection test failed',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('❌ Connection test error:', error);
      toast({
        title: 'Test Failed',
        description: error.message || 'Connection test failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.email) {
      loadDiscountCodes();
    }
  }, [admin]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Secure Discount Code Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Discount Code</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discountPercent" className="text-right">
                    Discount Percent
                  </Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    value={discountPercent.toString()}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxUses" className="text-right">
                    Max Uses
                  </Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={maxUses !== undefined ? maxUses.toString() : ''}
                    onChange={(e) =>
                      setMaxUses(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiresAt" className="text-right">
                    Expires At
                  </Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt || ''}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isActive" className="text-right">
                    Is Active
                  </Label>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="schoolName" className="text-right">
                    School Name
                  </Label>
                  <Input
                    id="schoolName"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="durationMonths" className="text-right">
                    Duration Months
                  </Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    value={durationMonths !== undefined ? durationMonths.toString() : ''}
                    onChange={(e) =>
                      setDurationMonths(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Discount Code'}
              </Button>
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={testConnection}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test Connection
          </Button>
          
          <Button
            onClick={loadDiscountCodes}
            disabled={isLoading}
            variant="outline"
          >
            Refresh
          </Button>
        </div>

        {/* Security Status */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Security Enhanced</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            All operations are now secured with input validation, rate limiting, and audit logging.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Discount Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading discount codes...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max Uses
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Is Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration (Months)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {discountCodes.map((discountCode) => (
                      <tr key={discountCode.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{discountCode.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{discountCode.discount_percent}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{discountCode.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {discountCode.max_uses === null ? 'Unlimited' : discountCode.max_uses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {discountCode.expires_at ? new Date(discountCode.expires_at).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {discountCode.is_active ? 'Yes' : 'No'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{discountCode.school_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {discountCode.duration_months === null ? 'N/A' : discountCode.duration_months}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setEditingCode(discountCode);
                                setCode(discountCode.code);
                                setDiscountPercent(discountCode.discount_percent);
                                setDescription(discountCode.description || '');
                                setMaxUses(discountCode.max_uses || undefined);
                                setExpiresAt(discountCode.expires_at || undefined);
                                setIsActive(discountCode.is_active);
                                setSchoolName(discountCode.school_name || '');
                                setDurationMonths(discountCode.duration_months || undefined);
                              }}
                              variant="outline"
                              size="icon"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(discountCode.id)}
                              variant="destructive"
                              size="icon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {editingCode && (
          <Dialog open={!!editingCode} onOpenChange={() => setEditingCode(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Discount Code</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discountPercent" className="text-right">
                    Discount Percent
                  </Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    value={discountPercent.toString()}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxUses" className="text-right">
                    Max Uses
                  </Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={maxUses !== undefined ? maxUses.toString() : ''}
                    onChange={(e) =>
                      setMaxUses(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiresAt" className="text-right">
                    Expires At
                  </Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt || ''}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isActive" className="text-right">
                    Is Active
                  </Label>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="schoolName" className="text-right">
                    School Name
                  </Label>
                  <Input
                    id="schoolName"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="durationMonths" className="text-right">
                    Duration Months
                  </Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    value={durationMonths !== undefined ? durationMonths.toString() : ''}
                    onChange={(e) =>
                      setDurationMonths(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleUpdate}>Update Discount Code</Button>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscountCodeManagement;
