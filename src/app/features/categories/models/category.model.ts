export interface CategoryFormData {
  name: string;
  description: string;
}

export interface Category extends CategoryFormData {
  id: number;
}
