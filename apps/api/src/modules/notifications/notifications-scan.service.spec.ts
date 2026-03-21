import { NotificationsScanService } from './notifications-scan.service';

describe('NotificationsScanService', () => {
  const complianceJob = { run: jest.fn() };
  const maintenanceJob = { run: jest.fn() };
  const freshnessJob = { run: jest.fn() };

  let service: NotificationsScanService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsScanService(
      complianceJob as never,
      maintenanceJob as never,
      freshnessJob as never,
    );
  });

  it('dispatches a single named job without touching the others', async () => {
    complianceJob.run.mockResolvedValue({
      usersNotified: 1,
      notificationsSent: 2,
    });

    await expect(service.run('compliance')).resolves.toEqual({
      job: 'compliance',
      usersNotified: 1,
      notificationsSent: 2,
    });

    expect(complianceJob.run).toHaveBeenCalledTimes(1);
    expect(maintenanceJob.run).not.toHaveBeenCalled();
    expect(freshnessJob.run).not.toHaveBeenCalled();
  });

  it('runs all jobs and aggregates their counts by default', async () => {
    complianceJob.run.mockResolvedValue({
      usersNotified: 1,
      notificationsSent: 2,
    });
    maintenanceJob.run.mockResolvedValue({
      usersNotified: 3,
      notificationsSent: 4,
    });
    freshnessJob.run.mockResolvedValue({
      usersNotified: 5,
      notificationsSent: 6,
    });

    await expect(service.run()).resolves.toEqual({
      job: 'all',
      usersNotified: 9,
      notificationsSent: 12,
    });
  });
});
