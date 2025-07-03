// src/services/service/common-service.service.ts
import { injectable } from 'tsyringe';
import { 
  ICommonService,
  ICommonServiceService,
  CreateCommonServiceDTO,
  UpdateCommonServiceDTO
} from '../../interfaces/service/common-service.interface';
import { CommonServiceModel } from '../../models/service/common-service.model';
import { NotFoundError, ValidationError } from '../../utils/errors';

@injectable()
export class CommonServiceService implements ICommonServiceService {
  async createService(
    data: CreateCommonServiceDTO,
    userId: string,
    complexId: string
  ): Promise<ICommonService> {
    const existingService = await CommonServiceModel.findOne({
      name: data.name,
      residentialComplex: complexId
    });

    if (existingService) {
      throw new ValidationError('Ya existe un servicio con este nombre');
    }

    const service = new CommonServiceModel({
      ...data,
      residentialComplex: complexId,
      createdBy: userId
    });

    await service.save();
    return service;
  }

  async getService(id: string, complexId: string): Promise<ICommonService> {
    const service = await CommonServiceModel.findOne({
      _id: id,
      residentialComplex: complexId
    });

    if (!service) {
      throw new NotFoundError('Servicio no encontrado');
    }

    return service;
  }

  async updateService(
    id: string,
    data: UpdateCommonServiceDTO,
    complexId: string
  ): Promise<ICommonService> {
    if (data.name) {
      const existingService = await CommonServiceModel.findOne({
        name: data.name,
        residentialComplex: complexId,
        _id: { $ne: id }
      });

      if (existingService) {
        throw new ValidationError('Ya existe un servicio con este nombre');
      }
    }

    const service = await CommonServiceModel.findOneAndUpdate(
      {
        _id: id,
        residentialComplex: complexId
      },
      data,
      { new: true }
    );

    if (!service) {
      throw new NotFoundError('Servicio no encontrado');
    }

    return service;
  }

  async deleteService(id: string, complexId: string): Promise<void> {
    const _result = await CommonServiceModel.deleteOne({
      _id: id,
      residentialComplex: complexId
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Servicio no encontrado');
    }
  }

  async getServices(
    complexId: string,
    onlyEnabled: boolean = false
  ): Promise<ICommonService[]> {
    const query = {
      residentialComplex: complexId,
      ...(onlyEnabled ? { isEnabled: true } : {})
    };

    return CommonServiceModel.find(query).sort({ name: 1 });
  }

  async toggleServiceStatus(id: string, complexId: string): Promise<ICommonService> {
    const service = await this.getService(id, complexId);
    service.isEnabled = !service.isEnabled;
    await service.save();
    return service;
  }
}