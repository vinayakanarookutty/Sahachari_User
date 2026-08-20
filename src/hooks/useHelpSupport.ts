import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/env';

export interface HelpSupportContact {
  _id: string;
  title: string;
  phoneNumber: string;
  pincodes?: string[];
  pincode?: string;
  description?: string;
  isActive: boolean;
}

export function useHelpSupport(pincode?: string) {
  return useQuery<HelpSupportContact[]>({
    queryKey: ['helpSupportContacts', pincode || 'global'],
    queryFn: async () => {
      const baseUrls = [
        API_BASE_URL,
        'http://localhost:5000',
        'http://10.0.2.2:5000',
        'http://192.168.0.190:5000',
      ].filter(Boolean);

      for (const base of baseUrls) {
        try {
          const url = pincode && pincode.trim()
            ? `${base}/help-and-support?pincode=${encodeURIComponent(pincode.trim())}`
            : `${base}/help-and-support`;

          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              // Client-side strict filter to guarantee no other pincode contacts leak through
              if (pincode && pincode.trim()) {
                const targetPin = pincode.trim();
                return data.filter((item: HelpSupportContact) => {
                  const pins: string[] = [];
                  if (item.pincode && item.pincode.trim()) pins.push(item.pincode.trim());
                  if (Array.isArray(item.pincodes)) {
                    item.pincodes.forEach((p) => { if (p && p.trim()) pins.push(p.trim()); });
                  }
                  return pins.length === 0 || pins.includes(targetPin);
                });
              }
              return data;
            }
          }
        } catch (e) {
          // try next base url
        }
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
