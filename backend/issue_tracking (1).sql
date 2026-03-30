-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 19, 2025 at 09:42 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `issue_tracking`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `admin_password` varchar(255) NOT NULL,
  `role` enum('admin') NOT NULL DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `admin_email`, `admin_password`, `role`) VALUES
(1, 'issuetracking25@gmail.com', '$2b$10$v88GQq9K8XXKNYcDnKgevOcpvts6AgztdSfVyo7xbf7Ne0pgmcjcK', 'admin'),
(2, 'manavparekh1693@gmail.com', '$2b$10$tNGq496hNYvBsk5b6c/fQ.vdUbGbviUwkIUY/FCTw40ii0fECIfgi', 'admin'),
(3, 'hetpandya@gmail.com', '$2b$10$wHM/m3Rq7yKBXDmbb4jime65JZzwK6Tm9HMDnG604u8ZIzJ5eoCv6', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL,
  `issue_id` int(11) NOT NULL,
  `giver_id` int(11) NOT NULL,
  `giver_role` enum('User') NOT NULL DEFAULT 'User',
  `feedback_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`feedback_id`, `issue_id`, `giver_id`, `giver_role`, `feedback_text`, `created_at`) VALUES
(1, 4, 1, 'User', 'Fix this porblem', '2025-09-18 12:30:21'),
(2, 1, 1, 'User', 'fix this problem', '2025-09-18 12:58:20'),
(3, 4, 1, 'User', 'fix this problem', '2025-09-18 12:59:10'),
(4, 4, 1, 'User', 'fix this problem', '2025-09-18 13:01:44');

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `issue_id` int(11) NOT NULL,
  `reporter_type` enum('User','Secretary','Admin') NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `category` enum('Personal','General') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `building_name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Pending','In Progress','Resolved','Closed') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `issues`
--

INSERT INTO `issues` (`issue_id`, `reporter_type`, `reporter_id`, `category`, `title`, `description`, `building_name`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 'User', 1, 'General', 'abc', 'akjbsdkjbdsv', 'Aakash Enclave', '[]', 'Pending', '2025-08-26 07:36:02', '2025-09-19 00:18:01'),
(3, 'User', 2, 'Personal', 'Pipe break', 'Pipe break call a plumber ', 'Aakash Enclave', '1758114249170.jpg', 'Resolved', '2025-09-17 13:04:09', '2025-09-19 10:56:44'),
(4, 'User', 1, 'General', 'Car parking', 'Car not park as decided', 'Aakash Enclave', '1758114459519.jpg', 'In Progress', '2025-09-17 13:07:39', '2025-09-19 00:20:05');

-- --------------------------------------------------------

--
-- Table structure for table `issue_logs`
--

CREATE TABLE `issue_logs` (
  `log_id` int(11) NOT NULL,
  `issue_id` int(11) NOT NULL,
  `updated_by_type` enum('User','Secretary') NOT NULL,
  `updated_by_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `issue_logs`
--

INSERT INTO `issue_logs` (`log_id`, `issue_id`, `updated_by_type`, `updated_by_id`, `action`, `old_value`, `new_value`, `created_at`) VALUES
(1, 1, 'User', 1, 'CREATE:title', NULL, 'abc', '2025-08-26 07:36:02'),
(8, 4, 'Secretary', 1, 'UPDATE:status', 'Pending', 'In Progress', '2025-09-18 18:50:05'),
(9, 3, 'Secretary', 1, 'UPDATE:status', 'Pending', 'Resolved', '2025-09-19 05:26:44');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `receiver_type` varchar(50) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `building_name` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `receiver_type`, `receiver_id`, `message`, `building_name`, `user_id`, `is_read`, `created_at`) VALUES
(4, 'admin', 1, 'New feedback added on issue #1', NULL, NULL, 0, '2025-09-18 12:58:20'),
(5, 'admin', 2, 'New feedback added on issue #1', NULL, NULL, 0, '2025-09-18 12:58:20'),
(6, 'Secretary', 1, 'User added feedback on issue #1', NULL, NULL, 0, '2025-09-18 12:58:20'),
(7, 'admin', 1, 'New feedback added on issue #4', NULL, NULL, 0, '2025-09-18 12:59:10'),
(8, 'admin', 2, 'New feedback added on issue #4', NULL, NULL, 0, '2025-09-18 12:59:10'),
(9, 'Secretary', 1, 'User added feedback on issue #4', NULL, NULL, 0, '2025-09-18 12:59:10'),
(10, 'admin', 1, 'New feedback added on issue #4', NULL, NULL, 0, '2025-09-18 13:01:44'),
(11, 'admin', 2, 'New feedback added on issue #4', NULL, NULL, 0, '2025-09-18 13:01:44'),
(12, 'Secretary', 1, 'User added feedback on issue #4', NULL, NULL, 0, '2025-09-18 13:01:44');

-- --------------------------------------------------------

--
-- Table structure for table `secretary`
--

CREATE TABLE `secretary` (
  `secretary_id` int(11) NOT NULL,
  `sname` varchar(255) NOT NULL,
  `semail` varchar(255) NOT NULL,
  `spassword` varchar(255) NOT NULL,
  `role` enum('Secretary') NOT NULL DEFAULT 'Secretary',
  `wing` varchar(25) DEFAULT NULL,
  `house_no` varchar(25) NOT NULL,
  `building_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `secretary`
--

INSERT INTO `secretary` (`secretary_id`, `sname`, `semail`, `spassword`, `role`, `wing`, `house_no`, `building_name`) VALUES
(1, 'Manav Parekh', 'manavparekh@gmail.com', '$2b$10$3YoOpNMtiAGwJ5oxLNIziO7hnCVyHac15aoJX2w7pBGEzYCiTBWnm', 'Secretary', 'D', '102', 'Aakash Enclave'),
(2, 'Nikhil Icreamwala', 'nikicecreamwala@gmail.com', '$2b$10$UqJYr/ilOhZniMxuvkHP8OoGDojOql77WGfi5y7zwiTu/nvuDxPLy', 'Secretary', 'D', '201', 'Rameshwaram Green'),
(3, 'Manan Kansara', 'manan2929@gmail.com', '$2b$10$u46.9YVZWrRQc8QdcuvOLeBSI4GmgUhvavvCC7IEyfuCRKrQ5xeM.', 'Secretary', 'C', '101', 'Aakash Era'),
(4, 'Krisha Damwala', 'krishadamwala@gmail.com', '$2b$10$IjEH7CKqsGJ3.//H.acr0OR8xtsuB1roT/EvCmvR1tTlkFrsrkWda', 'Secretary', 'D', '402', 'Aakash Empire'),
(5, 'Uday Parekh', 'udayparekh@gmail.com', '$2b$10$HtcYak/RJANS07gw9LCf/OM4iqKNattwlrpPnSWAJnhVLoIH9a.Ge', 'Secretary', 'C', '204', 'Aakash Empire');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `uname` varchar(255) NOT NULL,
  `uemail` varchar(255) NOT NULL,
  `upassword` varchar(255) NOT NULL,
  `role` enum('User') NOT NULL DEFAULT 'User',
  `wing` varchar(25) DEFAULT NULL,
  `house_no` varchar(25) NOT NULL,
  `building_name` varchar(50) NOT NULL,
  `secretary_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `uname`, `uemail`, `upassword`, `role`, `wing`, `house_no`, `building_name`, `secretary_id`) VALUES
(1, 'Kush Parekh', 'kushparekh@gmail.com', '$2b$10$LtM/tt0BddB60EDqpYGTt.cnOtzJlFOxqy5AVllpgY6xCHqC6SU32', 'User', 'A', '103', 'aakash enclave', 1),
(2, 'Mallika Parekh', 'mallika1811@gmail.com', '$2b$10$Biv91pXDGR7Jba8KgA2EIuEGvD4Ggm6NYzODQxqatenDwkz55QllS', 'User', 'D', '102', 'aakash enclave', 1),
(3, 'Manish Parekh', 'manishparekh1975@gmail.com', '$2b$10$CqBX8P7oZbHZuVArbP/YBuYQYPh29t3n5YPNq2niXkuJ8I8pRTx/G', 'User', 'C', '204', 'aakash era', 3),
(4, 'Neel Udhnawala', 'neel2990@gmail.com', '$2b$10$fgDgHTgrFWIZq.2Ji0l82eFyJ8EC4Mrl7KXj/DQY/RUNsY3s3YUv.', 'User', 'A', '105', 'rameshwaram green', 2),
(5, 'Naman Patel', 'namanpatel@gmail.com', '$2b$10$/aS7cgAX/4k.NAka9Lt29OoP.N8Aq4nD6LDAWOtti205qiBZgKRdK', 'User', 'A', '204', 'rameshwaram green', 2),
(6, 'Urvi Parekh', 'urviparekh@gmail.com', '$2b$10$jv2utDShindlwyVYFC6lk.ZDv9P0ztGRMErabzGRdMSdVycqSZ2bq', 'User', 'C', '204', 'aakash empire', 5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `issue_id` (`issue_id`),
  ADD KEY `giver_id` (`giver_id`);

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`issue_id`);

--
-- Indexes for table `issue_logs`
--
ALTER TABLE `issue_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `issue_id` (`issue_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `fk_notifications_user` (`user_id`);

--
-- Indexes for table `secretary`
--
ALTER TABLE `secretary`
  ADD PRIMARY KEY (`secretary_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `fk_user_secretary` (`secretary_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `issue_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `issue_logs`
--
ALTER TABLE `issue_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `secretary`
--
ALTER TABLE `secretary`
  MODIFY `secretary_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`issue_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_feedback_giver` FOREIGN KEY (`giver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `issue_logs`
--
ALTER TABLE `issue_logs`
  ADD CONSTRAINT `issue_logs_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`issue_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_secretary` FOREIGN KEY (`secretary_id`) REFERENCES `secretary` (`secretary_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
