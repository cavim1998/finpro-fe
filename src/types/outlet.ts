export interface OutletListTypes {
  addressText: string;
  createdAt: string;
  id: number;
  isActive: true;
  latitude: string;
  longitude: string;
  locationCategory?: string | null;
  name: string;
  photoUrl?: string | null;
  serviceRadiusKm: string;
  staffCount: number;
  updatedAt: string;
  _count: { staff: number };
}
