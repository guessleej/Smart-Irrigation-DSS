CREATE TABLE `data_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(100) NOT NULL,
	`syncType` varchar(50) NOT NULL,
	`status` enum('pending','running','success','failed') DEFAULT 'pending',
	`recordsProcessed` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `irrigation_districts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`name` varchar(100) NOT NULL,
	`managementOffice` varchar(100),
	`county` varchar(50),
	`area` decimal(12,2),
	`irrigatedArea` decimal(12,2),
	`mainCrops` text,
	`waterSources` text,
	`geoJson` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `irrigation_districts_id` PRIMARY KEY(`id`),
	CONSTRAINT `irrigation_districts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `irrigation_facilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`districtId` int NOT NULL,
	`facilityType` enum('canal','pond','well','weir','pump_station','other') NOT NULL,
	`code` varchar(64),
	`name` varchar(100) NOT NULL,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`capacity` decimal(12,2),
	`status` enum('active','inactive','maintenance') DEFAULT 'active',
	`properties` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `irrigation_facilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rainfall_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` int NOT NULL,
	`recordTime` timestamp NOT NULL,
	`hourlyRainfall` decimal(8,2),
	`dailyRainfall` decimal(8,2),
	`accumulatedRainfall` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rainfall_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rainfall_stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` varchar(32) NOT NULL,
	`name` varchar(100) NOT NULL,
	`county` varchar(50),
	`township` varchar(50),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`altitude` decimal(8,2),
	`basin` varchar(100),
	`source` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rainfall_stations_id` PRIMARY KEY(`id`),
	CONSTRAINT `rainfall_stations_stationId_unique` UNIQUE(`stationId`)
);
--> statement-breakpoint
CREATE TABLE `reservoir_water_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservoirId` int NOT NULL,
	`recordTime` timestamp NOT NULL,
	`waterLevel` decimal(8,2),
	`effectiveStorage` decimal(12,2),
	`storagePercentage` decimal(5,2),
	`inflow` decimal(10,2),
	`outflow` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservoir_water_levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservoirs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` varchar(32) NOT NULL,
	`name` varchar(100) NOT NULL,
	`basin` varchar(100),
	`county` varchar(50),
	`township` varchar(50),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`effectiveCapacity` decimal(12,2),
	`deadStorageCapacity` decimal(12,2),
	`fullWaterLevel` decimal(8,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservoirs_id` PRIMARY KEY(`id`),
	CONSTRAINT `reservoirs_stationId_unique` UNIQUE(`stationId`)
);
--> statement-breakpoint
CREATE TABLE `risk_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`districtId` int NOT NULL,
	`assessmentDate` timestamp NOT NULL,
	`riskLevel` enum('low','moderate','high','critical') NOT NULL,
	`riskScore` decimal(5,2),
	`waterSupply` decimal(12,2),
	`waterDemand` decimal(12,2),
	`supplyDemandRatio` decimal(5,2),
	`rainfallForecast` decimal(8,2),
	`reservoirStorage` decimal(5,2),
	`factors` json,
	`recommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `risk_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `water_allocation_simulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`districtId` int NOT NULL,
	`simulationDate` timestamp NOT NULL,
	`scenarioName` varchar(100),
	`totalWaterAvailable` decimal(12,2),
	`totalWaterDemand` decimal(12,2),
	`allocationPlan` json,
	`simulationParams` json,
	`results` json,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `water_allocation_simulations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `water_level_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` int NOT NULL,
	`recordTime` timestamp NOT NULL,
	`waterLevel` decimal(8,2),
	`flowRate` decimal(10,2),
	`warningStatus` enum('normal','alert','warning','danger') DEFAULT 'normal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `water_level_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `water_level_stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` varchar(32) NOT NULL,
	`name` varchar(100) NOT NULL,
	`river` varchar(100),
	`basin` varchar(100),
	`county` varchar(50),
	`township` varchar(50),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`warningLevel1` decimal(8,2),
	`warningLevel2` decimal(8,2),
	`warningLevel3` decimal(8,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `water_level_stations_id` PRIMARY KEY(`id`),
	CONSTRAINT `water_level_stations_stationId_unique` UNIQUE(`stationId`)
);
