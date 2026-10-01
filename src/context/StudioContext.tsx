import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Appointment,
  BusinessSettings,
  Customer,
  Enquiry,
  Invoice,
  NotificationLog,
  Order,
  OrderStatus,
  ServiceDefinition,
  AIEnquiryAnalysis,
} from '../types';
import {
  initialAppointments,
  initialCustomers,
  initialEnquiries,
  initialInvoices,
  initialNotifications,
  initialOrders,
  initialServices,
  initialSettings,
} from '../data/initialData';
import { db, auth } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

interface StudioContextType {
  // State
  settings: BusinessSettings;
  services: ServiceDefinition[];
  customers: Customer[];
  orders: Order[];
  appointments: Appointment[];
  invoices: Invoice[];
  enquiries: Enquiry[];
  notifications: NotificationLog[];
  currentView: 'customer' | 'admin';
  activeAdminTab: string;
  isAuthorizedUser: boolean; // For measurements gate
  isOwnerAuthenticated: boolean; // Protects Sadika's Atelier from customer access
  isFirestoreLive: boolean; // Indicates real-time cloud connection status

  // Navigation & UI controls
  setCurrentView: (view: 'customer' | 'admin') => void;
  setActiveAdminTab: (tab: string) => void;
  setIsAuthorizedUser: (val: boolean) => void;
  setIsOwnerAuthenticated: (val: boolean) => void;
  logoutOwner: () => void;

  // Business Settings
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;

