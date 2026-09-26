import React from 'react'
import { WA_ICON, WA_TEAL } from '../../utils/constants'

export const Ico = ({ d, size = 24, color = WA_ICON, ...rest }: {
  d: string | React.ReactNode; size?: number; color?: string;
  fill?: string; viewBox?: string;
  strokeWidth?: string; strokeLinecap?: 'round' | 'butt' | 'square';
  strokeLinejoin?: 'round' | 'miter' | 'bevel';
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
)

export const IcoSearch = () => <Ico size={18} d={<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>} />
export const IcoSend = ({ color = WA_TEAL }: { color?: string }) => <Ico size={22} color={color} d={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} />
export const IcoAttach = () => <Ico size={22} d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
export const IcoClose = () => <Ico size={22} d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />
export const IcoBack = ({ color = WA_ICON }: { color?: string }) => <Ico size={22} color={color} d="M19 12H5M12 5l-7 7 7 7" />
export const IcoLogout = () => <Ico size={20} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>} />
export const IcoGroup = ({ size = 22, color = "#fff" }: { size?: number; color?: string }) => <Ico size={size} color={color} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />
export const IcoCheckSent = ({ color = WA_ICON }: { color?: string }) => <Ico size={15} color={color} d={<><polyline points="20 6 9 17 4 12" /></>} />
export const IcoCheckDelivered = ({ color = WA_ICON }: { color?: string }) => (
  <svg width="18" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 6 9 17 4 12" />
    <polyline points="23 6 15 17" />
  </svg>
)
export const IcoCheckSeen = ({ color = "#53bdeb" }: { color?: string }) => (
  <svg width="18" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 6 9 17 4 12" />
    <polyline points="23 6 15 17" />
  </svg>
)
export const IcoCamera = ({ color = WA_ICON }: { color?: string }) => (
  <Ico size={32} color={color} d={<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>} />
)
export const IcoEmoji = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={WA_ICON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
  </svg>
)
export const IcoMoreVert = () => <Ico size={22} d={<><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></>} />
