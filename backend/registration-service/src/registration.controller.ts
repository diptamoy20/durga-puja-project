import { REGISTRATION_PATTERNS } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CommitteesService } from './committees/committees.service';
import {
  ChangeCommitteeStatusPayload,
  CreatePortalAccountPayload,
  ListCommitteesPayload,
  SubmitCommitteePayload,
} from './committees/dto/committee.dto';
import {
  DecideDiasporaPayload,
  DiasporaService,
  ListDiasporaPayload,
  SubmitDiasporaPayload,
} from './diaspora/diaspora.service';

@Controller()
export class RegistrationController {
  constructor(
    private readonly diaspora: DiasporaService,
    private readonly committees: CommitteesService,
  ) {}

  @MessagePattern('health.ping')
  ping(): { service: string; status: string } {
    return { service: 'registration-service', status: 'ok' };
  }

  // Diaspora
  @MessagePattern(REGISTRATION_PATTERNS.DIASPORA_SUBMIT)
  submitDiaspora(@Payload() payload: SubmitDiasporaPayload) {
    return this.diaspora.submit(payload);
  }

  @MessagePattern(REGISTRATION_PATTERNS.DIASPORA_FIND_ALL)
  findAllDiaspora(@Payload() query: ListDiasporaPayload) {
    return this.diaspora.findAll(query);
  }

  @MessagePattern(REGISTRATION_PATTERNS.DIASPORA_FIND_ONE)
  findOneDiaspora(@Payload() payload: { id: number }) {
    return this.diaspora.findOne(payload.id);
  }

  @MessagePattern(REGISTRATION_PATTERNS.DIASPORA_STATS)
  diasporaStats() {
    return this.diaspora.stats();
  }

  @MessagePattern(REGISTRATION_PATTERNS.DIASPORA_VERIFY)
  verifyDiaspora(@Payload() payload: DecideDiasporaPayload) {
    return this.diaspora.verify(payload);
  }

  @MessagePattern(REGISTRATION_PATTERNS.DIASPORA_REJECT)
  rejectDiaspora(@Payload() payload: DecideDiasporaPayload) {
    return this.diaspora.reject(payload);
  }

  // Committees
  @MessagePattern(REGISTRATION_PATTERNS.COMMITTEE_SUBMIT)
  submitCommittee(@Payload() payload: SubmitCommitteePayload) {
    return this.committees.submit(payload);
  }

  @MessagePattern(REGISTRATION_PATTERNS.COMMITTEE_FIND_ALL)
  findAllCommittees(@Payload() query: ListCommitteesPayload) {
    return this.committees.findAll(query);
  }

  @MessagePattern(REGISTRATION_PATTERNS.COMMITTEE_FIND_ONE)
  findOneCommittee(@Payload() payload: { id: number }) {
    return this.committees.findOne(payload.id);
  }

  @MessagePattern(REGISTRATION_PATTERNS.COMMITTEE_CHANGE_STATUS)
  changeCommitteeStatus(@Payload() payload: ChangeCommitteeStatusPayload) {
    return this.committees.changeStatus(payload);
  }

  @MessagePattern(REGISTRATION_PATTERNS.COMMITTEE_CREATE_PORTAL_ACCOUNT)
  createPortalAccount(@Payload() payload: CreatePortalAccountPayload) {
    return this.committees.createPortalAccount(payload);
  }

  @MessagePattern(REGISTRATION_PATTERNS.COMMITTEE_STATS)
  committeeStats() {
    return this.committees.stats();
  }
}
