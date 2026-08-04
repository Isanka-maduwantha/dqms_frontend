export interface RegisterFormData {
  Name: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
