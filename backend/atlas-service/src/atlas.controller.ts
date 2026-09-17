import { ATLAS_PATTERNS } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AtlasService, ListPandalsPayload, PandalData } from './atlas.service';

@Controller()
export class AtlasController {
  constructor(private readonly atlas: AtlasService) {}

  @MessagePattern('health.ping')
  ping(): { service: string; status: string } {
    return { service: 'atlas-service', status: 'ok' };
  }

  @MessagePattern(ATLAS_PATTERNS.FIND_ALL)
  findAll(@Payload() query: ListPandalsPayload) {
    return this.atlas.findAll(query);
  }

  @MessagePattern(ATLAS_PATTERNS.FIND_ONE)
  findOne(@Payload() payload: { id: number; scopeToCommitteeId?: number }) {
    return this.atlas.findOne(payload);
  }

  @MessagePattern(ATLAS_PATTERNS.STATS)
  stats() {
    return this.atlas.stats();
  }

  @MessagePattern(ATLAS_PATTERNS.PUBLIC_LIST)
  publicList(
    @Payload()
    query: {
      north?: number;
      south?: number;
      east?: number;
      west?: number;
      search?: string;
      limit?: number;
    },
  ) {
    return this.atlas.publicList(query);
  }

  @MessagePattern(ATLAS_PATTERNS.MAP_DATA)
  mapData(
    @Payload()
    query: { north?: number; south?: number; east?: number; west?: number; limit?: number },
  ) {
    return this.atlas.publicList(query);
  }

  @MessagePattern(ATLAS_PATTERNS.CREATE)
  create(@Payload() payload: { data: PandalData; actorId: number }) {
    return this.atlas.create(payload);
  }

  @MessagePattern(ATLAS_PATTERNS.UPDATE)
  update(
    @Payload()
    payload: {
      id: number;
      data: Partial<PandalData>;
      scopeToCommitteeId?: number;
      actorId: number;
    },
  ) {
    return this.atlas.update(payload);
  }

  @MessagePattern(ATLAS_PATTERNS.SUBMIT)
  submit(@Payload() payload: { id: number; scopeToCommitteeId?: number; actorId: number }) {
    return this.atlas.submit(payload);
  }

  @MessagePattern(ATLAS_PATTERNS.MODERATE)
  moderate(
    @Payload()
    payload: {
      id: number;
      decision: 'start_review' | 'approve' | 'reject';
      remarks?: string;
      actorId: number;
    },
  ) {
    return this.atlas.moderate(payload);
  }

  @MessagePattern(ATLAS_PATTERNS.REMOVE)
  remove(@Payload() payload: { id: number; scopeToCommitteeId?: number; actorId: number }) {
    return this.atlas.remove(payload);
  }
}
