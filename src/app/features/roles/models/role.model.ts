export interface RoleFormData {
  roleName: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface RolePermissions {
  roleName: string;
  permissionIds: number[];
}
