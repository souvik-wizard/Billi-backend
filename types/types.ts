interface SellerDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  gst: string;
}

interface BillingDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  stateCode: string;
}

interface ShippingDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  stateCode: string;
}

interface OrderDetails {
  orderNo: string;
  orderDate: string;
}

interface Item {
  description: string;
  unitPrice: number;
  quantity: number;
  discount?: number;
  taxRate: number;
  taxType: string;
}

export interface InvoiceRequest {
  sellerDetails: SellerDetails;
  billingDetails: BillingDetails;
  shippingDetails: ShippingDetails;
  orderDetails: OrderDetails;
  items: Item[];
  reverseCharge: string;
  placeOfSupply: string;
  placeOfDelivery: string;
}