-- S1 base migration. Run once against a new, empty test database.
-- Booking and Feedback are documented for later sprints, not created here.
CREATE TABLE users (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  student_staff_id VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT ck_users_role CHECK (role IN ('CUSTOMER', 'DRIVER', 'ADMIN')),
  CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
  CONSTRAINT ck_users_required CHECK (CHAR_LENGTH(TRIM(full_name)) > 0 AND CHAR_LENGTH(TRIM(email)) > 0 AND CHAR_LENGTH(TRIM(phone)) > 0 AND CHAR_LENGTH(TRIM(password_hash)) > 0)
) ENGINE=InnoDB;

CREATE TABLE customers (
  customer_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (customer_id),
  CONSTRAINT fk_customers_user FOREIGN KEY (customer_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE drivers (
  driver_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (driver_id),
  CONSTRAINT fk_drivers_user FOREIGN KEY (driver_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE admins (
  admin_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (admin_id),
  CONSTRAINT fk_admins_user FOREIGN KEY (admin_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE cars (
  car_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  driver_id BIGINT UNSIGNED NOT NULL,
  registration_plate VARCHAR(30) NOT NULL,
  model VARCHAR(100) NOT NULL,
  passenger_capacity INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (car_id),
  UNIQUE KEY uq_cars_plate (registration_plate),
  UNIQUE KEY uq_cars_id_driver (car_id, driver_id),
  CONSTRAINT fk_cars_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
  CONSTRAINT ck_cars_capacity CHECK (passenger_capacity > 0),
  CONSTRAINT ck_cars_required CHECK (CHAR_LENGTH(TRIM(registration_plate)) > 0 AND CHAR_LENGTH(TRIM(model)) > 0)
) ENGINE=InnoDB;

CREATE TABLE trips (
  trip_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  driver_id BIGINT UNSIGNED NOT NULL,
  car_id BIGINT UNSIGNED NOT NULL,
  origin VARCHAR(200) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  departure_at DATETIME NOT NULL,
  price_per_seat DECIMAL(10,2) NOT NULL,
  offered_seats INT NOT NULL,
  available_seats INT NOT NULL,
  pickup_note VARCHAR(500) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  active_driver_id BIGINT UNSIGNED GENERATED ALWAYS AS (CASE WHEN status = 'ACTIVE' THEN driver_id ELSE NULL END) STORED,
  PRIMARY KEY (trip_id),
  UNIQUE KEY uq_trips_one_active_per_driver (active_driver_id),
  KEY idx_trips_search (status, origin, destination, departure_at),
  KEY idx_trips_driver (driver_id, status),
  CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
  CONSTRAINT fk_trips_car_owner FOREIGN KEY (car_id, driver_id) REFERENCES cars(car_id, driver_id),
  CONSTRAINT ck_trips_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT ck_trips_price CHECK (price_per_seat >= 0),
  CONSTRAINT ck_trips_seats CHECK (offered_seats > 0 AND available_seats >= 0 AND available_seats <= offered_seats),
  CONSTRAINT ck_trips_route CHECK (CHAR_LENGTH(TRIM(origin)) > 0 AND CHAR_LENGTH(TRIM(destination)) > 0)
) ENGINE=InnoDB;
