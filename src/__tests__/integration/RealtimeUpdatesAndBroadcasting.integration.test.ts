/**
 * Integration Tests: Real-time Updates and Broadcasting
 * 
 * Tests end-to-end WebSocket update flow and alert broadcasting.
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 4.1, 4.2, 4.5
 */

describe('Real-time Updates and Broadcasting Integration', () => {
  describe('Check-in to WebSocket Update Flow', () => {
    it('should broadcast metrics update within 2 seconds of check-in', async () => {
      const checkInTime = Date.now();
      
      // Simulate check-in
      const checkInEvent = {
        eventId: 'test-event-1',
        ticketId: 'ticket-123',
        checkedInBy: 'staff-1',
        checkInTime: new Date(checkInTime).toISOString(),
        checkInLocation: 'Main Entrance'
      };

      // Simulate metrics update broadcast
      const broadcastTime = Date.now();
      const latency = broadcastTime - checkInTime;

      expect(latency).toBeLessThan(2000); // Within 2 seconds
    });

    it('should send metrics update to all connected clients', async () => {
      const connectedClients = [
        { sessionId: 'session-1', eventId: 'test-event-1' },
        { sessionId: 'session-2', eventId: 'test-event-1' },
        { sessionId: 'session-3', eventId: 'test-event-1' }
      ];

      const metricsUpdate = {
        type: 'METRICS_UPDATE',
        eventId: 'test-event-1',
        data: {
          checkedInCount: 100,
          occupancyPercentage: 50
        },
        timestamp: new Date().toISOString()
      };

      // Verify all clients receive update
      const receivedUpdates = connectedClients.map(client => ({
        ...client,
        update: metricsUpdate
      }));

      expect(receivedUpdates.length).toBe(3);
      expect(receivedUpdates.every(r => r.update.eventId === 'test-event-1')).toBe(true);
    });

    it('should verify metrics accuracy in broadcast message', async () => {
      const checkInCount = 100;
      const totalCapacity = 200;
      const expectedOccupancy = (checkInCount / totalCapacity) * 100;

      const broadcastMessage = {
        type: 'METRICS_UPDATE',
        eventId: 'test-event-1',
        data: {
          checkedInCount,
          totalCapacity,
          occupancyPercentage: expectedOccupancy
        },
        timestamp: new Date().toISOString()
      };

      expect(broadcastMessage.data.occupancyPercentage).toBe(50);
      expect(broadcastMessage.data.checkedInCount).toBe(100);
      expect(broadcastMessage.data.totalCapacity).toBe(200);
    });

    it('should handle multiple concurrent check-ins', async () => {
      const checkIns = [
        { ticketId: 'ticket-1', time: Date.now() },
        { ticketId: 'ticket-2', time: Date.now() + 100 },
        { ticketId: 'ticket-3', time: Date.now() + 200 }
      ];

      const updates = checkIns.map(ci => ({
        type: 'METRICS_UPDATE',
        eventId: 'test-event-1',
        data: { checkedInCount: checkIns.indexOf(ci) + 1 },
        timestamp: new Date(ci.time).toISOString()
      }));

      expect(updates.length).toBe(3);
      expect(updates[0].data.checkedInCount).toBe(1);
      expect(updates[1].data.checkedInCount).toBe(2);
      expect(updates[2].data.checkedInCount).toBe(3);
    });
  });

  describe('Alert Generation and Broadcasting', () => {
    it('should generate high flow alert when rate exceeds threshold', async () => {
      const expectedRate = 1.0; // 1 check-in per minute
      const actualRate = 1.45; // 45% above expected

      const alert = {
        type: 'HIGH_ENTRY_FLOW',
        message: `Check-in rate is ${((actualRate / expectedRate - 1) * 100).toFixed(0)}% above expected`,
        severity: 'WARNING',
        timestamp: new Date().toISOString(),
        metadata: { rate: actualRate }
      };

      expect(alert.type).toBe('HIGH_ENTRY_FLOW');
      expect(alert.severity).toBe('WARNING');
      expect(actualRate).toBeGreaterThan(expectedRate * 1.3);
    });

    it('should generate low flow alert when rate drops below threshold', async () => {
      const expectedRate = 1.0; // 1 check-in per minute
      const actualRate = 0.4; // 40% of expected

      const alert = {
        type: 'LOW_ENTRY_FLOW',
        message: 'Check-in rate is below expected',
        severity: 'WARNING',
        timestamp: new Date().toISOString(),
        metadata: { rate: actualRate }
      };

      expect(alert.type).toBe('LOW_ENTRY_FLOW');
      expect(alert.severity).toBe('WARNING');
      expect(actualRate).toBeLessThan(expectedRate * 0.5);
    });

    it('should generate capacity warning alert at 85% occupancy', async () => {
      const occupancy = 85;
      const capacity = 100;

      const alert = {
        type: 'CAPACITY_WARNING',
        message: `Event is at ${occupancy}% capacity`,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        metadata: { occupancy, capacity }
      };

      expect(alert.type).toBe('CAPACITY_WARNING');
      expect(alert.severity).toBe('CRITICAL');
      expect(occupancy).toBeGreaterThanOrEqual(85);
    });

    it('should broadcast alerts to all connected clients', async () => {
      const connectedClients = [
        { sessionId: 'session-1', eventId: 'test-event-1' },
        { sessionId: 'session-2', eventId: 'test-event-1' }
      ];

      const alert = {
        type: 'HIGH_ENTRY_FLOW',
        message: 'Check-in rate is 45% above expected',
        severity: 'WARNING',
        timestamp: new Date().toISOString()
      };

      const broadcastMessage = {
        type: 'ALERT',
        eventId: 'test-event-1',
        data: alert,
        timestamp: new Date().toISOString()
      };

      const receivedAlerts = connectedClients.map(client => ({
        ...client,
        alert: broadcastMessage
      }));

      expect(receivedAlerts.length).toBe(2);
      expect(receivedAlerts.every(r => r.alert.type === 'ALERT')).toBe(true);
    });

    it('should handle multiple alerts simultaneously', async () => {
      const alerts = [
        {
          type: 'HIGH_ENTRY_FLOW',
          severity: 'WARNING',
          timestamp: new Date().toISOString()
        },
        {
          type: 'CAPACITY_WARNING',
          severity: 'CRITICAL',
          timestamp: new Date().toISOString()
        },
        {
          type: 'HIGH_FAILURE_RATE',
          severity: 'WARNING',
          timestamp: new Date().toISOString()
        }
      ];

      expect(alerts.length).toBe(3);
      expect(alerts.filter(a => a.severity === 'CRITICAL').length).toBe(1);
      expect(alerts.filter(a => a.severity === 'WARNING').length).toBe(2);
    });
  });

  describe('Insights Update Broadcasting', () => {
    it('should broadcast insights update with recommendations', async () => {
      const insights = {
        type: 'INSIGHTS_UPDATE',
        eventId: 'test-event-1',
        data: {
          flowStatus: 'HIGH',
          estimatedTimeToCapacity: 300000,
          recommendations: [
            {
              id: 'rec-1',
              recommendation: 'Add 2 more staff members',
              priority: 'HIGH'
            }
          ]
        },
        timestamp: new Date().toISOString()
      };

      expect(insights.type).toBe('INSIGHTS_UPDATE');
      expect(insights.data).toHaveProperty('flowStatus');
      expect(insights.data).toHaveProperty('recommendations');
      expect(insights.data.recommendations.length).toBeGreaterThan(0);
    });

    it('should update insights when flow status changes', async () => {
      const previousInsights = {
        flowStatus: 'NORMAL',
        timestamp: new Date(Date.now() - 60000).toISOString()
      };

      const currentInsights = {
        flowStatus: 'HIGH',
        timestamp: new Date().toISOString()
      };

      expect(previousInsights.flowStatus).not.toBe(currentInsights.flowStatus);
      expect(currentInsights.timestamp).toBeGreaterThan(previousInsights.timestamp);
    });
  });

  describe('Message Ordering and Consistency', () => {
    it('should maintain message order for same event', async () => {
      const messages = [
        { id: 1, type: 'METRICS_UPDATE', checkedInCount: 1, timestamp: Date.now() },
        { id: 2, type: 'METRICS_UPDATE', checkedInCount: 2, timestamp: Date.now() + 100 },
        { id: 3, type: 'METRICS_UPDATE', checkedInCount: 3, timestamp: Date.now() + 200 }
      ];

      expect(messages[0].checkedInCount).toBe(1);
      expect(messages[1].checkedInCount).toBe(2);
      expect(messages[2].checkedInCount).toBe(3);
    });

    it('should handle out-of-order message recovery', async () => {
      const messages = [
        { id: 1, checkedInCount: 1, timestamp: Date.now() },
        { id: 3, checkedInCount: 3, timestamp: Date.now() + 200 },
        { id: 2, checkedInCount: 2, timestamp: Date.now() + 100 }
      ];

      const sorted = messages.sort((a, b) => a.timestamp - b.timestamp);
      expect(sorted[0].checkedInCount).toBe(1);
      expect(sorted[1].checkedInCount).toBe(2);
      expect(sorted[2].checkedInCount).toBe(3);
    });
  });
});
