"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserProfile, RoleCode, StationType } from '@/types';

// Extended user type for app context (includes computed fields for convenience)
export interface AppUser extends User {
  profile?: UserProfile;
  outletId?: number;
  workerStation?: StationType;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: RoleCode, workerStation?: StationType) => Promise<boolean>;
  logout: () => void;
  isCheckedIn: boolean;
  checkIn: () => void;
  checkOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for each role
const demoUsers: Record<string, User & { profile: UserProfile; outletStaffInfo?: { outletId: number; workerStation?: StationType } }> = {
  'customer@demo.com': {
    id: 'cust-1',
    email: 'customer@demo.com',
    role: 'CUSTOMER',
    isEmailVerified: true,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'cust-1',
      fullName: 'John Customer',
      phone: '+1 234 567 8900',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  'driver@demo.com': {
    id: 'driver-1',
    email: 'driver@demo.com',
    role: 'DRIVER',
    isEmailVerified: true,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'driver-1',
      fullName: 'Mike Driver',
      phone: '+1 234 567 8901',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    outletStaffInfo: { outletId: 1 },
  },
  'washer@demo.com': {
    id: 'worker-wash-1',
    email: 'washer@demo.com',
    role: 'WORKER',
    isEmailVerified: true,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'worker-wash-1',
      fullName: 'Sarah Washer',
      phone: '+1 234 567 8902',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    outletStaffInfo: { outletId: 1, workerStation: 'WASHING' },
  },
  'ironer@demo.com': {
    id: 'worker-iron-1',
    email: 'ironer@demo.com',
    role: 'WORKER',
    isEmailVerified: true,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'worker-iron-1',
      fullName: 'Tom Ironer',
      phone: '+1 234 567 8903',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    outletStaffInfo: { outletId: 1, workerStation: 'IRONING' },
  },
  'packer@demo.com': {
    id: 'worker-pack-1',
    email: 'packer@demo.com',
    role: 'WORKER',
    isEmailVerified: true,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'worker-pack-1',
      fullName: 'Lisa Packer',
      phone: '+1 234 567 8904',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    outletStaffInfo: { outletId: 1, workerStation: 'PACKING' },
  },
  'admin@demo.com': {
    id: 'admin-1',
    email: 'admin@demo.com',
    role: 'OUTLET_ADMIN',
    isEmailVerified: true,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'admin-1',
      fullName: 'Jane Admin',
      phone: '+1 234 567 8905',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    outletStaffInfo: { outletId: 1 },
  },
  'superadmin@demo.com': {
    id: 'super-1',
    email: 'superadmin@demo.com',
    role: 'SUPER_ADMIN',
    isEmailVerified: true,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      userId: 'super-1',
      fullName: 'Alex SuperAdmin',
      phone: '+1 234 567 8906',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const login = useCallback(async (email: string, password: string, role: RoleCode, workerStation?: StationType): Promise<boolean> => {
    // Demo login - in production, this would validate against a backend
    const demoUser = demoUsers[email.toLowerCase()];
    
    if (demoUser && password === 'demo123') {
      const appUser: AppUser = {
        ...demoUser,
        outletId: demoUser.outletStaffInfo?.outletId,
        workerStation: demoUser.outletStaffInfo?.workerStation,
      };
      setUser(appUser);
      return true;
    }

    // Create a new user for demo purposes
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      email,
      role,
      isEmailVerified: false,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        userId: `user-${Date.now()}`,
        fullName: email.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      workerStation: role === 'WORKER' ? workerStation : undefined,
      outletId: role !== 'CUSTOMER' && role !== 'SUPER_ADMIN' ? 1 : undefined,
    };
    
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsCheckedIn(false);
  }, []);

  const checkIn = useCallback(() => {
    setIsCheckedIn(true);
  }, []);

  const checkOut = useCallback(() => {
    setIsCheckedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isCheckedIn,
      checkIn,
      checkOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
