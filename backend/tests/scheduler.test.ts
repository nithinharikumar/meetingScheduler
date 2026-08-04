import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index';
import { RoomModel } from '../src/models/Room';
import { MeetingModel } from '../src/models/Meeting';

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/meeting-scheduler-test';

describe('Meeting Scheduler API & Algorithm Tests', () => {
  beforeAll(async () => {
    // Override MONGO_URI for test environment
    process.env.MONGO_URI = TEST_MONGO_URI;
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear collections
    await RoomModel.deleteMany({});
    await MeetingModel.deleteMany({});

    // Seed the 5 test rooms
    await RoomModel.create([
      { name: 'Boardroom', capacity: 12 },
      { name: 'Turing', capacity: 8 },
      { name: 'Lovelace', capacity: 6 },
      { name: 'Hopper', capacity: 6 },
      { name: 'Hamilton', capacity: 4 },
    ]);
  });

  test('Should list all seeded rooms', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(5);
    expect(res.body.data[0].name).toBe('Boardroom');
  });

  test('Should assign the first available room (Boardroom) for a new meeting', async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1); // 1 hour from now
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    const res = await request(app)
      .post('/api/meetings')
      .send({
        title: 'Strategy Session',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.room.name).toBe('Boardroom');
  });

  test('Should assign next available rooms sequentially for overlapping time slots', async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    // Book 5 meetings at the exact same time
    const roomsBooked: string[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/meetings')
        .send({
          title: `Overlapping Meeting ${i + 1}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
      expect(res.status).toBe(201);
      roomsBooked.push(res.body.data.room.name);
    }

    // Verify all 5 unique rooms were booked in alphabetical order
    expect(roomsBooked).toEqual(['Boardroom', 'Turing', 'Lovelace', 'Hopper', 'Hamilton'].sort());
  });

  test('Should reject booking (409) if all 5 rooms are fully booked during the timeframe', async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 3);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    // Book all 5 rooms
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/meetings')
        .send({
          title: `Meeting ${i + 1}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
    }

    // Attempt to book 6th meeting
    const res = await request(app)
      .post('/api/meetings')
      .send({
        title: 'Failed Sixth Meeting',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROOMS_OCCUPIED');
  });

  test('Should allow back-to-back meetings (meeting 2 starts exactly when meeting 1 ends)', async () => {
    const start1 = new Date();
    start1.setHours(start1.getHours() + 4);
    const end1 = new Date(start1);
    end1.setHours(end1.getHours() + 1);

    const start2 = new Date(end1);
    const end2 = new Date(start2);
    end2.setHours(end2.getHours() + 1);

    // Book first meeting -> Boardroom
    const res1 = await request(app)
      .post('/api/meetings')
      .send({
        title: 'Meeting 1',
        startTime: start1.toISOString(),
        endTime: end1.toISOString(),
      });
    expect(res1.status).toBe(201);
    expect(res1.body.data.room.name).toBe('Boardroom');

    // Book second meeting -> Should also get Boardroom since it is back-to-back
    const res2 = await request(app)
      .post('/api/meetings')
      .send({
        title: 'Meeting 2',
        startTime: start2.toISOString(),
        endTime: end2.toISOString(),
      });
    expect(res2.status).toBe(201);
    expect(res2.body.data.room.name).toBe('Boardroom');
  });

  test('Should free up the room when a meeting is cancelled', async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 5);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    // Book 5 meetings to fill up all rooms
    const meetings: any[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/meetings')
        .send({
          title: `Full Meeting ${i + 1}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
      meetings.push(res.body.data);
    }

    // Try to book 6th -> fails
    const failRes = await request(app)
      .post('/api/meetings')
      .send({
        title: 'Extra Meeting',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    expect(failRes.status).toBe(409);

    // Cancel the first meeting (Boardroom)
    const cancelRes = await request(app)
      .patch(`/api/meetings/${meetings[0]._id}/cancel`)
      .send();
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    // Try to book again -> should succeed and get Boardroom
    const retryRes = await request(app)
      .post('/api/meetings')
      .send({
        title: 'New Meeting in Freed Room',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    expect(retryRes.status).toBe(201);
    expect(retryRes.body.data.room.name).toBe('Boardroom');
  });

  describe('GET /api/meetings/stats', () => {
    it('should return correct dashboard stats for today', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Setup some meetings for tomorrow (definitely in the future)
      const startTime1 = new Date(tomorrow);
      startTime1.setHours(9, 0, 0, 0);
      const endTime1 = new Date(tomorrow);
      endTime1.setHours(10, 0, 0, 0); // 60 minutes duration

      const startTime2 = new Date(tomorrow);
      startTime2.setHours(11, 0, 0, 0);
      const endTime2 = new Date(tomorrow);
      endTime2.setHours(12, 30, 0, 0); // 90 minutes duration

      // Book meeting 1
      const res1 = await request(app)
        .post('/api/meetings')
        .send({
          title: 'Meeting 1',
          startTime: startTime1.toISOString(),
          endTime: endTime1.toISOString(),
        });
      expect(res1.status).toBe(201);

      // Book meeting 2
      const res2 = await request(app)
        .post('/api/meetings')
        .send({
          title: 'Meeting 2',
          startTime: startTime2.toISOString(),
          endTime: endTime2.toISOString(),
        });
      expect(res2.status).toBe(201);

      // Fetch stats
      const statsRes = await request(app)
        .get('/api/meetings/stats')
        .query({ date: tomorrow.toISOString() });

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.success).toBe(true);
      expect(statsRes.body.data.totalMeetingsToday).toBe(2);
      expect(statsRes.body.data.averageDuration).toBe(75); // (60 + 90) / 2 = 75
      // Total working minutes = 4200. Meetings today duration = 150.
      // Occupancy rate = (150 / 4200) * 100 = 4%
      expect(statsRes.body.data.occupancyRateToday).toBe(4);
      expect(statsRes.body.data.mostUsedRoom).toBe('Boardroom');
    });
  });

  describe('Manual Room Selection', () => {
    test('Should book successfully in a specific room when available', async () => {
      const roomsRes = await request(app).get('/api/rooms');
      const targetRoom = roomsRes.body.data.find((r: any) => r.name === 'Lovelace');
      expect(targetRoom).toBeDefined();

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 4);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const res = await request(app)
        .post('/api/meetings')
        .send({
          title: 'Manual Lovelace Booking',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          roomId: targetRoom._id,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.room.name).toBe('Lovelace');
    });

    test('Should reject booking (409) if the manually selected room is occupied', async () => {
      const roomsRes = await request(app).get('/api/rooms');
      const targetRoom = roomsRes.body.data.find((r: any) => r.name === 'Hopper');
      expect(targetRoom).toBeDefined();

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 5);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      // First book it
      const res1 = await request(app)
        .post('/api/meetings')
        .send({
          title: 'First Hopper Booking',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          roomId: targetRoom._id,
        });
      expect(res1.status).toBe(201);

      // Try to book the same room again at the same time
      const res2 = await request(app)
        .post('/api/meetings')
        .send({
          title: 'Conflict Hopper Booking',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          roomId: targetRoom._id,
        });
      expect(res2.status).toBe(409);
      expect(res2.body.error.message).toContain('occupied');
    });
  });
});
