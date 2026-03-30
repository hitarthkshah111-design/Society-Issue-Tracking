-- Recreate missing tables only (no FK constraints yet)
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `issues` (
  `issue_id` int(11) NOT NULL AUTO_INCREMENT,
  `reporter_type` enum('User','Secretary','Admin') NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `category` enum('Personal','General') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `building_name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Pending','In Progress','Resolved','Closed') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=5;

INSERT IGNORE INTO `issues` (`issue_id`, `reporter_type`, `reporter_id`, `category`, `title`, `description`, `building_name`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 'User', 1, 'General', 'abc', 'akjbsdkjbdsv', 'Aakash Enclave', '[]', 'Pending', '2025-08-26 07:36:02', '2025-09-19 00:18:01'),
(3, 'User', 2, 'Personal', 'Pipe break', 'Pipe break call a plumber', 'Aakash Enclave', '1758114249170.jpg', 'Resolved', '2025-09-17 13:04:09', '2025-09-19 10:56:44'),
(4, 'User', 1, 'General', 'Car parking', 'Car not park as decided', 'Aakash Enclave', '1758114459519.jpg', 'In Progress', '2025-09-17 13:07:39', '2025-09-19 00:20:05');

CREATE TABLE IF NOT EXISTS `feedback` (
  `feedback_id` int(11) NOT NULL AUTO_INCREMENT,
  `issue_id` int(11) NOT NULL,
  `giver_id` int(11) NOT NULL,
  `giver_role` enum('User') NOT NULL DEFAULT 'User',
  `feedback_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`feedback_id`),
  KEY `issue_id` (`issue_id`),
  KEY `giver_id` (`giver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=5;

INSERT IGNORE INTO `feedback` (`feedback_id`, `issue_id`, `giver_id`, `giver_role`, `feedback_text`, `created_at`) VALUES
(1, 4, 1, 'User', 'Fix this problem', '2025-09-18 12:30:21'),
(2, 1, 1, 'User', 'fix this problem', '2025-09-18 12:58:20'),
(3, 4, 1, 'User', 'fix this problem', '2025-09-18 12:59:10'),
(4, 4, 1, 'User', 'fix this problem', '2025-09-18 13:01:44');

CREATE TABLE IF NOT EXISTS `issue_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `issue_id` int(11) NOT NULL,
  `updated_by_type` enum('User','Secretary') NOT NULL,
  `updated_by_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `issue_id` (`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=10;

INSERT IGNORE INTO `issue_logs` (`log_id`, `issue_id`, `updated_by_type`, `updated_by_id`, `action`, `old_value`, `new_value`, `created_at`) VALUES
(1, 1, 'User', 1, 'CREATE:title', NULL, 'abc', '2025-08-26 07:36:02'),
(8, 4, 'Secretary', 1, 'UPDATE:status', 'Pending', 'In Progress', '2025-09-18 18:50:05'),
(9, 3, 'Secretary', 1, 'UPDATE:status', 'Pending', 'Resolved', '2025-09-19 05:26:44');

SET FOREIGN_KEY_CHECKS=1;
