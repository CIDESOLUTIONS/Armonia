// src/interfaces/service/common-service.dto.ts
export interface CreateCommonServiceDTO {
  name: string;
  description: string;
  capacity: number;
  schedule: ISchedule[];
  rules: string[];
  reservationRequired?: boolean;
  maxReservationDuration: number;
  minAdvanceReservation: number;
  maxAdvanceReservation: number;
}

export interface UpdateCommonServiceDTO extends Partial<CreateCommonServiceDTO> {
  isEnabled?: boolean;
}