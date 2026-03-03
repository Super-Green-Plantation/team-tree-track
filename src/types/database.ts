export interface Branch {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface EmployeeBranch {
  employee_id: string;
  branch_id: string;
}

export interface EmployeeWithBranches extends Employee {
  branches: Branch[];
}
