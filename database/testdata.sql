
-- Run only after ukm_carpool.sql, against a disposable development database.
INSERT INTO users (user_id, full_name, email, phone, password_hash, account_role)
VALUES
(1, 'Test Driver', 'driver@example.test', '0000000000', '!login-disabled!', 'STUDENT'),
(2, 'Test Customer', 'customer@example.test', '0000000001', '!login-disabled!', 'STUDENT');
INSERT INTO Vehicles (vehicle_id, driver_id, plate_number, vehicle_model, seat_capacity)
VALUES 
(1, 1, 'TEST001', 'Example vehicle', 3);
INSERT INTO trips (trip_id, driver_id, vehicle_id, origin, destination, departure_time, price_per_seat, total_seats, available_seats)
VALUES
(1, 1, 1, 'Example origin', 'Example destination', '2030-01-01 09:00:00', 3.00, 3, 3);
