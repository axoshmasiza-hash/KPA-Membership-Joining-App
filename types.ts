export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  role: Role;
  username: string;
  password?: string;
  passwordResetToken?: string;
  passwordResetExpires?: number;
}

export enum ApplicationStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum MembershipRole {
  MEMBER = 'Member',
  COMMITTEE = 'Committee Member',
  VOLUNTEER = 'Volunteer',
  NONE = 'N/A',
}

export interface Applicant {
  id: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  address: string;
  email: string;
  phone: string;
  province: string;
  municipality: string;
  idPhoto: {
    name: string;
    dataUrl: string;
  } | null;
  paymentProof: {
    name: string;
    dataUrl: string;
  } | null;
  status: ApplicationStatus;
  rejectionReason?: string;
  submissionDate: string;
  approvedDate?: string;
  expiryDate?: string;
  membershipRole: MembershipRole;
}

export interface Province {
  name: string;
  municipalities: string[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}