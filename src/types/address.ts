export interface Address {
  id: number;
  userId: string;
  label?: string;
  receiverName?: string;
  receiverPhone?: string;
  addressText: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  label?: string;
  receiverName?: string;
  receiverPhone?: string;
  addressText: string;
  latitude: number;
  longitude: number;
  isPrimary?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {}

export interface AddressResponse {
  status: string;
  message?: string;
  data: Address | Address[];
}
