export interface GameData {
  serialNumber: string;
  deviceName: string;
  deviceIp: string;
  deviceModel: string;
  fabMonth: string;
  fabDay: string;
  latency: string;
}

export const MONTHS = [
  { value: '01', label: 'January (01)' },
  { value: '02', label: 'February (02)' },
  { value: '03', label: 'March (03)' },
  { value: '04', label: 'April (04)' },
  { value: '05', label: 'May (05)' },
  { value: '06', label: 'June (06)' },
  { value: '07', label: 'July (07)' },
  { value: '08', label: 'August (08)' },
  { value: '09', label: 'September (09)' },
  { value: '10', label: 'October (10)' },
  { value: '11', label: 'November (11)' },
  { value: '12', label: 'December (12)' },
];

export const DAYS = Array.from({ length: 31 }, (_, i) => {
  const day = (i + 1).toString().padStart(2, '0');
  return { value: day, label: day };
});