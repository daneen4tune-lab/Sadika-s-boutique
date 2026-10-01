export type OrderStatus =
  | 'New Enquiry'
  | 'Consultation'
  | 'Booking Confirmed'
  | 'Fabric Received'
  | 'Fitting'
  | 'In Production'
  | 'Final Fitting'
  | 'Completed';

export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Overdue';

export type AppointmentType =
  | 'Initial Consultation'
  | 'Measurements & Fabric Drop-off'
  | 'First Fitting (Toile / Baste)'
  | 'Second Fitting'
  | 'Final Fitting & Collection';

export type AppointmentStatus = 'Requested' | 'Confirmed' | 'Completed' | 'Rescheduled' | 'Cancelled';

export type OccasionType =
  | 'Wedding'
  | 'Attending a Wedding'
  | 'Matric Ball'
  | 'Eid'
  | 'Christmas / Festive'
  | 'Traditional / Cultural'
  | 'Evening Gala'
  | 'Alterations & Repairs'
  | 'Other Special Occasion';

export interface CustomerMeasurements {
  bust?: number;
  underbust?: number;
  waist?: number;
  highHip?: number;
  fullHip?: number;
  shoulderToWaist?: number;
  waistToFloor?: number;
  napeToFloor?: number;
  armCircumference?: number;
  sleeveLength?: number;
  backWidth?: number;
  notes?: string;
  lastUpdated?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  suburb: string;
  occasion: OccasionType;
  eventDate: string;
  measurements: CustomerMeasurements;
  designPreferences: string;
  fabricSuppliedByCustomer: boolean;
  fabricDetails?: string;
  notes: string;
  isRecurring: boolean;
  previousOrdersCount: number;
  createdAt: string;
}

export interface AIEnquiryAnalysis {
  requestedService: string;
  occasion: string;
  eventDate: string;
  garmentType: string;
  designPreferences: string;
  importantNotes: string;
  urgencyLevel: 'Standard' | 'Urgent' | 'Critical';
  urgencyReason: string;
  leadTimeWeeks?: number;
  suggestedActions: string[];
  fabricRequirements?: string;
  estimatedFittingSchedule?: Array<{
    stage: string;
    suggestedTiming: string;
    notes: string;
  }>;
  studioPolicyAlerts?: string[];
  analyzedAt?: string;
  source?: 'gemini' | 'heuristic';
}

export interface Enquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  occasion: OccasionType;
  eventDate: string;
  serviceCategory: string;
  garmentDescription: string;
  designPreferences: string;
  notes: string;
  preferredConsultationDate?: string;
  preferredTimeSlot?: string;
  status: 'New' | 'Reviewed' | 'Accepted' | 'Archived';
  aiAnalysis?: AIEnquiryAnalysis;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  type: AppointmentType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  isConflict?: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Labor / Dressmaking' | 'Fabric / Notions' | 'Design / Pattern' | 'Rush Fee' | 'Alteration';
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId?: string;
  garmentTitle: string;
  eventDate: string;
  items: InvoiceItem[];
  subtotal: number;
  depositRequired: number;
  depositPaid: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  sentViaWhatsApp?: boolean;
  sentViaEmail?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceCategory: string;
  garmentTitle: string;
  occasion: OccasionType;
  eventDate: string; // YYYY-MM-DD
  status: OrderStatus;
  fabricReceived: boolean;
  fabricReceivedDate?: string;
  fabricNotes?: string;
  designNotes: string;
  estimatedPrice: number;
  invoiceId?: string;
  appointmentIds: string[];
  createdAt: string;
  targetCompletionDate: string;
}

export interface ServiceDefinition {
  id: string;
  title: string;
  category: 'Bridal Wear' | 'Matric Dance' | 'Occasion Wear' | 'Evening Wear' | 'Alterations & Repairs';
  tagline: string;
  description: string;
  subServices: string[];
  startingPrice: number;
  typicalLeadTime: string;
  standardLeadTimeWeeks: number;
  rushLeadTimeWeeks: number;
  rushFeeAmount: number;
  consultationFee: number;
  estimatedFabricMeterage: string;
  depositPercentage: number;
  fabricNotice: string;
  imageHint: string;
}

export interface BusinessSettings {
  studioName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  studioAddress: string;
  operatingDays: string[]; // ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  operatingHoursStart: string; // '09:00'
  operatingHoursEnd: string; // '17:00'
  slotIntervalMinutes: number; // 45
  isWeekendClosed: boolean;
  minimumLeadTimeWeeks: number; // 8
  peakSeasonMonths: string[]; // ['October', 'November', 'December']
  peakSeasonLeadTimeWeeks: number; // 12
  rushFeeFlat: number; // e.g. R500
  rushFeePercentage: number; // e.g. 15%
  consultationFeeDefault: number; // e.g. R250
  deductConsultationFeeFromOrder: boolean;
  decemberCutoffDate: string; // e.g. "2026-10-15"
  matricCutoffDate: string; // e.g. "2026-09-15"
  fabricDepositPolicy: string;
  lateArrivalPolicy: string;
  cancellationPolicy: string;
  bankDetails: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    branchCode: string;
    accountType: string;
    referenceFormat: string;
  };
}

export interface NotificationLog {
  id: string;
  type:
    | 'Enquiry Received'
    | 'Booking Request Received'
    | 'Booking Confirmed (Fabric Received)'
    | 'Appointment Reminder'
    | 'Appointment Rescheduled'
    | 'Invoice Issued'
    | 'Invoice Overdue'
    | 'Order Ready for Final Fitting';
  recipientName: string;
  recipientContact: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
  content: string;
  sentAt: string;
  status: 'Sent' | 'Delivered' | 'Read';
  relatedOrderId?: string;
  relatedInvoiceId?: string;
}
