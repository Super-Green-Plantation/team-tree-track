import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Branch, EmployeeWithBranches } from '@/types/database';
import Layout from '@/components/Layout';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';

const Dashboard = () => {
  const [employees, setEmployees] = useState<EmployeeWithBranches[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: emps }, { data: branchList }, { data: empBranches }] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('branches').select('*').order('name'),
        supabase.from('employee_branches').select('employee_id, branch_id'),
      ]);

      setBranches(branchList || []);

      const enriched: EmployeeWithBranches[] = (emps || []).map((emp) => {
        const branchIds = (empBranches || [])
          .filter((eb) => eb.employee_id === emp.id)
          .map((eb) => eb.branch_id);
        const empBranchList = (branchList || []).filter((b) => branchIds.includes(b.id));
        return { ...emp, branches: empBranchList };
      });

      setEmployees(enriched);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      (emp.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (emp.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (emp.role?.toLowerCase() || '').includes(search.toLowerCase());

    const matchesBranch =
      branchFilter === 'all' || emp.branches.some((b) => b.id === branchFilter);

    return matchesSearch && matchesBranch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <Badge variant="secondary" className="ml-2">{filtered.length}</Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No employees found. Add some to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {emp.branches.length > 0 ? (
                          emp.branches.map((b) => (
                            <Badge key={b.id} variant="outline" className="text-xs">
                              {b.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
