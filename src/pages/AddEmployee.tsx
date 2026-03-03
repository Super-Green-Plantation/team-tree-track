import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/types/database';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AddEmployee = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('branches').select('*').order('name').then(({ data }) => {
      setBranches(data || []);
    });
  }, []);

  const toggleBranch = (id: string) => {
    setSelectedBranches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    setSaving(true);
    try {
      const { data: emp, error } = await supabase
        .from('employees')
        .insert({ name, email, role })
        .select()
        .single();

      if (error) throw error;

      if (selectedBranches.length > 0) {
        const links = selectedBranches.map((branch_id) => ({
          employee_id: emp.id,
          branch_id,
        }));
        const { error: linkError } = await supabase.from('employee_branches').insert(links);
        if (linkError) throw linkError;
      }

      toast({ title: 'Employee added successfully' });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Employee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" placeholder="e.g. Regional Manager" value={role} onChange={(e) => setRole(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Assign to Branches</Label>
                {branches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No branches yet. Add one first.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto rounded-md border border-border p-3">
                    {branches.map((b) => (
                      <label key={b.id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <Checkbox
                          checked={selectedBranches.includes(b.id)}
                          onCheckedChange={() => toggleBranch(b.id)}
                        />
                        <span>{b.name}</span>
                        <span className="text-muted-foreground">— {b.location}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Add Employee'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddEmployee;
