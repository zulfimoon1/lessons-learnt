import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { discountCodeService, DiscountCode, CreateDiscountCodeData } from "@/services/discountCodeService";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon,
  TagIcon,
  CalendarIcon,
  UsersIcon,
  PercentIcon,
  SchoolIcon
} from "lucide-react";

const DiscountCodeManagement = () => {
  const { admin } = usePlatformAdmin();
  const { toast } = useToast();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 10,
    description: '',
    max_uses: '',
    expires_at: '',
    is_active: true,
    school_name: ''
  });

  useEffect(() => {
    loadDiscountCodes();
  }, []);

  const loadDiscountCodes = async () => {
    try {
      console.log('Loading discount codes...');
      const codes = await discountCodeService.getAllDiscountCodes();
      console.log('Loaded discount codes:', codes);
      setDiscountCodes(codes);
    } catch (error) {
      console.error('Error loading discount codes:', error);
      toast({
        title: "Error",
        description: "Failed to load discount codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_percent: 10,
      description: '',
      max_uses: '',
      expires_at: '',
      is_active: true,
      school_name: ''
    });
  };

  const handleCreate = async () => {
    console.log('=== CREATE DISCOUNT CODE DEBUG ===');
    console.log('Admin:', admin);
    console.log('Form data:', formData);
    
    if (!admin) {
      console.error('No admin found');
      toast({
        title: "Error",
        description: "You must be logged in as an admin",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.code.trim()) {
      console.error('Code is required');
      toast({
        title: "Error",
        description: "Code is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.school_name.trim()) {
      console.error('School name is required');
      toast({
        title: "Error",
        description: "School name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const createData: CreateDiscountCodeData = {
        code: formData.code.toUpperCase().trim(),
        discount_percent: formData.discount_percent,
        description: formData.description || undefined,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
        expires_at: formData.expires_at || undefined,
        is_active: formData.is_active,
        school_name: formData.school_name.trim()
      };

      console.log('Creating discount code with data:', createData);
      console.log('Created by admin ID:', admin.id);
      
      const result = await discountCodeService.createDiscountCode(createData, admin.id);
      console.log('Discount code created successfully:', result);
      
      toast({
        title: "Success",
        description: "Discount code created successfully",
      });

      resetForm();
      setIsCreateDialogOpen(false);
      loadDiscountCodes();
    } catch (error) {
      console.error('Error creating discount code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create discount code",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discount_percent: code.discount_percent,
      description: code.description || '',
      max_uses: code.max_uses?.toString() || '',
      expires_at: code.expires_at ? new Date(code.expires_at).toISOString().slice(0, 16) : '',
      is_active: code.is_active,
      school_name: code.school_name || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCode) return;

    // Validate required fields
    if (!formData.code.trim()) {
      toast({
        title: "Error",
        description: "Code is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.school_name.trim()) {
      toast({
        title: "Error",
        description: "School name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await discountCodeService.updateDiscountCode(editingCode.id, {
        code: formData.code.toUpperCase().trim(),
        discount_percent: formData.discount_percent,
        description: formData.description || undefined,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
        expires_at: formData.expires_at || undefined,
        is_active: formData.is_active,
        school_name: formData.school_name.trim()
      });

      toast({
        title: "Success",
        description: "Discount code updated successfully",
      });

      resetForm();
      setIsEditDialogOpen(false);
      setEditingCode(null);
      loadDiscountCodes();
    } catch (error) {
      console.error('Error updating discount code:', error);
      toast({
        title: "Error",
        description: "Failed to update discount code",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;

    try {
      await discountCodeService.deleteDiscountCode(id);
      
      toast({
        title: "Success",
        description: "Discount code deleted successfully",
      });

      loadDiscountCodes();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      toast({
        title: "Error",
        description: "Failed to delete discount code",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              Discount Code Management
            </CardTitle>
            <CardDescription>Create and manage discount codes for subscriptions</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Discount Code</DialogTitle>
                <DialogDescription>Add a new discount code for customers to use</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="EDUCATION10"
                    className="uppercase"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="school_name">School Name *</Label>
                  <Input
                    id="school_name"
                    value={formData.school_name}
                    onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                    placeholder="Enter school name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="discount_percent">Discount Percentage</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({...formData, discount_percent: parseInt(e.target.value) || 10})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description of the discount code"
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_uses">Max Uses (optional)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                    placeholder="Unlimited if empty"
                  />
                </div>
                
                <div>
                  <Label htmlFor="expires_at">Expiration Date (optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Code'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discountCodes.map((code) => (
              <TableRow key={code.id}>
                <TableCell className="font-mono font-medium">{code.code}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <SchoolIcon className="w-3 h-3" />
                    {code.school_name || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <PercentIcon className="w-3 h-3" />
                    {code.discount_percent}%
                  </div>
                </TableCell>
                <TableCell>{code.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" />
                    {code.current_uses}/{code.max_uses || '∞'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {formatDate(code.expires_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={code.is_active ? "default" : "secondary"}>
                    {code.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(code)}
                    >
                      <EditIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(code.id)}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {discountCodes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No discount codes created yet. Create your first discount code to get started.
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Discount Code</DialogTitle>
            <DialogDescription>Update the discount code details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Code *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="uppercase"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-school_name">School Name *</Label>
              <Input
                id="edit-school_name"
                value={formData.school_name}
                onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                placeholder="Enter school name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-discount_percent">Discount Percentage</Label>
              <Input
                id="edit-discount_percent"
                type="number"
                min="1"
                max="100"
                value={formData.discount_percent}
                onChange={(e) => setFormData({...formData, discount_percent: parseInt(e.target.value) || 10})}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-max_uses">Max Uses</Label>
              <Input
                id="edit-max_uses"
                type="number"
                min="1"
                value={formData.max_uses}
                onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-expires_at">Expiration Date</Label>
              <Input
                id="edit-expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DiscountCodeManagement;
