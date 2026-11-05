export type Office = {
  city: string;
  address: string;
  phone: string;
  fax?: string;
  primary?: boolean;
};

export const OFFICES: Office[] = [
  {
    city: "Fargo",
    address: "1630 1st Ave N Ste B, Fargo, ND 58102",
    phone: "218-820-7321",
    fax: "720-293-0300",
    primary: true,
  },
];
