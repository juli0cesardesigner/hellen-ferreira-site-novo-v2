export interface Session {
  id: string;
  name: string;
  is_active: boolean;
  is_perpetual: boolean;
  start_date: string | null;
  end_date: string | null;
  duration_slots: number;
  setup_minutes: number;
  cleanup_minutes: number;
  slug: string;
  full_price?: number;
  deposit_price: number;
  theme_color?: string;
}

export interface SessionWithPackages extends Session {
  session_packages: Package[];
}

export interface SlotDefinition {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  session_id: string | null;
  is_blocked?: boolean;
  is_active?: boolean;
  source?: 'global' | 'session';
}

export interface BlockedDate {
  id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  instagram: string | null;
  notes: string | null;
  children_info?: { name: string; birthdate: string }[];
  estimated_delivery_date?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  session_id: string;
  client_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_id?: string;
  package_type?: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
  updated_at?: string;
  cpf?: string;
  gallery_link?: string | null;
  extra_items?: { id: string; name: string; quantity: number; price: number }[] | null;
  sessions?: {
    name: string;
    theme_color: string;
  };
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  type: 'fixed' | 'variable' | 'installment';
  status: 'paid' | 'pending';
  group_id?: string;
  installment_number?: number;
  total_installments?: number;
  created_at: string;
}

export interface Package {
  id: string;
  session_id: string;
  name: string;
  description: string;
  price_digital: number;
  price_print: number;
  is_active: boolean;
  tier_order: number;
  upgrade_label?: string;
  slug?: string;
  features?: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string | null;
  category: 'improvement' | 'change' | 'add' | 'remove' | 'fix';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  target_area?: string | null;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
}
