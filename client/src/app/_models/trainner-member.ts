import { Classes } from "./classes";

export interface TrainnerMember {
  id: number;
  name: string;
  dateOfBirth: string;
  age: number;
  classList?: Classes[];
  classIds?: number[];
  adminId: number;
  password?: string; // Optional if not always required
  trainnerPrice: number;
  schedule?: {
    day: number;           // 0 = Sunday, 1 = Monday, etc.
    startTime: string;     // "HH:mm"
    endTime: string;       // "HH:mm"
  }[];
}
