-- Fictional development data only. Password hashes here cannot be used to log in.
-- Run only after 001_base.sql, against a disposable development database.
INSERT INTO users (user_id, full_name, email, phone, password_hash, role)
VALUES (1, 'Test Driver', 'driver@example.test', '0000000000', '!login-disabled!', 'DRIVER'),
       (2, 'Test Customer', 'customer@example.test', '0000000001', '!login-disabled!', 'CUSTOMER');
INSERT INTO drivers (driver_id) VALUES (1);
INSERT INTO customers (customer_id) VALUES (2);
INSERT INTO cars (car_id, driver_id, registration_plate, model, passenger_capacity)
VALUES (1, 1, 'TEST001', 'Example vehicle', 3);
INSERT INTO trips (trip_id, driver_id, car_id, origin, destination, departure_at, price_per_seat, offered_seats, available_seats)
VALUES (1, 1, 1, 'Example origin', 'Example destination', '2030-01-01 09:00:00', 3.00, 3, 3);
