// src/interfaces/service/common-service-service.interface.ts
export interface ICommonServiceService {
  createService(
    data: CreateCommonServiceDTO,
    userId: string,
    complexId: string
  ): Promise<ICommonService>;
  
  getService(
    id: string,
    complexId: string
  ): Promise<ICommonService>;
  
  updateService(
    id: string,
    data: UpdateCommonServiceDTO,
    complexId: string
  ): Promise<ICommonService>;
  
  deleteService(
    id: string,
    complexId: string
  ): Promise<void>;
  
  getServices(
    complexId: string,
    onlyEnabled?: boolean
  ): Promise<ICommonService[]>;
  
  toggleServiceStatus(
    id: string,
    complexId: string
  ): Promise<ICommonService>;
}