  // Customers (98% recurring focus)
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  findCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];

  // Orders & Workflow
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (id: string, newStatus: OrderStatus) => void;
  toggleFabricReceived: (id: string, received: boolean, notes?: string) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;

  // Appointments & Calendar
  addAppointment: (apt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => void;
  cancelAppointment: (id: string) => void;
  checkSlotConflict: (date: string, time: string, excludeId?: string) => boolean;

  // Invoices & Financials
  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  markInvoiceAsPaid: (id: string, paymentMethod?: string) => void;
  sendInvoiceNotification: (invoiceId: string, channel: 'WhatsApp' | 'Email') => void;

  // Enquiries & AI
  submitEnquiry: (
    enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'>
  ) => Promise<{ enquiry: Enquiry; analysis?: AIEnquiryAnalysis }>;
  analyzeEnquiryWithGemini: (enquiryId: string) => Promise<AIEnquiryAnalysis | null>;
  updateEnquiryStatus: (id: string, status: Enquiry['status']) => void;
  convertEnquiryToOrderAndCustomer: (
    enquiryId: string,
    consultationSlot?: { date: string; time: string }
  ) => { customer: Customer; order: Order };

  // Notifications
  logNotification: (
    notif: Omit<NotificationLog, 'id' | 'sentAt' | 'status'>
  ) => NotificationLog;

  // Computed metrics for dashboard
  metrics: {
    newEnquiriesCount: number;
    todayAppointmentsCount: number;
    upcomingFittingsCount: number;
    ordersInProductionCount: number;
    outstandingInvoicesCount: number;
    outstandingInvoicesAmount: number;
    overdueInvoicesCount: number;
    overdueInvoicesAmount: number;
    ordersNeedingInvoicesCount: number;
  };

  // Reset to sample state
  resetAllData: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'sadika_studio_v1_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(() =>
    loadFromStorage('settings', initialSettings)
  );
  const [services, setServices] = useState<ServiceDefinition[]>(() =>
    loadFromStorage('services', initialServices)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage('customers', initialCustomers)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('orders', initialOrders)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage('appointments', initialAppointments)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadFromStorage('invoices', initialInvoices)
  );
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() =>
    loadFromStorage('enquiries', initialEnquiries)
  );
  const [notifications, setNotifications] = useState<NotificationLog[]>(() =>
    loadFromStorage('notifications', initialNotifications)
  );

  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('overview');
  const [isAuthorizedUser, setIsAuthorizedUser] = useState<boolean>(true);
  const [isFirestoreLive, setIsFirestoreLive] = useState<boolean>(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sadika_owner_passcode_auth') === 'true';
    } catch {
      return false;
    }
  });

  const logoutOwner = () => {
    try {
      localStorage.removeItem('sadika_owner_passcode_auth');
    } catch {}
    setIsOwnerAuthenticated(false);
    setCurrentView('customer');
  };

  // Real-time Firestore sync & seed
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function initFirestoreSync() {
      try {
        // Enquiries listener
        const enquiriesPath = 'enquiries';
        const unsubEnq = onSnapshot(
          collection(db, enquiriesPath),
          (snapshot) => {
            if (!snapshot.empty) {
              const loaded: Enquiry[] = [];
              snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Enquiry));
              setEnquiries(loaded);
              setIsFirestoreLive(true);
            } else {
              // Seed initial enquiries
              initialEnquiries.forEach((item) => {
                setDoc(doc(db, enquiriesPath, item.id), item).catch((err) =>
                  console.warn('Seed note:', err)
                );
              });
            }
          },
          (error) => {
            console.warn('Enquiries live listener notice:', error.message);
          }
        );
        unsubs.push(unsubEnq);

        // Appointments listener
        const aptsPath = 'appointments';
        const unsubApt = onSnapshot(
          collection(db, aptsPath),
          (snapshot) => {
            if (!snapshot.empty) {
              const loaded: Appointment[] = [];
              snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Appointment));
              setAppointments(loaded);
              setIsFirestoreLive(true);
            } else {
              initialAppointments.forEach((item) => {
                setDoc(doc(db, aptsPath, item.id), item).catch((err) =>
                  console.warn('Seed note:', err)
                );
              });
            }
          },
          (error) => {
            console.warn('Appointments live listener notice:', error.message);
          }
        );
        unsubs.push(unsubApt);

        // Orders listener
        const ordersPath = 'orders';
        const unsubOrd = onSnapshot(
          collection(db, ordersPath),
          (snapshot) => {
            if (!snapshot.empty) {
              const loaded: Order[] = [];
              snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Order));
              setOrders(loaded);
              setIsFirestoreLive(true);
            } else {
              initialOrders.forEach((item) => {
                setDoc(doc(db, ordersPath, item.id), item).catch((err) =>
                  console.warn('Seed note:', err)
                );
              });
            }
          },
          (error) => {
            console.warn('Orders live listener notice:', error.message);
          }
        );
        unsubs.push(unsubOrd);

        // Invoices listener
        const invoicesPath = 'invoices';
        const unsubInv = onSnapshot(
          collection(db, invoicesPath),
          (snapshot) => {
            if (!snapshot.empty) {
              const loaded: Invoice[] = [];
              snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Invoice));
              setInvoices(loaded);
              setIsFirestoreLive(true);
            } else {
              initialInvoices.forEach((item) => {
                setDoc(doc(db, invoicesPath, item.id), item).catch((err) =>
                  console.warn('Seed note:', err)
                );
              });
            }
          },
          (error) => {
            console.warn('Invoices live listener notice:', error.message);
          }
        );
        unsubs.push(unsubInv);

        // Customers listener
        const customersPath = 'customers';
        const unsubCust = onSnapshot(
          collection(db, customersPath),
          (snapshot) => {
            if (!snapshot.empty) {
              const loaded: Customer[] = [];
              snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Customer));
              setCustomers(loaded);
              setIsFirestoreLive(true);
            } else {
              initialCustomers.forEach((item) => {
                setDoc(doc(db, customersPath, item.id), item).catch((err) =>
                  console.warn('Seed note:', err)
                );
              });
            }
          },
          (error) => {
            console.warn('Customers live listener notice:', error.message);
          }
        );
        unsubs.push(unsubCust);
      } catch (err) {
        console.warn('Firestore initialization notice:', err);
      }
    }

    initFirestoreSync();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Save changes to localStorage as offline safety
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('services', services), [services]);
  useEffect(() => saveToStorage('customers', customers), [customers]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('appointments', appointments), [appointments]);
  useEffect(() => saveToStorage('invoices', invoices), [invoices]);
  useEffect(() => saveToStorage('enquiries', enquiries), [enquiries]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);

  // Business settings update
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Customers
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);

    // Persist to Firestore
    setDoc(doc(db, 'customers', newCust.id), newCust).catch((err) =>
      console.warn('Firestore customer write note:', err)
    );

    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    updateDoc(doc(db, 'customers', id), updates).catch((err) =>
      console.warn('Firestore customer update note:', err)
    );
  };

  const findCustomerById = (id: string) => customers.find((c) => c.id === id);

  const searchCustomers = (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.occasion.toLowerCase().includes(q)
    );
  };

  // Orders
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const orderNum = `SAD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Persist to Firestore
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((err) =>
      console.warn('Firestore order write note:', err)
    );

    if (newOrder.fabricReceived) {
      logNotification({
        type: 'Booking Confirmed (Fabric Received)',
        recipientName: newOrder.customerName,
        recipientContact: newOrder.customerPhone,
        channel: 'WhatsApp',
        content: `Dear ${newOrder.customerName}, your fabric for ${newOrder.garmentTitle} has been received. Your booking (${orderNum}) is officially confirmed on Sadika's Bridal Boutique calendar!`,
        relatedOrderId: newOrder.id,
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== id) return ord;
        const updated = { ...ord, status: newStatus };

        updateDoc(doc(db, 'orders', id), { status: newStatus }).catch((err) =>
          console.warn('Firestore order status note:', err)
        );

        if (newStatus === 'Final Fitting') {
          logNotification({
            type: 'Order Ready for Final Fitting',
            recipientName: ord.customerName,
            recipientContact: ord.customerPhone,
            channel: 'WhatsApp',
            content: `Exciting news ${ord.customerName}! Your ${ord.garmentTitle} is nearing completion and ready for its Final Fitting & Collection at Sadika's Bridal Boutique. Please check your calendar or get in touch to secure your fitting slot.`,
            relatedOrderId: ord.id,
          });
        }
        return updated;
      })
    );
  };

  // CRITICAL RULE: Booking is only confirmed once fabric is received
  const toggleFabricReceived = (id: string, received: boolean, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== id) return ord;
        const todayStr = new Date().toISOString().split('T')[0];
        const newStatus: OrderStatus =
          received && ord.status === 'Consultation' ? 'Fabric Received' : ord.status;

        const updated: Order = {
          ...ord,
          fabricReceived: received,
          fabricReceivedDate: received ? todayStr : undefined,
          fabricNotes: notes !== undefined ? notes : ord.fabricNotes,
          status: newStatus,
        };

        updateDoc(doc(db, 'orders', id), {
          fabricReceived: received,
          fabricReceivedDate: received ? todayStr : null,
          fabricNotes: notes !== undefined ? notes : ord.fabricNotes || null,
          status: newStatus,
        }).catch((err) => console.warn('Firestore fabric toggle note:', err));

        if (received) {
          logNotification({
            type: 'Booking Confirmed (Fabric Received)',
            recipientName: ord.customerName,
            recipientContact: ord.customerPhone,
            channel: 'WhatsApp',
            content: `Dear ${ord.customerName}, your fabric for "${ord.garmentTitle}" has been received in the atelier. Your booking (${ord.orderNumber}) is now officially locked and confirmed on Sadika's cutting calendar!`,
            relatedOrderId: ord.id,
          });
        }
        return updated;
      })
    );
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
    updateDoc(doc(db, 'orders', id), updates).catch((err) =>
      console.warn('Firestore order update note:', err)
    );
  };

  // Appointments
  const checkSlotConflict = (date: string, time: string, excludeId?: string) => {
    return appointments.some(
      (a) =>
        a.id !== excludeId &&
        a.date === date &&
        a.time === time &&
        a.status !== 'Cancelled'
    );
  };

  const addAppointment = (aptData: Omit<Appointment, 'id'>): Appointment => {
    const isConflict = checkSlotConflict(aptData.date, aptData.time);
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now().toString().slice(-4)}`,
      isConflict,
    };
    setAppointments((prev) => [newApt, ...prev]);

    setDoc(doc(db, 'appointments', newApt.id), newApt).catch((err) =>
      console.warn('Firestore appointment write note:', err)
    );

    logNotification({
      type: aptData.status === 'Confirmed' ? 'Appointment Reminder' : 'Booking Request Received',
      recipientName: aptData.customerName,
      recipientContact: aptData.customerPhone,
      channel: 'WhatsApp',
      content: `Hello ${aptData.customerName}, your appointment for "${aptData.type}" at Sadika's Bridal Boutique on ${aptData.date} at ${aptData.time} is ${aptData.status.toLowerCase()}. Studio address: ${settings.studioAddress}. Note: Please arrive promptly as slots are allocated 45 mins.`,
    });

    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, status };

        updateDoc(doc(db, 'appointments', id), { status }).catch((err) =>
          console.warn('Firestore appointment status note:', err)
        );

        if (status === 'Confirmed') {
          logNotification({
            type: 'Appointment Reminder',
            recipientName: a.customerName,
            recipientContact: a.customerPhone,
            channel: 'WhatsApp',
            content: `Good news ${a.customerName}! Sadika has confirmed your "${a.type}" fitting on ${a.date} at ${a.time}. Please remember to bring shoes of intended heel height.`,
          });
        }
        return updated;
      })
    );
  };

  const rescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    const hasConflict = checkSlotConflict(newDate, newTime, id);
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updated = {
          ...a,
          date: newDate,
          time: newTime,
          status: 'Rescheduled' as const,
          isConflict: hasConflict,
        };

        updateDoc(doc(db, 'appointments', id), {
          date: newDate,
          time: newTime,
          status: 'Rescheduled',
        }).catch((err) => console.warn('Firestore reschedule note:', err));

        logNotification({
          type: 'Appointment Rescheduled',
          recipientName: a.customerName,
          recipientContact: a.customerPhone,
          channel: 'WhatsApp',
          content: `Hi ${a.customerName}, your Sadika's Bridal Boutique fitting has been rescheduled to ${newDate} at ${newTime}. We look forward to seeing you then!`,
        });

        return updated;
      })
    );
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' as const } : a))
    );
    updateDoc(doc(db, 'appointments', id), { status: 'Cancelled' }).catch((err) =>
      console.warn('Firestore cancel appointment note:', err)
    );
  };

  // Invoices
  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const invCount = invoices.length + 41;
    const invNum = `INV-${new Date().getFullYear()}-${String(invCount).padStart(3, '0')}`;
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now().toString().slice(-4)}`,
      invoiceNumber: invNum,
    };

    setInvoices((prev) => [newInv, ...prev]);

    setDoc(doc(db, 'invoices', newInv.id), newInv).catch((err) =>
      console.warn('Firestore invoice write note:', err)
    );

    if (newInv.orderId) {
      setOrders((prev) =>
        prev.map((o) => (o.id === newInv.orderId ? { ...o, invoiceId: newInv.id } : o))
      );
      updateDoc(doc(db, 'orders', newInv.orderId), { invoiceId: newInv.id }).catch((err) =>
        console.warn('Firestore link order note:', err)
      );
    }

    logNotification({
      type: 'Invoice Issued',
      recipientName: newInv.customerName,
      recipientContact: newInv.customerPhone,
      channel: 'WhatsApp',
      content: `Hi ${newInv.customerName}, Sadika's Bridal Boutique has prepared your invoice ${invNum} for ${newInv.garmentTitle} (Total: R${newInv.total.toLocaleString()}, Deposit required: R${newInv.depositRequired.toLocaleString()} due ${newInv.dueDate}). Bank: ${settings.bankDetails.bankName}, Acc: ${settings.bankDetails.accountNumber}, Ref: ${invNum} / ${newInv.customerName.split(' ').slice(-1)[0]}.`,
      relatedInvoiceId: newInv.id,
      relatedOrderId: newInv.orderId,
    });

    return newInv;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
    updateDoc(doc(db, 'invoices', id), updates).catch((err) =>
      console.warn('Firestore invoice update note:', err)
    );
  };

  const markInvoiceAsPaid = (id: string, paymentMethod = 'EFT Bank Transfer') => {
    const todayStr = new Date().toISOString().split('T')[0];
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const updated = {
          ...inv,
          status: 'Paid' as const,
          depositPaid: inv.total,
          paidAt: todayStr,
          paymentMethod,
        };

        updateDoc(doc(db, 'invoices', id), {
          status: 'Paid',
          depositPaid: inv.total,
          paidAt: todayStr,
          paymentMethod,
        }).catch((err) => console.warn('Firestore invoice mark paid note:', err));

        return updated;
      })
    );
  };

  const sendInvoiceNotification = (invoiceId: string, channel: 'WhatsApp' | 'Email') => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const isOverdue = inv.status === 'Overdue';
    const notifType = isOverdue ? 'Invoice Overdue' : 'Invoice Issued';

    const content = isOverdue
      ? `Dear ${inv.customerName}, gentle follow-up from Sadika's Bridal Boutique regarding invoice ${inv.invoiceNumber} (R${inv.total.toLocaleString()}) which was due on ${inv.dueDate}. Please send proof of payment once processed so your garment production remains on schedule.`
      : `Dear ${inv.customerName}, here is your official Sadika's Bridal Boutique invoice ${inv.invoiceNumber} for "${inv.garmentTitle}". Total: R${inv.total.toLocaleString()} (Deposit: R${inv.depositRequired.toLocaleString()}). Thank you for choosing Sadika's Bridal Boutique!`;

    logNotification({
      type: notifType,
      recipientName: inv.customerName,
      recipientContact: channel === 'WhatsApp' ? inv.customerPhone : inv.customerEmail,
      channel,
      content,
      relatedInvoiceId: inv.id,
      relatedOrderId: inv.orderId,
    });

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              sentViaWhatsApp: channel === 'WhatsApp' ? true : i.sentViaWhatsApp,
              sentViaEmail: channel === 'Email' ? true : i.sentViaEmail,
            }
          : i
      )
    );
  };

  // Enquiries & AI Analysis dynamically based on live database inputs
  const submitEnquiry = async (
    enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'>
  ): Promise<{ enquiry: Enquiry; analysis?: AIEnquiryAnalysis }> => {
    const newEnqId = `enq-${Date.now().toString().slice(-4)}`;

    // Prepare structured database context for dynamic low-latency AI execution
    const existingClient = customers.find(
      (c) => c.phone === enquiryData.phone || (enquiryData.email && c.email === enquiryData.email)
    );

    const activeOrdersInProd = orders.filter(
      (o) => o.status === 'Fitting' || o.status === 'In Production' || o.status === 'Fabric Received'
    ).length;

    const targetMonth = enquiryData.eventDate ? enquiryData.eventDate.slice(0, 7) : '';
    const deliveriesInTargetMonth = orders.filter((o) => o.eventDate.startsWith(targetMonth)).length;

    const databaseContext = {
      activeOrdersInProduction: activeOrdersInProd,
      isRecurring: Boolean(existingClient),
      previousOrdersCount: existingClient?.previousOrdersCount || 0,
      deliveriesInTargetMonth,
      capacityStatus: activeOrdersInProd > 4 ? 'High Volume' : 'Moderate Capacity',
    };

    // Call server API for Gemini AI Analysis with database context
    let analysis: AIEnquiryAnalysis | undefined = undefined;
    try {
      const res = await fetch('/api/analyze-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: enquiryData.customerName,
          service: enquiryData.serviceCategory,
          occasion: enquiryData.occasion,
          eventDate: enquiryData.eventDate,
          garmentDescription: enquiryData.garmentDescription,
          designPreferences: enquiryData.designPreferences,
          notes: enquiryData.notes,
          preferredFittingDate: enquiryData.preferredConsultationDate,
          databaseContext, // Live structured database inputs
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analysis) {
          analysis = {
            ...data.analysis,
            analyzedAt: new Date().toISOString(),
            source: data.source || 'gemini',
          };
        }
      }
    } catch (err) {
      console.warn('API call error during enquiry submit:', err);
    }

    const createdEnquiry: Enquiry = {
      ...enquiryData,
      id: newEnqId,
      status: 'New',
      createdAt: new Date().toISOString(),
      aiAnalysis: analysis,
    };

    setEnquiries((prev) => [createdEnquiry, ...prev]);

    // Persist to Firestore
    setDoc(doc(db, 'enquiries', newEnqId), createdEnquiry).catch((err) =>
      console.warn('Firestore enquiry write note:', err)
    );

    logNotification({
      type: 'Enquiry Received',
      recipientName: createdEnquiry.customerName,
      recipientContact: createdEnquiry.phone,
      channel: 'WhatsApp',
      content: `Thank you for your enquiry with Sadika's Bridal Boutique, ${createdEnquiry.customerName}! We have received your request for your ${createdEnquiry.occasion} on ${createdEnquiry.eventDate}. Sadika reviews every enquiry against atelier capacity and will confirm your consultation shortly. (Operating hours: Mon–Fri 09:00–17:00).`,
    });

    return { enquiry: createdEnquiry, analysis };
  };

  const analyzeEnquiryWithGemini = async (
    enquiryId: string
  ): Promise<AIEnquiryAnalysis | null> => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return null;

    const existingClient = customers.find(
      (c) => c.phone === enq.phone || (enq.email && c.email === enq.email)
    );
    const activeOrdersInProd = orders.filter(
      (o) => o.status === 'Fitting' || o.status === 'In Production' || o.status === 'Fabric Received'
    ).length;
    const targetMonth = enq.eventDate ? enq.eventDate.slice(0, 7) : '';
    const deliveriesInTargetMonth = orders.filter((o) => o.eventDate.startsWith(targetMonth)).length;

    const databaseContext = {
      activeOrdersInProduction: activeOrdersInProd,
      isRecurring: Boolean(existingClient),
      previousOrdersCount: existingClient?.previousOrdersCount || 0,
      deliveriesInTargetMonth,
      capacityStatus: activeOrdersInProd > 4 ? 'High Volume' : 'Moderate Capacity',
    };

    try {
      const res = await fetch('/api/analyze-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: enq.customerName,
          service: enq.serviceCategory,
          occasion: enq.occasion,
          eventDate: enq.eventDate,
          garmentDescription: enq.garmentDescription,
          designPreferences: enq.designPreferences,
          notes: enq.notes,
          preferredFittingDate: enq.preferredConsultationDate,
          databaseContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analysis) {
          const updatedAnalysis: AIEnquiryAnalysis = {
            ...data.analysis,
            analyzedAt: new Date().toISOString(),
            source: data.source || 'gemini',
          };

          setEnquiries((prev) =>
            prev.map((e) => (e.id === enquiryId ? { ...e, aiAnalysis: updatedAnalysis } : e))
          );

          updateDoc(doc(db, 'enquiries', enquiryId), {
            aiAnalysis: updatedAnalysis,
          }).catch((err) => console.warn('Firestore AI analysis update note:', err));

          return updatedAnalysis;
        }
      }
    } catch (err) {
      console.error('Failed to analyze with Gemini:', err);
    }
    return null;
  };

  const updateEnquiryStatus = (id: string, status: Enquiry['status']) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
    updateDoc(doc(db, 'enquiries', id), { status }).catch((err) =>
      console.warn('Firestore enquiry status note:', err)
    );
  };

  const convertEnquiryToOrderAndCustomer = (
    enquiryId: string,
    consultationSlot?: { date: string; time: string }
  ) => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) throw new Error('Enquiry not found');

    let existingCust = customers.find(
      (c) => c.phone === enq.phone || (enq.email && c.email === enq.email)
    );

    let customerToUse: Customer;

    if (existingCust) {
      const updatedCust: Customer = {
        ...existingCust,
        occasion: enq.occasion,
        eventDate: enq.eventDate,
        designPreferences: enq.designPreferences || existingCust.designPreferences,
        notes: `${existingCust.notes ? existingCust.notes + '\n' : ''}[${new Date().toISOString().split('T')[0]}] New enquiry converted: ${enq.garmentDescription}`,
        previousOrdersCount: existingCust.previousOrdersCount + 1,
      };
      setCustomers((prev) =>
        prev.map((c) => (c.id === existingCust!.id ? updatedCust : c))
      );
      setDoc(doc(db, 'customers', existingCust.id), updatedCust, { merge: true }).catch((err) =>
        console.warn('Firestore customer update note:', err)
      );
      customerToUse = updatedCust;
    } else {
      customerToUse = addCustomer({
        name: enq.customerName,
        phone: enq.phone,
        email: enq.email,
        suburb: 'Cape Town',
        occasion: enq.occasion,
        eventDate: enq.eventDate,
        measurements: { notes: 'Awaiting first consultation measurement session.' },
        designPreferences: enq.designPreferences || enq.garmentDescription,
        fabricSuppliedByCustomer: true,
        notes: enq.notes || 'New client via website booking portal.',
        isRecurring: false,
        previousOrdersCount: 0,
      });
    }

    const newOrder = addOrder({
      orderNumber: `SAD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId: customerToUse.id,
      customerName: customerToUse.name,
      customerPhone: customerToUse.phone,
      customerEmail: customerToUse.email,
      serviceCategory: enq.serviceCategory,
      garmentTitle: enq.garmentDescription.slice(0, 60),
      occasion: enq.occasion,
      eventDate: enq.eventDate,
      status: 'Consultation',
      fabricReceived: false,
      designNotes: `${enq.garmentDescription}\nDesign preferences: ${enq.designPreferences}`,
      estimatedPrice: enq.serviceCategory.includes('Bridal')
        ? 7500
        : enq.serviceCategory.includes('Matric')
        ? 4000
        : 3000,
      appointmentIds: [],
      targetCompletionDate: enq.eventDate,
    });

    if (consultationSlot || (enq.preferredConsultationDate && enq.preferredTimeSlot)) {
      const aptDate = consultationSlot?.date || enq.preferredConsultationDate!;
      const aptTime = consultationSlot?.time || enq.preferredTimeSlot || '10:00';

      const newApt = addAppointment({
        customerId: customerToUse.id,
        customerName: customerToUse.name,
        customerPhone: customerToUse.phone,
        orderId: newOrder.id,
        type: 'Initial Consultation',
        date: aptDate,
        time: aptTime,
        durationMinutes: 45,
        status: 'Confirmed',
        notes: `Initial design consultation & measurements for ${newOrder.garmentTitle}`,
      });

      newOrder.appointmentIds.push(newApt.id);
    }

    updateEnquiryStatus(enquiryId, 'Accepted');

    return { customer: customerToUse, order: newOrder };
  };

  const logNotification = (
    notif: Omit<NotificationLog, 'id' | 'sentAt' | 'status'>
  ): NotificationLog => {
    const newNotif: NotificationLog = {
      ...notif,
      id: `notif-${Date.now().toString().slice(-4)}`,
      sentAt: new Date().toISOString(),
      status: 'Sent',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const resetAllData = () => {
    setSettings(initialSettings);
    setServices(initialServices);
    setCustomers(initialCustomers);
    setOrders(initialOrders);
    setAppointments(initialAppointments);
    setInvoices(initialInvoices);
    setEnquiries(initialEnquiries);
    setNotifications(initialNotifications);
    localStorage.clear();
  };

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;

    const todayAppointmentsCount = appointments.filter(
      (a) => a.date === today && a.status !== 'Cancelled'
    ).length;

    const upcomingFittingsCount = appointments.filter(
      (a) =>
        a.date >= today &&
        a.status !== 'Cancelled' &&
        a.type.toLowerCase().includes('fitting')
    ).length;

    const ordersInProductionCount = orders.filter(
      (o) => o.status === 'In Production' || o.status === 'Fitting' || o.status === 'Fabric Received'
    ).length;

    const outstanding = invoices.filter((i) => i.status === 'Issued');
    const outstandingInvoicesCount = outstanding.length;
    const outstandingInvoicesAmount = outstanding.reduce((sum, i) => sum + (i.total - i.depositPaid), 0);

    const overdue = invoices.filter((i) => i.status === 'Overdue');
    const overdueInvoicesCount = overdue.length;
    const overdueInvoicesAmount = overdue.reduce((sum, i) => sum + (i.total - i.depositPaid), 0);

    const ordersNeedingInvoicesCount = orders.filter(
      (o) =>
        (o.status === 'Fabric Received' ||
          o.status === 'Fitting' ||
          o.status === 'In Production' ||
          o.status === 'Final Fitting') &&
        (!o.invoiceId || !invoices.some((i) => i.id === o.invoiceId))
    ).length;

    return {
      newEnquiriesCount,
      todayAppointmentsCount,
      upcomingFittingsCount,
      ordersInProductionCount,
      outstandingInvoicesCount,
      outstandingInvoicesAmount,
      overdueInvoicesCount,
      overdueInvoicesAmount,
      ordersNeedingInvoicesCount,
    };
  }, [enquiries, appointments, orders, invoices]);

  return (
    <StudioContext.Provider
      value={{
        settings,
        services,
        customers,
        orders,
        appointments,
        invoices,
        enquiries,
        notifications,
        currentView,
        activeAdminTab,
        isAuthorizedUser,
        isOwnerAuthenticated,
        isFirestoreLive,
        setCurrentView,
        setActiveAdminTab,
        setIsAuthorizedUser,
        setIsOwnerAuthenticated,
        logoutOwner,
        updateSettings,
        addCustomer,
        updateCustomer,
        findCustomerById,
        searchCustomers,
        addOrder,
        updateOrderStatus,
        toggleFabricReceived,
        updateOrder,
        addAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        cancelAppointment,
        checkSlotConflict,
        createInvoice,
        updateInvoice,
        markInvoiceAsPaid,
        sendInvoiceNotification,
        submitEnquiry,
        analyzeEnquiryWithGemini,
        updateEnquiryStatus,
        convertEnquiryToOrderAndCustomer,
        logNotification,
        metrics,
        resetAllData,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) throw new Error('useStudio must be used within a StudioProvider');
  return context;
};
