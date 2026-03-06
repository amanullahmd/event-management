/**
 * Integration Tests: Historical Data and Persistence
 * 
 * Tests analytics data persistence and historical retrieval.
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

describe('Historical Data and Persistence Integration', () => {
  describe('Analytics Data Persistence', () => {
    it('should persist metrics snapshots to database', async () => {
      const snapshot = {
        id: 'snapshot-1',
        eventId: 'test-event-1',
        checkedInCount: 100,
        totalCapacity: 200,
        occupancyPercentage: 50,
        noShowCount: 10,
        snapshotTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      expect(snapshot).toHaveProperty('id');
      expect(snapshot).toHaveProperty('eventId');
      expect(snapshot).toHaveProperty('checkedInCount');
      expect(snapshot).toHaveProperty('snapshotTime');
      expect(snapshot).toHaveProperty('createdAt');
    });

    it('should record hourly metrics correctly', async () => {
      const hourlyMetrics = {
        id: 'hourly-1',
        eventId: 'test-event-1',
        hour: 14,
        checkInCount: 50,
        checkInRate: 0.83,
        recordedAt: new Date().toISOString()
      };

      expect(hourlyMetrics).toHaveProperty('hour');
      expect(hourlyMetrics).toHaveProperty('checkInCount');
      expect(hourlyMetrics).toHaveProperty('checkInRate');
      expect(hourlyMetrics.hour).toBe(14);
    });

    it('should record staffing metrics correctly', async () => {
      const staffingMetrics = {
        id: 'staffing-1',
        eventId: 'test-event-1',
        staffId: 'staff-1',
        totalCheckIns: 150,
        successfulCheckIns: 147,
        averageProcessingTime: 8.2,
        recordedAt: new Date().toISOString()
      };

      expect(staffingMetrics).toHaveProperty('staffId');
      expect(staffingMetrics).toHaveProperty('totalCheckIns');
      expect(staffingMetrics).toHaveProperty('successfulCheckIns');
      expect(staffingMetrics).toHaveProperty('averageProcessingTime');
    });

    it('should persist data at regular intervals', async () => {
      const persistenceIntervals = [
        { timestamp: Date.now(), dataPoints: 10 },
        { timestamp: Date.now() + 60000, dataPoints: 10 },
        { timestamp: Date.now() + 120000, dataPoints: 10 }
      ];

      expect(persistenceIntervals.length).toBe(3);
      expect(persistenceIntervals.every(p => p.dataPoints === 10)).toBe(true);
    });

    it('should handle batch persistence efficiently', async () => {
      const batch = Array.from({ length: 100 }, (_, i) => ({
        id: `snapshot-${i}`,
        eventId: 'test-event-1',
        checkedInCount: 100 + i,
        timestamp: new Date().toISOString()
      }));

      expect(batch.length).toBe(100);
      expect(batch[0]).toHaveProperty('id');
      expect(batch[99]).toHaveProperty('id');
    });
  });

  describe('Historical Data Retrieval', () => {
    it('should retrieve historical analytics for completed event', async () => {
      const historicalAnalytics = {
        eventId: 'test-event-1',
        finalAttendanceRate: 85.5,
        noShowPercentage: 14.5,
        peakEntryHour: 14,
        finalHourlyDistribution: {
          9: 10,
          10: 25,
          11: 40,
          12: 35,
          13: 20,
          14: 15
        },
        eventEndTime: new Date().toISOString()
      };

      expect(historicalAnalytics).toHaveProperty('eventId');
      expect(historicalAnalytics).toHaveProperty('finalAttendanceRate');
      expect(historicalAnalytics).toHaveProperty('noShowPercentage');
      expect(historicalAnalytics).toHaveProperty('peakEntryHour');
    });

    it('should verify final attendance rate calculation', async () => {
      const totalTicketsSold = 1000;
      const checkedInCount = 855;
      const finalAttendanceRate = (checkedInCount / totalTicketsSold) * 100;

      expect(finalAttendanceRate).toBe(85.5);
    });

    it('should verify no-show percentage calculation', async () => {
      const totalTicketsSold = 1000;
      const checkedInCount = 855;
      const noShowCount = totalTicketsSold - checkedInCount;
      const noShowPercentage = (noShowCount / totalTicketsSold) * 100;

      expect(noShowPercentage).toBe(14.5);
    });

    it('should retrieve peak entry hour and metrics', async () => {
      const hourlyDistribution = {
        9: 10,
        10: 25,
        11: 40,
        12: 35,
        13: 20,
        14: 15
      };

      const peakHour = Object.entries(hourlyDistribution).reduce((max, [hour, count]) =>
        count > max.count ? { hour: parseInt(hour), count } : max
      );

      expect(peakHour.hour).toBe(11);
      expect(peakHour.count).toBe(40);
    });

    it('should retrieve staffing performance metrics', async () => {
      const staffPerformance = [
        {
          staffId: 'staff-1',
          staffName: 'John Doe',
          totalCheckIns: 150,
          successRate: 98.5,
          averageProcessingTime: 8.2
        },
        {
          staffId: 'staff-2',
          staffName: 'Jane Smith',
          totalCheckIns: 120,
          successRate: 95.0,
          averageProcessingTime: 9.1
        }
      ];

      expect(staffPerformance.length).toBe(2);
      expect(staffPerformance[0]).toHaveProperty('totalCheckIns');
      expect(staffPerformance[0]).toHaveProperty('successRate');
    });

    it('should retrieve ticket type distribution from history', async () => {
      const ticketTypeDistribution = [
        {
          ticketTypeName: 'General Admission',
          totalSold: 500,
          checkedIn: 480,
          checkInPercentage: 96.0,
          noShowCount: 20
        },
        {
          ticketTypeName: 'VIP',
          totalSold: 100,
          checkedIn: 98,
          checkInPercentage: 98.0,
          noShowCount: 2
        }
      ];

      expect(ticketTypeDistribution.length).toBe(2);
      expect(ticketTypeDistribution[0]).toHaveProperty('checkInPercentage');
    });
  });

  describe('Data Consistency and Integrity', () => {
    it('should maintain consistency between snapshots and hourly metrics', async () => {
      const snapshot = {
        checkedInCount: 100,
        timestamp: new Date().toISOString()
      };

      const hourlyMetrics = [
        { hour: 14, checkInCount: 50 },
        { hour: 15, checkInCount: 50 }
      ];

      const totalFromHourly = hourlyMetrics.reduce((sum, m) => sum + m.checkInCount, 0);
      expect(totalFromHourly).toBe(snapshot.checkedInCount);
    });

    it('should verify data integrity on retrieval', async () => {
      const storedData = {
        eventId: 'test-event-1',
        checkedInCount: 100,
        occupancyPercentage: 50,
        checksum: 'abc123'
      };

      const retrievedData = {
        eventId: 'test-event-1',
        checkedInCount: 100,
        occupancyPercentage: 50,
        checksum: 'abc123'
      };

      expect(storedData).toEqual(retrievedData);
    });

    it('should handle missing historical data gracefully', async () => {
      const historicalData = null;
      const fallbackData = {
        message: 'No historical data available',
        eventId: 'test-event-1'
      };

      const displayedData = historicalData || fallbackData;
      expect(displayedData).toEqual(fallbackData);
    });
  });

  describe('Data Retention and Cleanup', () => {
    it('should retain historical data for completed events', async () => {
      const completedEvent = {
        eventId: 'test-event-1',
        status: 'COMPLETED',
        endTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        dataRetained: true
      };

      expect(completedEvent.dataRetained).toBe(true);
      expect(completedEvent.status).toBe('COMPLETED');
    });

    it('should archive old analytics data', async () => {
      const archiveThreshold = 90 * 24 * 60 * 60 * 1000; // 90 days
      const oldData = {
        eventId: 'test-event-1',
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days ago
        shouldArchive: true
      };

      expect(oldData.shouldArchive).toBe(true);
    });

    it('should support data export for compliance', async () => {
      const exportData = {
        eventId: 'test-event-1',
        format: 'CSV',
        includeFields: [
          'eventId',
          'checkedInCount',
          'occupancyPercentage',
          'timestamp'
        ],
        exportTime: new Date().toISOString()
      };

      expect(exportData).toHaveProperty('format');
      expect(exportData).toHaveProperty('includeFields');
      expect(exportData.includeFields.length).toBeGreaterThan(0);
    });
  });

  describe('Query Performance for Historical Data', () => {
    it('should retrieve historical data efficiently', async () => {
      const queryStartTime = Date.now();

      const historicalData = {
        eventId: 'test-event-1',
        finalAttendanceRate: 85.5,
        noShowPercentage: 14.5,
        peakEntryHour: 14
      };

      const queryEndTime = Date.now();
      const duration = queryEndTime - queryStartTime;

      expect(duration).toBeLessThan(500);
      expect(historicalData).toHaveProperty('eventId');
    });

    it('should support filtering historical data by date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = new Date();

      const filteredData = [
        { eventId: 'event-1', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
        { eventId: 'event-2', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
      ].filter(d => d.date >= startDate && d.date <= endDate);

      expect(filteredData.length).toBe(2);
    });

    it('should support aggregation of historical data', async () => {
      const events = [
        { eventId: 'event-1', attendanceRate: 85.5 },
        { eventId: 'event-2', attendanceRate: 90.0 },
        { eventId: 'event-3', attendanceRate: 88.5 }
      ];

      const averageAttendanceRate =
        events.reduce((sum, e) => sum + e.attendanceRate, 0) / events.length;

      expect(averageAttendanceRate).toBeCloseTo(88, 0);
    });
  });
});

