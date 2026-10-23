import { createApp } from '../app';
import { Server } from 'http';

async function runTests() {
  const app = createApp();
  const PORT = 3099;

  const server: Server = app.listen(PORT, async () => {
    console.log(`\n🧪 Integration Test Suite running on port ${PORT}...\n`);

    const baseUrl = `http://localhost:${PORT}/api/v1`;
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, testName: string, details?: any) => {
      if (condition) {
        console.log(`  ✅ PASS: ${testName}`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: ${testName}`, details ?? '');
        failed++;
      }
    };

    try {
      // 1. Test Health Endpoint
      const healthRes = await fetch(`http://localhost:${PORT}/api/v1/health`);
      const healthData = await healthRes.json();
      assert(healthRes.status === 200 && healthData.status === 'healthy', 'Health check returns 200 and healthy');

      // 2. Test GET Nearby Mechanics around Chennai Central (13.0827, 80.2707)
      const nearbyRes = await fetch(`${baseUrl}/mechanics/nearby?lat=13.0827&lng=80.2707&radiusKm=15`);
      const nearbyData = await nearbyRes.json();
      assert(nearbyRes.status === 200, 'GET /mechanics/nearby returns 200');
      assert(nearbyData.count > 0, `Nearby mechanics found: ${nearbyData.count}`);

      // Verify Haversine sorting order (ascending distance)
      let isSorted = true;
      for (let i = 1; i < nearbyData.data.length; i++) {
        if (nearbyData.data[i].distanceKm < nearbyData.data[i - 1].distanceKm) {
          isSorted = false;
          break;
        }
      }
      assert(isSorted, 'Mechanics are strictly sorted by Haversine distance ascending');
      console.log(`     Closest mechanic: ${nearbyData.data[0].user.name} (${nearbyData.data[0].distanceKm} km, ETA: ${nearbyData.data[0].estimatedArrivalMinutes} mins)`);

      // 3. Test POST /requests/create
      const createRes = await fetch(`${baseUrl}/requests/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'cust-001',
          pickupLocation: { lat: 13.0827, lng: 80.2707 },
          vehicleType: 'TWO_WHEELER',
          issueType: 'PUNCTURE',
          notes: 'Flat tyre near Chennai Central station gate 2',
        }),
      });
      const createData = await createRes.json();
      assert(createRes.status === 201, 'POST /requests/create returns 201 Created');
      assert(createData.data.request.status === 'SEARCHING', 'New request status is SEARCHING');
      assert(createData.data.request.baseFee === 349, `Base fee calculated accurately: ₹${createData.data.request.baseFee} (199 + 150 = 349)`);
      assert(createData.data.dispatchSummary.totalEligibleMechanicsFound > 0, 'Dispatch successfully found candidate mechanics');

      const requestId = createData.data.request.id;

      // 4. Test POST /requests/:id/accept
      const acceptRes = await fetch(`${baseUrl}/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mechanicId: 'mech-001',
        }),
      });
      const acceptData = await acceptRes.json();
      assert(acceptRes.status === 200, 'POST /requests/:id/accept returns 200');
      assert(acceptData.data.request.status === 'ACCEPTED', 'Request status locked to ACCEPTED');
      assert(acceptData.data.request.mechanicId === 'mech-001', 'Assigned mechanicId is mech-001');
      assert(typeof acceptData.data.verificationOtp === 'string' && /^\d{4}$/.test(acceptData.data.verificationOtp), `Generated valid 4-digit OTP: ${acceptData.data.verificationOtp}`);

      const generatedOtp = acceptData.data.verificationOtp;

      // 5. Test Concurrency Locking: Second mechanic tries to accept same request
      const doubleAcceptRes = await fetch(`${baseUrl}/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mechanicId: 'mech-003',
        }),
      });
      const doubleAcceptData = await doubleAcceptRes.json();
      assert(doubleAcceptRes.status === 409, 'Concurrency lock prevents second mechanic acceptance with 409 Conflict');

      // 6. Test POST /requests/:id/verify-otp with INVALID OTP
      const wrongOtpRes = await fetch(`${baseUrl}/requests/${requestId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: '0000',
        }),
      });
      assert(wrongOtpRes.status === 400, 'Invalid OTP rejected with 400 Bad Request');

      // 7. Test POST /requests/:id/verify-otp with VALID OTP
      const validOtpRes = await fetch(`${baseUrl}/requests/${requestId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: generatedOtp,
          mechanicId: 'mech-001',
        }),
      });
      const validOtpData = await validOtpRes.json();
      assert(validOtpRes.status === 200, 'Valid OTP accepted with 200 OK');
      assert(validOtpData.data.request.status === 'IN_PROGRESS', 'Request status transitioned to IN_PROGRESS upon handoff');

      // 8. Test PATCH /mechanics/location
      const newLat = 13.0840;
      const newLng = 80.2720;
      const locRes = await fetch(`${baseUrl}/mechanics/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mechanicId: 'mech-001',
          lat: newLat,
          lng: newLng,
        }),
      });
      const locData = await locRes.json();
      assert(locRes.status === 200, 'PATCH /mechanics/location returns 200 OK');
      assert(locData.data.mechanic.currentLocation.lat === newLat && locData.data.mechanic.currentLocation.lng === newLng, 'Mechanic GPS coordinates updated successfully');

      // 9. Test Input Validation (invalid latitude > 90)
      const invalidInputRes = await fetch(`${baseUrl}/mechanics/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mechanicId: 'mech-001',
          lat: 195.5, // Invalid!
          lng: 80.2,
        }),
      });
      assert(invalidInputRes.status === 400, 'Out-of-bounds coordinates rejected with 400 Bad Request');

    } catch (error) {
      console.error('Test error:', error);
      failed++;
    } finally {
      server.close(() => {
        console.log(`\n========================================`);
        console.log(`Test Results: ${passed} passed, ${failed} failed`);
        console.log(`========================================\n`);
        process.exit(failed > 0 ? 1 : 0);
      });
    }
  });
}

runTests();
