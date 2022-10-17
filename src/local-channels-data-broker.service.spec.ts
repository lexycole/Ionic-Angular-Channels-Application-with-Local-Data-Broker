import { TestBed } from '@angular/core/testing';

import { LocalChannelsDataBrokerService } from './local-channels-data-broker.service';

describe('LocalChannelsDataBrokerService', () => {
  let service: LocalChannelsDataBrokerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalChannelsDataBrokerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
