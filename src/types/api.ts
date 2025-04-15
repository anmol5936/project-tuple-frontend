/**
 * API Routes Documentation
 * This file contains all the available API routes with their request/response types
 */

// Request/Response Interfaces
export interface AuthResponse {
    message: string;
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      area?: {
        id: string;
        name: string;
        city: string;
        state: string;
      };
    };
  }
  
  export interface ErrorResponse {
    message: string;
    error?: string;
  }
  
  export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'Manager' | 'Deliverer' | 'Customer';
    phone?: string;
    area?: {
      name: string;
      city: string;
      state: string;
      postalCodes?: string[];
    };
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LogoutResponse {
    message: string;
  }
  
  // Define all interfaces for the API structure
  interface ApiRoute<Req, Res> {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    request?: Req;
    response: Res;
    query?: any;
  }
  
  /**
   * Authentication Routes
   * Public routes that don't require authentication
   */
  export const AUTH_ROUTES = {
    REGISTER: {
      path: '/api/auth/register',
      method: 'POST',
      request: {} as RegisterRequest,
      response: {} as AuthResponse
    },
  
    LOGIN: {
      path: '/api/auth/login',
      method: 'POST',
      request: {} as LoginRequest,
      response: {} as AuthResponse
    },
  
    LOGOUT: {
      path: '/api/auth/logout',
      method: 'POST',
      response: {} as LogoutResponse
    }
  } as const;
  
  /**
   * Customer Routes
   * Requires authentication and Customer role
   */
  export const CUSTOMER_ROUTES = {
    GET_MANAGERS: {
      path: '/api/customer/managers',
      method: 'GET',
      response: {
        managers: [] as Array<{
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
        }>
      }
    },
  
    GET_PUBLICATIONS: {
      path: '/api/customer/publications',
      method: 'GET',
      response: {
        publications: [] as Array<{
          id: string;
          name: string;
          language: string;
          description: string;
          price: number;
          publicationType: string;
          publicationDays: string[];
        }>
      }
    },
  
    GET_SUBSCRIPTIONS: {
      path: '/api/customer/subscriptions',
      method: 'GET',
      response: {
        subscriptions: [] as Array<{
          id: string;
          publication: {
            name: string;
            language: string;
            price: number;
          };
          quantity: number;
          status: string;
          address: {
            streetAddress: string;
            city: string;
            state: string;
            postalCode: string;
          };
          deliverer: {
            firstName: string;
            lastName: string;
            phone: string;
          };
        }>
      }
    },
  
    CREATE_SUBSCRIPTION: {
      path: '/api/customer/subscriptions',
      method: 'POST',
      request: {
        publicationId: '',
        quantity: 0,
        addressId: '',
        deliveryPreferences: {
          placement: '',
          additionalInstructions: ''
        }
      } as {
        publicationId: string;
        quantity: number;
        addressId: string;
        deliveryPreferences?: {
          placement: string;
          additionalInstructions: string;
        };
      },
      response: {
        message: '',
        subscriptionRequest: {
          id: '',
          status: '',
          effectiveDate: ''
        }
      } as {
        message: string;
        subscriptionRequest: {
          id: string;
          status: string;
          effectiveDate: string;
        };
      }
    },
  
    UPDATE_SUBSCRIPTION: {
      path: '/api/customer/subscriptions/:id',
      method: 'PUT',
      request: {} as {
        quantity?: number;
        addressId?: string;
        deliveryPreferences?: {
          placement: string;
          additionalInstructions: string;
        };
      },
      response: {
        message: '',
        modificationRequest: {
          id: '',
          status: '',
          effectiveDate: ''
        }
      } as {
        message: string;
        modificationRequest: {
          id: string;
          status: string;
          effectiveDate: string;
        };
      }
    },
  
    CANCEL_SUBSCRIPTION: {
      path: '/api/customer/subscriptions/:id',
      method: 'DELETE',
      response: {
        message: '',
        cancellationRequest: {
          id: '',
          status: '',
          effectiveDate: ''
        }
      } as {
        message: string;
        cancellationRequest: {
          id: string;
          status: string;
          effectiveDate: string;
        };
      }
    },
  
    REQUEST_PAUSE: {
      path: '/api/customer/pause',
      method: 'POST',
      request: {
        subscriptionId: '',
        startDate: '',
        endDate: '',
        reason: ''
      } as {
        subscriptionId: string;
        startDate: string;
        endDate: string;
        reason?: string;
      },
      response: {
        message: '',
        pauseRequest: {
          id: '',
          status: ''
        }
      } as {
        message: string;
        pauseRequest: {
          id: string;
          status: string;
        };
      }
    },
  
    GET_BILLS: {
      path: '/api/customer/bills',
      method: 'GET',
      response: {
        bills: [] as Array<{
          id: string;
          billNumber: string;
          billDate: string;
          billMonth: number;
          billYear: number;
          totalAmount: number;
          outstandingAmount: number;
          status: string;
          dueDate: string;
        }>
      }
    },
  
    GET_BILL_DETAILS: {
      path: '/api/customer/bills/:id',
      method: 'GET',
      response: {
        bill: {
          id: '',
          billNumber: '',
          totalAmount: 0,
          status: ''
        },
        items: [] as Array<{
          publication: {
            name: string;
            price: number;
          };
          quantity: number;
          totalPrice: number;
        }>
      } as {
        bill: {
          id: string;
          billNumber: string;
          totalAmount: number;
          status: string;
        };
        items: Array<{
          publication: {
            name: string;
            price: number;
          };
          quantity: number;
          totalPrice: number;
        }>;
      }
    },
  
    MAKE_PAYMENT: {
      path: '/api/customer/payments',
      method: 'POST',
      request: {
        billId: '',
        amount: 0,
        paymentMethod: 'Cash' as 'Cash' | 'Cheque' | 'Online' | 'UPI' | 'Card',
        referenceNumber: ''
      } as {
        billId: string;
        amount: number;
        paymentMethod: 'Cash' | 'Cheque' | 'Online' | 'UPI' | 'Card';
        referenceNumber?: string;
      },
      response: {
        message: '',
        payment: {
          id: '',
          receiptNumber: '',
          amount: 0,
          status: ''
        }
      } as {
        message: string;
        payment: {
          id: string;
          receiptNumber: string;
          amount: number;
          status: string;
        };
      }
    }
  } as const;
  
  /**
   * Deliverer Routes
   * Requires authentication and Deliverer role
   */
  export const DELIVERER_ROUTES = {
    GET_ROUTES: {
      path: '/api/deliverer/routes',
      method: 'GET',
      response: {
        routes: [] as Array<{
          id: string;
          routeName: string;
          routeDescription: string;
          area: {
            name: string;
            city: string;
            state: string;
          };
        }>
      }
    },
  
    GET_SCHEDULE: {
      path: '/api/deliverer/schedule',
      method: 'GET',
      response: {
        schedule: {
          id: '',
          date: '',
          status: '',
          route: {
            routeName: '',
            routeDescription: ''
          },
          area: {
            name: '',
            city: '',
            state: ''
          }
        } as {
          id: string;
          date: string;
          status: string;
          route: {
            routeName: string;
            routeDescription: string;
          };
          area: {
            name: string;
            city: string;
            state: string;
          };
        }
      }
    },
  
    GET_DELIVERY_ITEMS: {
      path: '/api/deliverer/items',
      method: 'GET',
      response: {
        items: [] as Array<{
          id: string;
          subscription: {
            userId: string;
            quantity: number;
            deliveryPreferences: {
              placement: string;
              additionalInstructions: string;
            };
          };
          address: {
            streetAddress: string;
            city: string;
            state: string;
            postalCode: string;
            deliveryInstructions: string;
          };
          publication: {
            name: string;
            language: string;
          };
        }>
      }
    },
  
    UPDATE_DELIVERY_STATUS: {
      path: '/api/deliverer/items/:id',
      method: 'PUT',
      request: {
        status: 'Delivered' as 'Delivered' | 'Failed' | 'Skipped',
        deliveryNotes: ''
      } as {
        status: 'Delivered' | 'Failed' | 'Skipped';
        deliveryNotes?: string;
      },
      response: {
        message: '',
        item: {
          id: '',
          status: '',
          deliveryTime: ''
        }
      } as {
        message: string;
        item: {
          id: string;
          status: string;
          deliveryTime: string;
        };
      }
    },
  
    GET_EARNINGS: {
      path: '/api/deliverer/earnings',
      method: 'GET',
      query: {
        month: undefined,
        year: undefined
      } as {
        month?: number;
        year?: number;
      },
      response: {
        earnings: {
          month: 0,
          year: 0,
          amount: 0,
          status: '',
          commissionRate: 0
        }
      } as {
        earnings: {
          month: number;
          year: number;
          amount: number;
          status: string;
          commissionRate: number;
        };
      }
    }
  } as const;
  
  /**
   * Manager Routes
   * Requires authentication and Manager role
   */
  export const MANAGER_ROUTES = {
    GET_AREAS: {
      path: '/api/manager/areas',
      method: 'GET',
      response: {
        areas: [] as Array<{
          id: string;
          name: string;
          city: string;
          state: string;
          postalCodes: string[];
          managers: Array<{
            firstName: string;
            lastName: string;
            email: string;
          }>;
          deliverers: Array<{
            firstName: string;
            lastName: string;
            email: string;
          }>;
          publications: Array<{
            name: string;
            language: string;
            price: number;
            publicationType: string;
          }>;
        }>
      }
    },
  
    GET_CUSTOMERS: {
      path: '/api/manager/customers',
      method: 'GET',
      response: {
        customers: [] as Array<{
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          defaultAddress: {
            streetAddress: string;
            city: string;
            state: string;
            postalCode: string;
          };
          subscriptions: Array<{
            id: string;
            publication: {
              name: string;
              language: string;
              publicationType: string;
            };
            quantity: number;
            status: string;
          }>;
        }>
      }
    },
  
    ADD_DELIVERER: {
      path: '/api/manager/deliverers',
      method: 'POST',
      request: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        areaId: '',
        bankDetails: {
          accountName: '',
          accountNumber: '',
          bankName: '',
          ifscCode: ''
        },
        commissionRate: 0
      } as {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        areaId: string;
        bankDetails: {
          accountName: string;
          accountNumber: string;
          bankName: string;
          ifscCode: string;
        };
        commissionRate: number;
      },
      response: {
        message: '',
        deliverer: {
          userId: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          areaId: '',
          commissionRate: 0,
          joiningDate: ''
        }
      } as {
        message: string;
        deliverer: {
          userId: string;
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          areaId: string;
          commissionRate: number;
          joiningDate: string;
        };
      }
    },
  
    GENERATE_BILLS: {
      path: '/api/manager/bills/generate',
      method: 'POST',
      request: {
        month: 0,
        year: 0
      } as {
        month: number;
        year: number;
      },
      response: {
        message: '',
        billIds: [] as string[]
      } as {
        message: string;
        billIds: string[];
      }
    },
  
    GENERATE_FINANCIAL_REPORT: {
      path: '/api/manager/reports/financial',
      method: 'GET',
      query: {
        month: 0,
        year: 0
      } as {
        month: number;
        year: number;
      },
      response: {
        report: {
          period: {
            month: 0,
            year: 0
          },
          billing: {
            totalBilled: 0,
            totalBills: 0,
            unpaidBills: 0,
            partiallyPaidBills: 0,
            paidBills: 0
          },
          payments: {
            totalReceived: 0,
            totalPayments: 0,
            byMethod: {} as Record<string, number>
          },
          delivererPayments: {
            totalPaid: 0,
            totalDeliverers: 0,
            pendingPayments: 0
          },
          summary: {
            grossRevenue: 0,
            totalExpenses: 0,
            netRevenue: 0
          }
        }
      } as {
        report: {
          period: {
            month: number;
            year: number;
          };
          billing: {
            totalBilled: number;
            totalBills: number;
            unpaidBills: number;
            partiallyPaidBills: number;
            paidBills: number;
          };
          payments: {
            totalReceived: number;
            totalPayments: number;
            byMethod: Record<string, number>;
          };
          delivererPayments: {
            totalPaid: number;
            totalDeliverers: number;
            pendingPayments: number;
          };
          summary: {
            grossRevenue: number;
            totalExpenses: number;
            netRevenue: number;
          };
        };
      }
    },
  
    PROCESS_DELIVERER_PAYMENTS: {
      path: '/api/manager/deliverer-payments',
      method: 'POST',
      request: {
        month: 0,
        year: 0
      } as {
        month: number;
        year: number;
      },
      response: {
        message: ''
      } as {
        message: string;
      }
    }
  } as const;