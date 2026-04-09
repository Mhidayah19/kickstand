import { Injectable } from '@nestjs/common';
import { BikesService } from '../bikes/bikes.service';
import { MaintenanceStatusService } from '../maintenance-status/maintenance-status.service';
import { ComplianceStatusService } from '../compliance-status/compliance-status.service';
import type {
  AttentionItem,
  AttentionResponse,
  AttentionSummary,
} from './types';

@Injectable()
export class AttentionService {
  constructor(
    private readonly bikesService: BikesService,
    private readonly maintenanceStatusService: MaintenanceStatusService,
    private readonly complianceStatusService: ComplianceStatusService,
  ) {}

  async getForBike(bikeId: string, userId: string): Promise<AttentionResponse> {
    const bike = await this.bikesService.findOneByUser(bikeId, userId);

    const [maintenance, compliance] = await Promise.all([
      this.maintenanceStatusService.computeForBike(bikeId),
      this.complianceStatusService.computeForBike(bikeId),
    ]);

    const items: AttentionItem[] = [
      ...maintenance.map((i) => ({ category: 'maintenance' as const, ...i })),
      ...compliance.map((i) => ({ category: 'compliance' as const, ...i })),
    ];

    items.sort((a, b) => a.severity - b.severity);

    const summary = this.summarise(items);

    return {
      bike: {
        id: bike.id,
        model: bike.model,
        currentMileage: bike.currentMileage,
      },
      summary,
      items,
    };
  }

  private summarise(items: AttentionItem[]): AttentionSummary {
    const summary: AttentionSummary = {
      total: items.length,
      needsAttention: 0,
      overdue: 0,
      approaching: 0,
      ok: 0,
    };
    for (const item of items) {
      if (item.status === 'overdue') summary.overdue++;
      else if (item.status === 'approaching') summary.approaching++;
      else summary.ok++;
    }
    summary.needsAttention = summary.overdue + summary.approaching;
    return summary;
  }
}
