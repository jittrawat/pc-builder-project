-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 23, 2025 at 04:00 PM
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
-- Database: `pc_builder`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_import_cpu_from_staging` ()   BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_id BIGINT; DECLARE v_did BIGINT;
  DECLARE v_n  VARCHAR(255); DECLARE v_p DECIMAL(12,2);
  DECLARE v_socket VARCHAR(50); DECLARE v_chipset VARCHAR(50);
  DECLARE v_pwr INT; DECLARE v_tdp INT; DECLARE v_obj LONGTEXT;

  DECLARE cur CURSOR FOR
    SELECT id, Device_Name, price, Socket, Chipset, Power_usage, TDP, raw_obj
    FROM staging_cpu WHERE Device_ID IS NULL;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_id, v_n, v_p, v_socket, v_chipset, v_pwr, v_tdp, v_obj;
    IF done = 1 THEN LEAVE read_loop; END IF;

    INSERT INTO device(Device_Name, price, image_url)
    VALUES (v_n, v_p, NULL);
    SET v_did = LAST_INSERT_ID();

    INSERT INTO cpu(Device_ID, Socket, Chipset, Power_usage, TDP, Details)
    VALUES (v_did, v_socket, v_chipset, v_pwr, v_tdp, v_obj);

    UPDATE staging_cpu SET Device_ID = v_did WHERE id = v_id;
  END LOOP;
  CLOSE cur;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_stage_cpu_from_json` (IN `p_json` LONGTEXT)   BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE n INT DEFAULT JSON_LENGTH(p_json);

  WHILE i < n DO
    SET @name = JSON_UNQUOTE(JSON_EXTRACT(p_json, CONCAT('$[',i,'].name')));
    SET @price_raw = JSON_EXTRACT(p_json, CONCAT('$[',i,'].price'));
    SET @socket = JSON_UNQUOTE(JSON_EXTRACT(p_json, CONCAT('$[',i,'].socket')));
    SET @chip   = JSON_UNQUOTE(JSON_EXTRACT(p_json, CONCAT('$[',i,'].chipset')));
    SET @pwr    = JSON_EXTRACT(p_json, CONCAT('$[',i,'].power_usage'));
    SET @tdp    = JSON_EXTRACT(p_json, CONCAT('$[',i,'].tdp'));
    /* เก็บอ็อบเจ็กต์ทั้งก้อน (ข้อความ JSON) */
    SET @obj    = JSON_EXTRACT(p_json, CONCAT('$[',i,']'));

    INSERT INTO staging_cpu(Device_Name, price, Socket, Chipset, Power_usage, TDP, raw_obj)
    VALUES (
      @name,
      CAST(@price_raw AS DECIMAL(12,2)),
      NULLIF(@socket, ''),
      NULLIF(@chip, ''),
      NULLIF(@pwr, 0),
      NULLIF(@tdp, 0),
      @obj
    );

    SET i = i + 1;
  END WHILE;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cooler`
--

CREATE TABLE `cooler` (
  `cooler_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `Socket_Sup` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cooler`
--

INSERT INTO `cooler` (`cooler_ID`, `Device_ID`, `Socket_Sup`, `details`) VALUES
(4631, 47230, 'LGA1700,LGA1200,LGA1151,LGA1150,LGA1155,LGA1156,LGA1851,AM4,AM5', 'Brands	ID-COOLING Model	SE-214-XT PLUS CPU Socket	 Intel® LGA-1700 Intel® LGA-1200 Intel® LGA-1151 Intel® LGA-1150 Intel® LGA-1155 Intel® LGA-1156 AMD AM4 AMD AM5 Intel® LGA-1851'),
(4632, 47231, 'LGA1700,LGA1200,LGA1151,LGA1150,LGA1155,LGA1156,LGA1851,AM4,AM5', 'Brands	ID-COOLING\nModel	FROZN A410\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nIntel® LGA-1151\nIntel® LGA-1150\nIntel® LGA-1155\nIntel® LGA-1156\nAMD AM4\nAMD AM5\nIntel® LGA-1851\nDimensions	73 x 120 x 152 mm\nHeatpipes Quantity and Material	4 x Ф6mm Heatpipe + Direct Touch + Aluminum Fin\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	500±200~2000 RPM±10%\nFan Airflow	78.25 CFM\nFan Pressure	2.68mmH2O\nFan MTTF	N/A\nFan Noise Level	29.85dB(A) Max.\nFan Power Connector	4-Pin (PWM)\nTDP	220W\nCooler Type	Air Cooler'),
(4633, 47232, 'LGA1700,LGA1200,LGA1151,LGA1150,LGA1155,LGA1851,AM4,AM5', 'Brands	DEEPCOOL\nModel	AK400\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nIntel® LGA-1151\nIntel® LGA-1150\nIntel® LGA-1155\nAMD AM4\nAMD AM5\nIntel® LGA-1851\nDimensions	127 x 97 x 155 mm\nHeatpipes Quantity and Material	Ø6 mm×4 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	500~1850 RPM±10%\nFan Airflow	66.47 CFM\nFan Pressure	2.04 mmAq\nFan Noise Level	29 dB(A)\nFan Power Connector	4-Pin (PWM)\nTDP	220W\nCooler Type	Air Cooler'),
(4634, 47233, 'LGA1700,LGA1200,LGA1151,LGA1150,LGA1155,LGA1851,AM4,AM5', 'Brands	DEEPCOOL\nModel	AK400\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nIntel® LGA-1151\nIntel® LGA-1150\nIntel® LGA-1155\nAMD AM4\nAMD AM5\nIntel® LGA-1851\nDimensions	127 x 97 x 155 mm\nHeatpipes Quantity and Material	Ø6 mm×4 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	500~1850 RPM±10%\nFan Airflow	66.47 CFM\nFan Pressure	2.04 mmAq\nFan MTTF	N/A\nFan Noise Level	29 dB(A)\nFan Power Connector	4-Pin (PWM)\nTDP	220W\nCooler Type	Air Cooler'),
(4635, 47234, 'LGA1700,LGA1851,AM4,AM5', 'Brands	MSI\nModel	COREFROZR AA13\nCPU Socket	\nIntel® LGA-1700\nAMD AM4\nAMD AM5\nIntel® LGA-1851\nDimensions	94.5 x 121 x 152 mm\nHeatpipes Quantity and Material	Ø6 mm×4 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	510~2070 RPM\nFan Airflow	62.6 CFM\nFan Pressure	2.36 mmH2O\nFan MTTF	40,000 Hours\nFan Noise Level	\n30.11 dBA\n34.1 dBA (Maximum)\nFan Power Connector	4-Pin (PWM), 3-Pin (ARGB)\nLED Lighting	ARGB\nCooler Type	Air Cooler'),
(4636, 47235, 'LGA1700,LGA1851,AM4,AM5', 'Brands	MSI\nModel	COREFROZR AA13\nCPU Socket	\nIntel® LGA-1700\nAMD AM4\nAMD AM5\nIntel® LGA-1851\nDimensions	94.5 x 121 x 152 mm\nHeatpipes Quantity and Material	Ø6 mm×4 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	510~2070 RPM\nFan Airflow	62.6 CFM\nFan Pressure	2.36 mmH2O\nFan MTTF	40,000 Hours\nFan Noise Level	\n30.11 dBA\n34.1 dBA (Maximum)\nFan Power Connector	4-Pin (PWM), 3-Pin (ARGB)\nLED Lighting	ARGB\nCooler Type	Air Cooler'),
(4637, 47236, 'LGA1700,LGA1200,LGA115,LGA1851,AM4,AM5', 'Brands	THERMALTAKE\nModel	ASSASSIN X 120 R\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nAMD AM4\nAMD AM5\nIntel® LGA-115X\nIntel® LGA-1851\nDimensions	46 x 120 x 151 mm\nHeatpipes Quantity and Material	Ø6 mm×4 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	2000 RPM±10%\nFan Airflow	70.84 CFM\nFan Pressure	2.63 mmH2O (Max)\nFan Noise Level	29.8 dBA\nFan Power Connector	4-Pin (PWM)\nLED Lighting	ARGB\nCooler Type	Air Cooler'),
(4638, 47237, 'LGA1700,LGA1200,LGA115,LGA1851,AM4,AM5', 'Brands	THERMALTAKE\nModel	ASSASSIN X 120 R\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nAMD AM4\nAMD AM5\nIntel® LGA-115X\nIntel® LGA-1851\nDimensions	46 x 120 x 151 mm\nHeatpipes Quantity and Material	Ø6 mm×4 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	2000 RPM±10%\nFan Airflow	70.84 CFM\nFan Pressure	2.63 mmH2O (Max)\nFan Noise Level	29.8 dBA\nFan Power Connector	4-Pin (PWM)\nLED Lighting	ARGB\nCooler Type	Air Cooler'),
(4639, 47238, 'LGA1700,LGA1200,LGA1151,LGA1150,LGA1155,LGA1851,AM4,AM5', 'Brands	DEEPCOOL\nModel	AK400 DIGITAL PRO\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nIntel® LGA-1151\nIntel® LGA-1150\nIntel® LGA-1155\nAMD AM4\nAMD AM5\nIntel® LGA-1851\nDimensions	97 x 126 x 159 mm\nHeatpipes Quantity and Material	Ø6 mm×4 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	500~1750 RPM±10%\nFan Airflow	60.89 CFM\nFan Pressure	2.91 mmAq\nFan Noise Level	≤25 dB(A)\nFan Power Connector	4-Pin (PWM)\nLED Lighting	Addressable RGB LED\nTDP	220W\nCooler Type	Air Cooler'),
(4640, 47239, 'LGA1700,LGA1200,LGA1151,LGA1150,LGA1155,LGA1851,AM4,AM5', 'Brands	DEEPCOOL\nModel	AK400 DIGITAL PRO\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nIntel® LGA-1151\nIntel® LGA-1150\nIntel® LGA-1155\nAMD AM4\nAMD AM5\nIntel® LGA-1851\nDimensions	97 x 126 x 159 mm\nHeatpipes Quantity and Material	Ø6 mm×4 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	500~1750 RPM±10%\nFan Airflow	60.89 CFM\nFan Pressure	2.91 mmAq\nFan MTTF	N/A\nFan Noise Level	≤25 dB(A)\nFan Power Connector	4-Pin (PWM)\nLED Lighting	Addressable RGB LED\nTDP	220W\nCooler Type	Air Cooler'),
(4641, 47240, 'LGA1700,LGA1200,LGA2066,LGA1151,LGA1150,LGA1155,LGA2011,LGA1851,AM4,AM5', 'Brands	BE QUIET\nModel	Pure Rock 2 FX\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nIntel® LGA-2066\nIntel® LGA-1151\nIntel® LGA-1150\nIntel® LGA-1155\nAMD AM4\nIntel® LGA-2011-3\nAMD AM5\nIntel® LGA-1851\nDimensions	121 x 87 x 155 mm\nHeatpipes Quantity and Material	4 x Ф6mm Heat Pipes, Aluminum Copper\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	2000 RPM\nFan Airflow	42.6 CFM\nFan Pressure	1.64 mmH2O\nFan MTTF	60,000 Hours\nFan Noise Level	24.4dB(A)\nFan Power Connector	4-Pin (PWM)\nLED Lighting	ARGB\nCooler Type	Air Cooler'),
(4642, 47241, 'LGA1700,LGA1200,LGA2066,LGA2011,LGA1151,LGA1150,LGA1155,LGA1851,AM4,AM5', 'Brands	DEEPCOOL\nModel	AK500\nCPU Socket	\nIntel® LGA-1700\nIntel® LGA-1200\nIntel® LGA-2066\nIntel® LGA-2011-V3\nIntel® LGA-2011\nIntel® LGA-1151\nIntel® LGA-1150\nIntel® LGA-1155\nAMD AM4\nAMD AM5\nIntel® LGA-1851\nDimensions	117 x 127 x 158 mm\nHeatpipes Quantity and Material	Ø6 mm×5 pcs\nFan Dimensions	120 x 120 x 25 mm\nFan Quantity	1 PCS\nFan Speed	500~1850 RPM±10%\nFan Airflow	68.99 CFM\nFan Pressure	2.19 mmAq\nFan MTTF	N/A\nFan Noise Level	31.5 dB(A)\nFan Power Connector	4-Pin (PWM)\nTDP	240W\nCooler Type	Air Cooler');

-- --------------------------------------------------------

--
-- Table structure for table `cpu`
--

CREATE TABLE `cpu` (
  `CPU_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `socket` varchar(50) DEFAULT NULL,
  `power_usage` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cpu`
--

INSERT INTO `cpu` (`CPU_ID`, `Device_ID`, `socket`, `power_usage`, `details`) VALUES
(1945, 47125, 'AM5', 120, 'Brand: AMD Series: 9000 Series Processor Number: Ryzen 7 9800X3D Socket Type: AM5 Cores / Threads: 8 Cores / 16 Threads Base Frequency: 4.7 GHz Max Turbo Frequency: 5.2 GHz L2 Cache: 8 MB L3 Cache: 96 MB Graphics Models: AMD Radeon Graphics CPU Cooler: No Default TDP: 120W'),
(1946, 47126, 'AM5', 120, 'Brand: AMD  Series: AMD Ryzen 7000 Series  Socket Type: AM5  Cores/Threads: 8 Cores / 16 Threads  Base Frequency: 4.2 GHz  Max Turbo Frequency: 5.0 GHz  L2 Cache: 8 MB  L3 Cache: 96 MB  Graphics Models: AMD Radeon™ Graphics  64Bit Support: Yes  CPU Cooler: No  Maximum Turbo Power: 120 Watt'),
(1947, 47127, 'AM5', 105, 'Model: Ryzen 5  Brand: AMD  Socket: AM5 (7000 Series – Raphael)  CPU Core / Thread: 6 Cores / 12 Threads  Base Frequency: 4.7 GHz  Max Turbo Frequency: 5.3 GHz  Integrated Graphics: AMD Radeon Graphics  Architecture: TSMC 5nm FinFET  Cache L2: 6 MB  Cache L3: 32 MB  TDP: 105 W'),
(1948, 47128, 'AM5', 65, 'Brand: AMD  Series: 9000 Series  Processor Number: Ryzen 5 9600X  Socket Type: AM5  Cores/Threads: 6 Cores / 12 Threads  Base Frequency: 3.9 GHz  Max Turbo Frequency: 5.4 GHz  L2 Cache: 6 MB  L3 Cache: 32 MB  Graphics Models: AMD Radeon™ Graphics  CPU Cooler: No  Default TDP: 65W'),
(1949, 47129, 'AM5', 105, 'Brand: AMD  Series: 7000 Series  Processor Number: Ryzen 7 7700X  Socket Type: AM5  Cores/Threads: 8 Cores / 16 Threads  Base Frequency: 4.5 GHz  Max Turbo Frequency: 5.4 GHz  L2 Cache: 8 MB  L3 Cache: 32 MB  64Bit Support: N/A  Graphics Model: AMD Radeon™ Graphics  CPU Cooler: No  Default TDP: 105W'),
(1950, 47130, 'AM5', 170, 'Brand: AMD  Series: 9000 Series  Processor Number: Ryzen 9 9950X3D  Socket Type: AM5  Cores/Threads: 16 Cores / 32 Threads  Base Frequency: 4.3 GHz  Max Turbo Frequency: 5.7 GHz  L2 Cache: 16 MB  L3 Cache: 64 MB  Graphics Models: AMD Radeon Graphics  CPU Cooler: No  Default TDP: 170W'),
(1951, 47131, 'AM4', 65, 'Brand: AMD  Series: 5000 Series  Processor Number: Ryzen 5 5500  Socket Type: AM4  Cores/Threads: 6 Cores / 12 Threads  Base Frequency: 3.6 GHz  Max Turbo Frequency: 4.2 GHz  L2 Cache: 3 MB  L3 Cache: 16 MB  Graphics Models: Discrete Graphics Card Required  64Bit Support: N/A  CPU Cooler: Yes  Default TDP: 65W'),
(1952, 47132, 'AM5', 65, 'Brand: AMD  Series: 9000 Series  Processor Number: Ryzen 7 9700X  Socket Type: AM5  Cores/Threads: 8 Cores / 16 Threads  Base Frequency: 3.8 GHz  Max Turbo Frequency: 5.5 GHz  L2 Cache: 8 MB  L3 Cache: 32 MB  Graphics Models: AMD Radeon™ Graphics  CPU Cooler: No  Default TDP: 65W'),
(1953, 47133, 'AM4', 65, 'Model: Ryzen 5  Brand: AMD  Socket: AM4 (5000 Series – Vermeer / Cezanne)  CPU Core / Thread: 6 Cores / 12 Threads  Base Frequency: 3.7 GHz  Max Turbo Frequency: 4.6 GHz  Integrated Graphics: No  Architecture: TSMC 7nm FinFET  Cache L2: 3 MB  Cache L3: 32 MB  TDP: 65 W'),
(1954, 47134, 'AM4', 65, 'Model: Ryzen 5  Brand: AMD  Socket: AM4 (5000 Series – Vermeer / Cezanne)  CPU Core / Thread: 6 Cores / 12 Threads  Base Frequency: 3.5 GHz  Max Turbo Frequency: 4.4 GHz  Integrated Graphics: No  Architecture: 7 nm  Cache L2: 3 MB  Cache L3: 32 MB  TDP: 65 W'),
(1955, 47135, 'AM4', 105, 'Model: Ryzen 7  Brand: AMD  Socket: AM4 (5000 Series – Vermeer / Cezanne)  CPU Core / Thread: 8 Cores / 16 Threads  Base Frequency: 3.8 GHz  Max Turbo Frequency: 4.7 GHz  Integrated Graphics: No  Architecture: TSMC 7nm FinFET  Cache L2: 4 MB  Cache L3: 32 MB  TDP: 105 W'),
(1956, 47136, 'LGA1700', 125, 'Brand: Intel  Series: 14th Gen Intel® Core™ i7 Processor  Processor Number: Core i7-14700K  Socket Type: LGA 1700  Cores/Threads: 20 (8P + 12E) Cores / 28 Threads  Base Frequency: 3.4 GHz  Max Turbo Frequency: 5.4 GHz  L2 Cache: 28 MB  L3 Cache: 33 MB  Graphics Models: Intel® UHD Graphics 770  64Bit Support: Yes  CPU Cooler: Yes  Default TDP: 125W  Maximum Turbo Power: 253W'),
(1957, 47137, 'LGA1700', 125, 'Model: Core i9  Brand: Intel  Socket: LGA 1700 (14th Gen – Raptor Lake Refresh)  Architecture: Intel 7  Cache L2: 32 MB  Cache L3: 36 MB  TDP: 125 W'),
(1958, 47138, 'LGA1700', 117, 'Brand: Intel  Series: 12th Gen Intel® Core™ i5 Processor  Processor Number: Core i5-12400F  Socket Type: LGA 1700  Cores/Threads: 6 (6P) Cores / 12 Threads  Base Frequency: 2.5 GHz  Max Turbo Frequency: 4.4 GHz  L2 Cache: 7.5 MB  L3 Cache: 18 MB  Graphics Models: Discrete Graphics Card Required  64Bit Support: N/A  CPU Cooler: Yes  Default TDP: 65W  Maximum Turbo Power: 117W'),
(1959, 47139, 'AM4', 65, 'Model: Ryzen 5  Brand: AMD  Socket: AM4 (3000 Series – Matisse)  CPU Core / Thread: 6 Cores / 12 Threads  Base Frequency: 3.6 GHz  Max Turbo Frequency: 4.2 GHz  Integrated Graphics: No  Architecture: TSMC 7nm FinFET  Cache L2: 3 MB  Cache L3: 32 MB  TDP: 65 W'),
(1960, 47140, 'AM5', 105, 'Model: Ryzen 5  Brand: AMD  Socket: AM5 (7000 Series – Raphael)  CPU Core / Thread: 6 Cores / 12 Threads  Base Frequency: 4.7 GHz  Max Turbo Frequency: 5.3 GHz  Integrated Graphics: AMD Radeon Graphics  Architecture: TSMC 5nm FinFET  Cache L2: 6 MB  Cache L3: 32 MB  TDP: 105 W'),
(1961, 47141, 'AM4', 65, 'Model: Ryzen 7  Brand: AMD  Socket: AM4 (5000 Series – Vermeer / Cezanne)  CPU Core / Thread: 8 Cores / 16 Threads  Base Frequency: 3.4 GHz  Max Turbo Frequency: 4.6 GHz  Integrated Graphics: No  Architecture: 7 nm  Cache L2: 4 MB  Cache L3: 32 MB  TDP: 65 W'),
(1962, 47142, 'AM5', 170, 'Model: Ryzen 9  Brand: AMD  Socket: AM5 (7000 Series – Raphael)  CPU Core / Thread: 12 Cores / 24 Threads  Base Frequency: 4.7 GHz  Max Turbo Frequency: 5.6 GHz  Integrated Graphics: AMD Radeon Graphics  Architecture: TSMC 5nm FinFET  Cache L2: 12 MB  Cache L3: 64 MB  TDP: 170 W'),
(1963, 47143, 'AM5', 120, 'Model: Ryzen 9  Brand: AMD  Socket: AM5 (9000 Series – Granite Ridge)  CPU Core / Thread: 12 Cores / 24 Threads  Base Frequency: 4.4 GHz  Max Turbo Frequency: Up to 5.6 GHz  Integrated Graphics: AMD Radeon Graphics  Graphics Core Count: 2  Graphics Frequency: 2200 MHz  USB Type-C DisplayPort Alternate Mode: Yes  Architecture: TSMC 4nm FinFET  Cache L2: 12 MB  Cache L3: 64 MB  TDP: 120 W'),
(1964, 47254, 'AM4', 65, 'Brand AMD Series Ryzen 7 Model Ryzen 7 3700X Specification Socket AMD AM4 Chipset Support AMD A320, AMD B350, AMD B450, AMD X370, AMD X470, AMD X570 # of Cores 8 # of Threads 16 Base Clock 3.60 GHz Boost Clock 4.40 GHz L2 Cache 4MB L3 Cache 32MB Integrated Graphics None Technology 7 nm TDP 65 W'),
(1965, 47262, 'LGA1700', 65, 'Brand	INTEL Series	14th Gen Intel® Core™ i5 Processor Processor Number	CORE i5 -14400F Socket Type	LGA 1700 Cores/Threads	10 (6P+4E) Cores / 16 Threads Base Frequency	2.5 GHz Max Turbo Frequency	4.7 GHz L2 Cache	9.5 MB L3 Cache	20 MB 64Bit Support	N/A CPU Cooler	Yes Default TDP	65W Maximum Turbo Power	148W');

-- --------------------------------------------------------

--
-- Table structure for table `device`
--

CREATE TABLE `device` (
  `Device_ID` int(11) NOT NULL,
  `Device_Name` varchar(50) NOT NULL,
  `price` int(11) NOT NULL,
  `image_url` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device`
--

INSERT INTO `device` (`Device_ID`, `Device_Name`, `price`, `image_url`) VALUES
(47125, 'Ryzen 7 9800X3D', 16790, '/uploads/file-1759686913320-118988080.jpg'),
(47126, 'CPU (ซีพียู) AMD AM5 RYZEN 7 7800X3D 4.2 GHz 8C 16', 13790, '/uploads/file-1759687131493-476490285.jpg'),
(47127, 'CPU (ซีพียู) AMD RYZEN 5 7600X 4.7 GHz (SOCKET AM5', 6990, '/uploads/file-1759687385283-471984520.jpg'),
(47128, 'CPU (ซีพียู) AMD AM5 RYZEN 5 9600X 3.9GHz 6C 12T', 8990, '/uploads/file-1759687486199-453407700.jpg'),
(47129, 'CPU (ซีพียู) AMD AM5 RYZEN 7 7700X 4.5 GHz 8C 16T', 9990, '/uploads/file-1759687601114-621630976.jpg'),
(47130, 'CPU (ซีพียู) AMD AM5 RYZEN 9 9950X3D 4.3GHz 16C 32', 26990, '/uploads/file-1759687750047-50766695.jpg'),
(47131, 'CPU (ซีพียู) AMD AM4 RYZEN 5 5500 3.6GHz 6C 12T', 2490, '/uploads/file-1759687918374-124921149.jpg'),
(47132, 'CPU (ซีพียู) AMD AM5 RYZEN 7 9700X 3.8GHz 8C 16T', 11990, '/uploads/file-1759688016939-387954168.jpg'),
(47133, 'CPU (ซีพียู) AMD RYZEN 5 5600X 3.7 GHz', 4190, 'http://localhost:5000/uploads/file-1759688195547-719691130.jpg'),
(47134, 'CPU (ซีพียู) AMD RYZEN 5 5600 3.5 GHz', 2990, '/uploads/file-1759688323041-618895444.jpg'),
(47135, 'CPU (ซีพียู) AMD RYZEN 7 5800X 3.8 GHz', 7800, '/uploads/file-1759688466582-346069753.jpg'),
(47136, 'CPU (ซีพียู) INTEL 1700 CORE I7-14700K 3.4GHz 20C ', 11590, '/uploads/file-1759688619174-186660994.jpg'),
(47137, 'CPU (ซีพียู) INTEL CORE I9-14900K - 24C 32T', 16900, '/uploads/file-1759688948681-502485510.jpg'),
(47138, 'CPU (ซีพียู) INTEL 1700 CORE I5-12400F 2.5GHz 6C 1', 3690, '/uploads/file-1759689047300-614007258.jpg'),
(47139, 'CPU (ซีพียู) AMD RYZEN 5 3600 3.6 GHz', 4490, '/uploads/file-1759689262648-915488239.jpg'),
(47140, 'CPU (ซีพียู) AMD RYZEN 5 7600X 4.7 GHz', 6900, '/uploads/file-1759689415009-198934230.jpg'),
(47141, 'CPU (ซีพียู) AMD RYZEN 7 5700X 3.4 GHz', 6290, '/uploads/file-1759689552917-915793562.jpg'),
(47142, 'CPU (ซีพียู) AMD RYZEN 9 7900X 4.7 GHz', 11990, '/uploads/file-1759689652540-96175998.jpg'),
(47143, 'CPU (ซีพียู) AMD RYZEN 9 9900X - 12C 24T 4.4-5.6GH', 14990, '/uploads/file-1759689810631-798799425.jpg'),
(47144, 'MAINBOARD (เมนบอร์ด) ASUS PRIME B650-PLUS', 5990, 'http://localhost:5000/uploads/file-1759690353844-851748712.jpg'),
(47145, 'MAINBOARD (เมนบอร์ด) MSI B650 GAMING PLUS WIFI', 5990, 'http://localhost:5000/uploads/file-1759690763157-657583802.jpg'),
(47146, 'เมนบอร์ด MSI MAG B650 TOMAHAWK WIFI', 9900, 'http://localhost:5000/uploads/file-1759690987024-782320348.jpg'),
(47147, 'MAINBOARD (เมนบอร์ด) GIGABYTE X870 AORUS ELITE WIF', 11990, 'http://localhost:5000/uploads/file-1759691204390-958434890.jpg'),
(47148, 'MAINBOARD (เมนบอร์ด) ASUS TUF GAMING B850-PLUS WIF', 10500, 'http://localhost:5000/uploads/file-1759691550958-247474791.jpg'),
(47149, 'MAINBOARD (เมนบอร์ด) ASROCK B650M PRO RS', 4190, 'http://localhost:5000/uploads/file-1759691774526-164085850.jpg'),
(47150, 'MAINBOARD (เมนบอร์ด) MSI MAG X870 TOMAHAWK WIFI', 9590, 'http://localhost:5000/uploads/file-1759691970611-179592040.jpg'),
(47151, 'Gigabyte A520M K V2', 1550, 'http://localhost:5000/uploads/file-1759692213977-495535907.jpg'),
(47152, 'MSI PRO B650-S WIFI', 6590, 'http://localhost:5000/uploads/file-1759692747860-692965613.jpg'),
(47153, 'MAINBOARD (เมนบอร์ด) GIGABYTE B550M K', 2490, 'http://localhost:5000/uploads/file-1759692800635-61932415.jpg'),
(47154, 'ASROCK B850I LIGHTNING WIFI', 8190, 'http://localhost:5000/uploads/file-1759695081789-65105519.jpg'),
(47155, 'MAINBOARD (เมนบอร์ด) MSI B760 GAMING PLUS WIFI', 4290, 'http://localhost:5000/uploads/file-1759695558331-138050703.jpg'),
(47156, 'MAINBOARD (เมนบอร์ด) MSI B550M PRO-VDH WIFI (DDR4)', 3090, 'http://localhost:5000/uploads/file-1759695786975-110323213.jpg'),
(47157, 'MAINBOARD (เมนบอร์ด) MSI PRO Z790-A MAX WIFI ', 8490, 'http://localhost:5000/uploads/file-1759696106575-960059141.jpg'),
(47158, 'ASUS TUF GAMING B650 PLUS WIFI', 6890, 'http://localhost:5000/uploads/file-1759696279861-648240602.jpg'),
(47159, 'MAINBOARD GIGABYTE X870 EAGLE WIFI7', 8990, 'http://localhost:5000/uploads/file-1759696497378-362732536.jpg'),
(47160, 'VGA (การ์ดแสดงผล) SAPPHIRE PULSE AMD RADEON RX 760', 7990, 'http://localhost:5000/uploads/file-1759696861631-167856077.jpg'),
(47161, 'VGA (การ์ดแสดงผล) MSI GEFORCE RTX 5080 16G SHADOW ', 42900, 'http://localhost:5000/uploads/file-1759697012067-427287114.jpg'),
(47162, 'VGA (การ์ดแสดงผล) GIGABYTE GEFORCE RTX 5080 WINDFO', 43900, 'http://localhost:5000/uploads/file-1759697128670-77146927.jpg'),
(47163, 'VGA (การ์ดแสดงผล) ASROCK AMD RADEON RX 9060 XT CHA', 11400, 'http://localhost:5000/uploads/file-1759697309697-258264331.jpg'),
(47164, 'VGA (การ์ดแสดงผล) GIGABYTE RTX3080 GAMING OC 10GB ', 23900, 'http://localhost:5000/uploads/file-1759697479463-139033848.jpg'),
(47165, 'การ์ดจอ ASRock RX 6600 XT Challenger D 8GB GDDR6 1', 15900, 'http://localhost:5000/uploads/file-1759697650897-484255326.jpg'),
(47166, 'VGA(การ์ดจอ) ASUS PRIME GEFORCE RTX 5070 OC EDITIO', 24000, 'http://localhost:5000/uploads/file-1759697967828-853428901.jpg'),
(47170, 'VGA (การ์ดแสดงผล) MSI GEFORCE RTX 4060 VENTUS 2X B', 11900, 'http://localhost:5000/uploads/file-1759702715314-927564982.jpg'),
(47171, 'VGA(การ์ดจอ) ASUS PRIME GEFORCE RTX 5070 OC EDITIO', 24000, '/uploads/file-1759702974463-168924671.jpg'),
(47172, 'VGA(การ์ดจอ) MSI GEFORCE RTX 5060 TI VENTUS 2X OC ', 16490, 'http://localhost:5000/uploads/file-1759703143369-80143431.jpg'),
(47173, 'VGA (การ์ดแสดงผล) MSI GEFORCE RTX 5070 12G SHADOW ', 21600, 'http://localhost:5000/uploads/file-1759703638241-85999747.jpg'),
(47174, 'VGA(การ์ดจอ) XFX SWIFT RADEON RX 9060 XT OC TRIPLE', 14490, 'http://localhost:5000/uploads/file-1759704036566-176764630.jpg'),
(47175, '16GB (8GBx2) DDR4 3200MHz RAM (หน่วยความจำ) CORSAI', 1690, 'http://localhost:5000/uploads/file-1759704434368-774354337.jpg'),
(47176, '32GB (16GBx2) DDR5 6000MHz RAM (หน่วยความจำ) G.SKI', 9990, '/uploads/file-1759704562237-651078499.jpg'),
(47177, '16GB (8GBx2) DDR4 3200MHz RAM (หน่วยความจำ) CORSAI', 1690, '/uploads/file-1759704867553-820850098.jpg'),
(47178, '32GB (16GBx2) DDR4 3200MHz RAM (หน่วยความจำ) CORSA', 3290, '/uploads/file-1759705069902-776620710.jpg'),
(47179, '64GB (32GBx2) DDR5 6400MHz RAM (หน่วยความจำ) G.SKI', 10990, '/uploads/file-1759705163476-591723384.jpg'),
(47180, '64GB (32GBx2) DDR5 5600MHz RAM (หน่วยความจำ) CORSA', 6990, '/uploads/file-1759705203905-298314108.jpg'),
(47181, '32GB (16GBx2) DDR4/3000 RAM PC (แรมพีซี) TEAM T-FO', 5990, '/uploads/file-1759705306011-851039769.jpg'),
(47182, '32GB (16GBx2) DDR5 6000MHz RAM (หน่วยความจำ) G.SKI', 4990, '/uploads/file-1759705368730-182053057.jpg'),
(47183, '32GB (16GBx2) DDR5 7200MHz RAM (หน่วยความจำ) PATRI', 5590, '/uploads/file-1759705516963-58068988.jpg'),
(47184, '32GB (16GBx2) DDR4 3200MHz RAM (หน่วยความจำ) CORSA', 3790, '/uploads/file-1759705601301-220846903.jpg'),
(47185, '16GB (16GBx1) DDR4 3200MHz RAM (หน่วยความจำ) SILIC', 1250, '/uploads/file-1759705662052-530101859.jpg'),
(47186, '32GB (16GBx2) DDR4 3200MHz RAM (หน่วยความจำ) CORSA', 3290, '/uploads/file-1759705833070-993982107.jpg'),
(47187, '32GB (16GBx2) DDR4 3200MHz RAM (หน่วยความจำ) KINGS', 3390, '/uploads/file-1759705906307-78279427.jpg'),
(47188, '64GB (32GBx2) DDR5 6000MHz RAM (หน่วยความจำ) G.SKI', 9490, '/uploads/file-1759706026409-49865592.jpg'),
(47189, '32GB (16GBx2) DDR4 3200MHz RAM (หน่วยความจำ) G.SKI', 2690, '/uploads/file-1759706093930-984519588.jpg'),
(47190, '32GB (16GBx2) DDR5 6000MHz RAM (หน่วยความจำ) G.SKI', 9990, '/uploads/file-1759706162008-596414138.jpg'),
(47191, '16GB (8GBx2) DDR4 3200MHz RAM (หน่วยความจำ) KINGST', 1890, '/uploads/file-1759706226812-835489832.jpg'),
(47192, '1 TB SSD (เอสเอสดี) SAMSUNG 990 PRO - PCIe 4x4/NVM', 3890, 'http://localhost:5000/uploads/file-1759706403425-179604814.jpg'),
(47193, '1TB SSD (เอสเอสดี) CRUCIAL P3 PLUS NVMe/PCIe4x4 M.', 2250, 'http://localhost:5000/uploads/file-1759706514869-24601220.jpg'),
(47196, 'M.2 (เอสเอสดี) KINGSTON NV3 1TB PCIe 4/NVMe M.2 22', 2090, '/uploads/file-1759706805641-784517332.jpg'),
(47197, '1 TB SSD (เอสเอสดี) SAMSUNG 990 EVO PLUS - PCIe 4x', 2990, '/uploads/file-1759706867325-824355104.jpg'),
(47198, '1 TB SSD (เอสเอสดี) WD BLACK SN850X WITHOUT HEATSI', 2990, '/uploads/file-1759706996200-640864938.jpg'),
(47199, '1 TB SSD (เอสเอสดี) SAMSUNG 9100 PRO - PCIe 5x4 NV', 5790, '/uploads/file-1759707122205-879346321.jpg'),
(47200, '1 TB SSD (เอสเอสดี) KLEVV CRAS C910 M.2 2280 NVMe ', 2100, '/uploads/file-1759707245079-983412712.jpg'),
(47201, '1 TB SSD (เอสเอสดี) WD BLACK SN770 - PCIe 4x4/NVMe', 2050, '/uploads/file-1759707350464-635085192.jpg'),
(47202, '1 TB SSD (เอสเอสดี) WD BLACK SN850X WITHOUT HEATSI', 2990, '/uploads/file-1759707458622-61808150.jpg'),
(47203, '1 TB SSD (เอสเอสดี) WD BLACK SN850X WITHOUT HEATSI', 2990, '/uploads/file-1759707592314-114782058.jpg'),
(47204, '500 GB SSD (เอสเอสดี) WD BLUE SN580 - PCIe 4x4/NVM', 1390, '/uploads/file-1759707678115-743596754.jpg'),
(47205, '1 TB SSD (เอสเอสดี) SAMSUNG 980 PRO - PCIe 4x4/NVM', 3290, '/uploads/file-1759707835148-112255901.jpg'),
(47206, '250 GB SSD (เอสเอสดี) SAMSUNG 970 EVO PLUS PCIe/NV', 1090, '/uploads/file-1759707901865-441619376.jpg'),
(47207, '512 GB SSD (เอสเอสดี) PATRIOT P300 - PCIe 3x4/NVMe', 1290, '/uploads/file-1759707998533-604310628.jpg'),
(47208, 'SSD M.2 PCIe (3.0) 1.TB TEAM MP33 PRO', 1650, '/uploads/file-1759708300577-346657836.jpg'),
(47209, '1 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) WD BLUE - ', 1590, '/uploads/file-1759744624417-389826447.jpg'),
(47210, '4 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) SEAGATE BA', 3320, '/uploads/file-1759744676052-242071880.jpg'),
(47211, '2 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) WD BLUE', 2140, 'http://localhost:5000/uploads/file-1759744722999-714195241.jpg'),
(47212, '4 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) WD BLUE - ', 3090, '/uploads/file-1759744757043-920875356.jpg'),
(47213, '8 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) SEAGATE BA', 6450, '/uploads/file-1759744805156-858817640.jpg'),
(47214, '8 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) WD BLACK -', 9590, '/uploads/file-1759744837026-269344265.jpg'),
(47215, '4 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) WD BLACK -', 7050, '/uploads/file-1759744861825-743992821.jpg'),
(47216, '6 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) WD BLACK -', 8090, '/uploads/file-1759744889664-265893190.jpg'),
(47217, '10 TB 3.5 INCH HDD (ฮาร์ดดิสก์ 3.5 นิ้ว) WD BLACK ', 11100, '/uploads/file-1759744916715-152268632.jpg'),
(47218, 'CASE (เคส) ASUS TUF GAMING GT501 (BLACK) (E-ATX)', 4290, '/uploads/file-1759745097762-78724916.jpg'),
(47219, 'CASE (เคส) MONTECH X2 MESH (BLACK) (ATX)', 1290, '/uploads/file-1759745256845-669940185.jpg'),
(47220, 'CASE (เคส) MONTECH X2 MESH (WHITE) (ATX)', 1350, '/uploads/file-1759745362303-406797152.jpg'),
(47221, 'CASE (เคส) DEEPCOOL MACUBE 110 (BLACK)', 1590, '/uploads/file-1759745850632-312265938.jpg'),
(47222, 'CASE (เคส) ASUS PRIME AP201 (WHITE)', 2490, '/uploads/file-1759745897080-308809329.jpg'),
(47223, 'CASE (เคส) AEROCOOL CS-107 (BLACK)', 990, '/uploads/file-1759745959310-519935909.jpg'),
(47224, 'CASE (เคส) MONTECH X3 GLASS (BLACK) (ATX)', 1750, '/uploads/file-1759746014279-318574978.jpg'),
(47225, 'CASE (เคส) MONTECH X3 MESH (WHITE)', 1750, '/uploads/file-1759746077689-115959142.jpg'),
(47226, 'CASE (เคส) ASUS TUF GAMING GT502 (WHITE) (ATX)', 5490, '/uploads/file-1759746131137-646967639.jpg'),
(47227, 'CASE (เคส) CORSAIR ICUE 4000X RGB TEMPERED GLASS ', 4390, 'http://localhost:5000/uploads/file-1759746225899-439487670.jpg'),
(47230, 'AIR COOLER (ซิงค์ลม) ID-COOLING SE-214-XT-PLUS', 890, 'http://localhost:5000/uploads/file-1759748367016-83044985.jpg'),
(47231, 'AIR COOLER (ซิงค์ลม) ID-COOLING FROZN A410 BLACK', 990, '/uploads/file-1759748808271-9959701.jpg'),
(47232, 'AIR COOLER (ซิงค์ลม) DEEPCOOL AK400 BLACK', 990, '/uploads/file-1759748889413-100443370.jpg'),
(47233, 'AIR COOLER (ซิงค์ลม) DEEPCOOL AK400 WHITE', 1290, '/uploads/file-1759748987075-805860857.jpg'),
(47234, 'AIR COOLER (ซิงค์ลม) MSI MAG COREFROZR AA13 WHITE', 1290, '/uploads/file-1759749035614-603029764.jpg'),
(47235, 'AIR COOLER (ซิงค์ลม) MSI MAG COREFROZR AA13 BLACK', 1290, '/uploads/file-1759749079155-107953347.jpg'),
(47236, 'AIR COOLER (ซิงค์ลม) THERMALRIGHT ASSASSIN X 120 R', 1390, '/uploads/file-1759749351653-456670994.jpg'),
(47237, 'AIR COOLER (ซิงค์ลม) THERMALRIGHT ASSASSIN X 120 R', 1390, '/uploads/file-1759749400048-855229582.jpg'),
(47238, 'AIR COOLER (ซิงค์ลม) DEEPCOOL AK400 DIGITAL PRO WH', 1790, '/uploads/file-1759749464783-403386091.jpg'),
(47239, 'AIR COOLER (ซิงค์ลม) DEEPCOOL AK400 DIGITAL PRO BL', 1790, '/uploads/file-1759749521463-849960255.jpg'),
(47240, 'AIR COOLER (ซิงค์ลม) BE QUIET PURE ROCK 2 FX', 1790, '/uploads/file-1759749575022-503484993.jpg'),
(47241, 'AIR COOLER (ซิงค์ลม) DEEPCOOL AK500 WHITE', 2190, '/uploads/file-1759749623866-893066852.jpg'),
(47242, 'PSU (อุปกรณ์จ่ายไฟ) AZZA PSAZ 550W (80+BRONZE)', 1190, '/uploads/file-1759749719525-575007315.png'),
(47243, 'PSU (อุปกรณ์จ่ายไฟ) FSP HV+ 600W (80+WHITE)', 1190, '/uploads/file-1759749766056-808223215.jpg'),
(47244, 'PSU (อุปกรณ์จ่ายไฟ) GIGABYTE GP-P550SS 550W (80+SI', 1390, '/uploads/file-1759749799173-753525330.jpg'),
(47245, 'PSU (อุปกรณ์จ่ายไฟ) GIGABYTE GP-P550SS ICE 550W (8', 1390, '/uploads/file-1759749837236-523561303.jpg'),
(47246, 'PSU (อุปกรณ์จ่ายไฟ) MSI MAG A650BN 650W (80+BRONZE', 1650, '/uploads/file-1759749884635-185855080.jpg'),
(47247, 'PSU (อุปกรณ์จ่ายไฟ) FSP HV PRO 85+ 650W 80+ BRONZE', 1690, '/uploads/file-1759749926731-15199502.png'),
(47248, 'PSU (อุปกรณ์จ่ายไฟ) THERMALTAKE SMART BX1 650W (80', 1690, '/uploads/file-1759749964777-17680545.jpg'),
(47249, 'PSU (อุปกรณ์จ่ายไฟ) CORSAIR CX650 650W (80+BRONZE)', 1750, '/uploads/file-1759750010168-295600569.jpg'),
(47250, 'PSU (อุปกรณ์จ่ายไฟ) GIGABYTE GP-P750BS 750W (80+BR', 1990, '/uploads/file-1759750049263-365137705.jpg'),
(47251, 'PSU (อุปกรณ์จ่ายไฟ) MSI MAG A650BNL 650W (80+BRONZ', 1990, '/uploads/file-1759750109030-898693912.jpg'),
(47252, 'PSU (อุปกรณ์จ่ายไฟ) ASUS PRIME 650W (80+BRONZE)', 2090, '/uploads/file-1759750149726-886618060.jpg'),
(47253, 'PSU (อุปกรณ์จ่ายไฟ) DEEPCOOL PL750D 750W (80+ BRON', 2290, '/uploads/file-1759750182987-334839382.jpg'),
(47254, 'AMD Ryzen 7 3700X', 12600, '/uploads/file-1759750482033-758039529.jpg'),
(47255, 'ASRock B450M Steel Legend', 2850, 'http://localhost:5000/uploads/file-1759750805874-298795922.jpg'),
(47256, 'GIGABYTE Radeon RX 6500 XT Eagle', 4700, '/uploads/file-1759751001765-832358403.jpg'),
(47257, 'แรมพีซี Corsair DDR4 32GB/3200MHz.CL16 (16GBx2) Ve', 2190, '/uploads/file-1759751079018-213663422.jpg'),
(47258, '1 TB SSD (เอสเอสดี) CORSAIR MP600 ELITE WITH HEATS', 3590, 'http://localhost:5000/uploads/file-1759751157186-258856968.jpg'),
(47259, 'GIGABYTE P750BS 750W', 1990, '/uploads/file-1759751257814-359582086.jpg'),
(47260, 'VIKINGS N275-1 White', 1090, '/uploads/file-1759751394580-727561789.jpg'),
(47262, 'CPU (ซีพียู) INTEL 1700 CORE I5-14400F 4.7GHz 10C ', 4590, '/uploads/file-1760379075770-416153805.jpg'),
(47263, 'VGA(การ์ดจอ) POWERCOLOR FIGHTER RADEON RX 6500 XT ', 4790, '/uploads/file-1760379393982-55385118.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `gpu`
--

CREATE TABLE `gpu` (
  `GPU_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `PCIe_Type` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `Power_Req` int(11) DEFAULT NULL COMMENT 'GPU power requirement in Watts'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gpu`
--

INSERT INTO `gpu` (`GPU_ID`, `Device_ID`, `PCIe_Type`, `details`, `Power_Req`) VALUES
(7117, 47160, 'PCIe 4.0 x16', 'Brand: Sapphire  Model: PULSE AMD Radeon RX 7600 8GB  Specification (ข้อมูลจำเพาะ)  Slot Interface: 1 x PCIe 4.0 x16  Chipset: AMD  Series: AMD Radeon RX 7000 Series  GPU Model: Radeon RX 7600  Performance (ประสิทธิภาพ)  GPU Game Clock: Up to 2355 MHz  GPU Boost Clock: Up to 2755 MHz  Stream Processors: 2048  Memory (หน่วยความจำกราฟิก)  Memory Size: 8 GB  Memory Type: GDDR6  Memory Speed: 18 Gbp', 600),
(7118, 47161, 'PCIe 5.0 x16', 'MSI GeForce RTX™ 5080 16G SHADOW 3X OC – สเปกแบบย่อ  Brand: MSI  Model: GeForce RTX™ 5080 16G SHADOW 3X OC  Specification (ข้อมูลจำเพาะ)  Slot Interface: 1 x PCIe 5.0 x16  Chipset: NVIDIA  Series: NVIDIA GeForce 50 Series  GPU Model: GeForce RTX 5080  Performance (ประสิทธิภาพ)  GPU Boost Clock: 2640 MHz  Core Clocks (Extreme Performance): 2655 MHz  CUDA Cores: 10,752  Memory (หน่วยความจำกราฟิก)  Memory Size: 16 GB  Memory Type: GDDR7  Memory Speed: 30 Gbps', 850),
(7119, 47162, 'PCIe 5.0 x16', 'Brand: Gigabyte  Model: GeForce RTX™ 5080 WINDFORCE OC SFF 16G  Specification (ข้อมูลจำเพาะ)  Slot Interface: 1 x PCIe 5.0 x16  Chipset: NVIDIA  Series: NVIDIA GeForce 50 Series  GPU Model: GeForce RTX 5080  Performance (ประสิทธิภาพ)  GPU Clock Speed: 2670 MHz  CUDA Cores / Stream Processors: TBD (ยังไม่ระบุอย่างเป็นทางการ)  Memory (หน่วยความจำกราฟิก)  Memory Size: 16 GB  Memory Type: GDDR7  Memory Speed: 30 Gbps', 850),
(7120, 47163, 'PCIe 5.0 x16', 'Brand: ASRock  Model: AMD Radeon™ RX 9060 XT Challenger 8GB OC  Specification (ข้อมูลจำเพาะ)  Slot Interface: 1 x PCIe 5.0 x16  Chipset: AMD  Series: AMD Radeon RX 9000 Series  GPU Model: Radeon RX 9060 XT  Performance (ประสิทธิภาพ)  GPU Game Clock: 2700 MHz  GPU Boost Clock: 3290 MHz  Stream Processors: 2048  Memory (หน่วยความจำกราฟิก)  Memory Size: 8 GB  Memory Type: GDDR6  Memory Speed: 20 Gbps', 550),
(7121, 47164, 'PCIe 5.0 x16', 'GPU: NVIDIA GeForce RTX 5070  GPU Clock: 2512 MHz (OC Mode: 2652 MHz)  CUDA Cores: 6144  Memory (หน่วยความจำกราฟิก)  Video Memory: 12 GB  Memory Type: GDDR7  Memory Interface: 192-bit  Memory Clock: 28 Gbps  Interface & Power (การเชื่อมต่อและพลังงาน)  Bus Interface: PCIe 5.0  Power Connector: 1 x 12VHPWR  Display Output (ช่องแสดงผล)  Ports: 1 x HDMI, 3 x DisplayPort', 750),
(7122, 47165, 'PCIe 4.0 x16', 'Chipset Manufacturer: AMD Radeon  GPU: Radeon RX 6600 XT  Performance (ประสิทธิภาพ)  Core Clock: 2000 MHz  Boost Clock: 2593 MHz  Stream Processors: 2048 Units  Memory (หน่วยความจำกราฟิก)  Memory Clock: 16.0 Gbps  Memory Size: 8 GB  Memory Interface: 128-bit  Memory Type: GDDR6  Interface (การเชื่อมต่อ)  Bus Interface: PCIe 4.0 x16  OpenGL Version: 4.6  Display Output (ช่องแสดงผล)  HDMI: 1 x HDMI 2.1 VRR  DisplayPort: 3 x DisplayPort 1.4 with DSC  DVI: No  Dual Link DVI Support: No  CrossFireX / SLI Support: N/A  Cooling & Power (ระบบระบายความร้อนและพลังงาน)  Cooler: 2 FAN  Power Connector: 1 x 8-pin  แนะนำ PSU: 550W', 550),
(7123, 47166, 'PCIe 5.0 x16', 'Brand: ASUS  GPU Series: NVIDIA GeForce RTX™ 50 Series  GPU Model: GeForce® RTX 5070  Performance (ประสิทธิภาพ)  Boost Clock:  2587 MHz (OC Mode)  2557 MHz (Default Mode)  CUDA® Cores: 6144  Memory (หน่วยความจำกราฟิก)  Memory Size: 12 GB  Memory Type: GDDR7  Memory Clock: 28 Gbps  Memory Interface: 192-bit  Interface & Compatibility  Bus Standard: PCI Express 5.0  OpenGL Version: 4.6  Max Digital Resolution: 7680 x 4320  Display Output (ช่องแสดงผล)  HDMI Port: 1 x HDMI 2.1b  DisplayPort: 3 x DisplayPort 2.1b  Power & Physical Specification  Power Connector: 1 x 16-pin  Power Requirement: 750W  Dimensions (W x D x H): 304 x 126 x 50 mm', 750),
(7124, 47170, 'PCIe 4.0 x16', 'Brand: MSI  Model: GeForce RTX™ 4060 VENTUS 2X BLACK 8G OC  Interface/Slot: 1 × PCIe 4.0 x16 Slot  Chipset: NVIDIA  Series: NVIDIA GeForce 40 Series  GPU Model: GeForce RTX 4060  Boost Clock: 2490 MHz  Extreme Perf.: 2505 MHz  Memory Speed: 17 Gbps  Memory Size: 8 GB  Memory Type: GDDR6', 550),
(7125, 47171, 'PCIe 5.0 x16', 'Brand: ASUS  GPU Series: NVIDIA GeForce RTX™ 50 Series  GPU Model: GeForce® RTX 5070  Bus: PCIe 5.0  CUDA Cores: 6144  Memory: 12GB GDDR7, 192-bit, 28 Gbps  Boost Clock: 2587 MHz (OC Mode) / 2557 MHz  Max Resolution: 7680×4320  Ports: 1× HDMI 2.1b, 3× DisplayPort 2.1b  Power Connector: 1× 16-pin (12VHPWR)  Power Requirement: 750 W (PSU แนะนำ)', 750),
(7126, 47172, 'PCIe 5.0 x16', 'Brand: MSI  GPU Series: NVIDIA GeForce RTX™ 50 Series  GPU Model: GeForce® RTX 5060 Ti  Bus: PCI Express Gen 5 x16 (runs x8)  CUDA Cores: 4608  Memory: 16GB GDDR7, 128-bit, 28 Gbps  Boost Clock: 2602 MHz / 2617 MHz (MSI Center)  Max Resolution: 7680 × 4320  Ports: 1× HDMI 2.1b, 3× DisplayPort 2.1b  Power Connector: 1× 8-pin  Power Requirement (PSU แนะนำ): 600 W', 600),
(7127, 47173, 'PCIe 5.0 x16', 'Brand: MSI  Model: GeForce RTX™ 5070 12G SHADOW 2X OC  Slot: 1 × PCIe 5.0 x16  Chipset: NVIDIA  Series: NVIDIA GeForce 50 Series  GPU Model: GeForce RTX 5070  Boost Clock: 2542 MHz  Extreme Performance: 2557 MHz  Memory Speed: 28 Gbps  Memory Size: 12 GB  Memory Type: GDDR7  CUDA Cores / Stream Processors: 6144  Bus Interface: PCI Express 5.0 x16', 650),
(7128, 47174, 'PCIe 5.0 x16', 'Chipset Manufacturer AMD Radeon GPU Radeon RX 9060 XT Core Clock 1900 MHz Boost Clock 3320 MHz Stream Processors 2048 Units Memory Clock 20.0 Gbps Memory Size 16 GB Memory Interface 128-bit Memory Type GDDR6 Interface PCIe 5.0 x16 OpenGL 4.6 HDMI 1x HDMI v2.1b Display Port 2x DisplayPort 2.1a DVI No CrossFireX SLI Support No Cooler 3 FAN Dual Link DVI Support No System Requirements PSU 450 W', 450),
(7129, 47256, 'PCIe 4.0 x16', 'Brand GIGABYTE Series Radeon RX 6000 Series Model Radeon RX 6500 XT Eagle Chipset GPU Chipset AMD GPU Name Navi 24 GPU Clock 2250MHz Boost Clock - Architechture RDNA 2.0 Technology 6nm Memory Memory Clock 18000MHz Memory Size 4GB Memory Interface 64bit Memory Type GDDR6', 400),
(7130, 47263, 'PCIe 4.0 x16', 'Brands	POWER COLOR GPU Series	AMD Radeon™ RX 6000 Series GPU Model	Radeon™ RX 6500 XT Memory Size	4GB GDDR6 Bus Standards	PCI Express 4.0 x4 OpenGL	OpenGL® 4.6 CUDA® Cores	1024 Memory Interface	64-bit Boost Clock	2815 MHz (OC mode) Memory Clock	18.0 Gbps Max Digital Resolution	7680 x 4320 HDMI Port	1 x HDMI 2.1 Display Port	1x DisplayPort™ 1.4 Power Connector	1 x 6-pin Power Requirement	400 Watt', 400);

-- --------------------------------------------------------

--
-- Table structure for table `harddisk`
--

CREATE TABLE `harddisk` (
  `harddisk_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `harddisk`
--

INSERT INTO `harddisk` (`harddisk_ID`, `Device_ID`, `details`) VALUES
(535, 47209, 'ModelWD Blue (WD10EZEX) BrandWD specification RPM7200 Form Factor3.5 inch ความจุ1 TB interface connector InterfaceSATA 3.0 (6 Gb/s)'),
(536, 47210, 'ModelBarraCuda BrandSeagate specification RPM5400 Form Factor3.5 Inch ความจุ4 TB interface connector InterfaceSATA 3.0 (6 Gb/s)'),
(537, 47211, 'ModelWD Blue (WD20EZBX) BrandWD specification RPM7200 Form Factor3.5 inch ความจุ2 TB interface connector InterfaceSATA 3.0 (6 Gb/s)'),
(538, 47212, 'ModelBlue BrandWD specification RPM5400 Form Factor3.5 inch ความจุ4 TB interface connector InterfaceSATA 3.0 (6 Gb/s)'),
(539, 47213, 'ModelBarraCuda BrandSeagate specification RPM5400 Form Factor3.5 inch ความจุ8 TB interface connector InterfaceSATA 3.0 (6 Gb/s)'),
(540, 47214, 'ModelWD Black (WD8002FZBX) BrandWD specification RPM7200 Form Factor3.5 inch ความจุ8 TB interface connector InterfaceSATA 3.0 (6 Gb/s)'),
(541, 47215, 'ModelBlack BrandWD specification RPM7200 Form Factor3.5 inch ความจุ4 TB interface connector InterfaceSATA 3.0 (6 Gb/s)'),
(542, 47216, 'ModelBlack BrandWD specification RPM7200 Form Factor3.5 inch ความจุ6 TB interface connector InterfaceSATA 3.0 (6 Gb/s)'),
(543, 47217, 'ModelBlack BrandWD specification RPM7200 Form Factor3.5 inch ความจุ10 TB interface connector InterfaceSATA 3.0 (6 Gb/s)');

-- --------------------------------------------------------

--
-- Table structure for table `mainboard`
--

CREATE TABLE `mainboard` (
  `mainboard_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `Socket_Sup` varchar(50) DEFAULT NULL,
  `RAM_Sup` varchar(50) DEFAULT NULL,
  `Case_Sup` varchar(50) DEFAULT NULL,
  `PCIe_Sup` varchar(50) DEFAULT NULL,
  `SSD_Sup` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `power_usage` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mainboard`
--

INSERT INTO `mainboard` (`mainboard_ID`, `Device_ID`, `Socket_Sup`, `RAM_Sup`, `Case_Sup`, `PCIe_Sup`, `SSD_Sup`, `details`, `power_usage`) VALUES
(9920, 47144, 'AM5', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: Asus  Model: PRIME B650-PLUS  CPU Support  Socket: AM5  รองรับซีรีส์: 7000 Series (Raphael), 8000 / 8000G Series (Phoenix), 9000 Series (Granite Ridge)  รองรับกำลังไฟ CPU สูงสุด: 170W  Chipset: AMD B650  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR5  ความจุสูงสุด: 192 GB', 50),
(9921, 47145, 'AM5', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: MSI  Model: B650 GAMING PLUS WIFI  CPU Support  Socket: AM5  รองรับซีรีส์: 7000 Series (Raphael), 8000 / 8000G Series (Phoenix), 9000 Series (Granite Ridge)  รองรับกำลังไฟ CPU สูงสุด: 170W  Chipset: AMD B650  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR5  ความจุสูงสุด: 256 GB', 50),
(9922, 47146, 'AM5', 'DDR5', 'ATX	', 'PCIe 4.0 x16', 'M.2 NVMe', 'CPU Socket Type: AMD AM5  CPU Type: Ryzen 7000 Series Processors  Supported CPU Technologies: Raphael  Chipset: AMD B650  Memory (หน่วยความจำ)  จำนวนสล็อต: 4x DIMM  มาตรฐานหน่วยความจำ: DDR5 (รองรับความเร็วสูงสุด 6400 MHz OC)  ความจุสูงสุด: 128 GB  ', 50),
(9923, 47147, ' AM5', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: Gigabyte  Model: X870 AORUS ELITE WIFI7  CPU Support  Socket: AM5  รองรับซีรีส์: 7000 Series (Raphael), 8000 / 8000G Series (Phoenix), 9000 Series (Granite Ridge)  รองรับกำลังไฟ CPU สูงสุด: 170W  Chipset: AMD X870  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR5  ความจุสูงสุด: 256 GB', 50),
(9924, 47148, 'AM5', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: Asus  Model: TUF GAMING B850-PLUS WIFI  CPU Support  Socket: AM5  รองรับซีรีส์: 7000 Series (Raphael), 8000 / 8000G Series (Phoenix), 9000 Series (Granite Ridge)  รองรับกำลังไฟ CPU สูงสุด: 170W  Chipset: AMD B850  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR5  ความจุสูงสุด: 192 GB', 50),
(9925, 47149, 'AM5', 'DDR5', 'Micro-ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: ASRock  Model: B650M PRO RS  CPU Support  Socket: AM5  รองรับซีรีส์: 7000 Series (Raphael), 8000 / 8000G Series (Phoenix), 9000 Series (Granite Ridge)  รองรับกำลังไฟ CPU สูงสุด: 170W  Chipset: AMD B650  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR5  ความจุสูงสุด: 256 GB', 50),
(9926, 47150, 'AM5', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: MSI  Model: MAG X870 TOMAHAWK WIFI  CPU Support  Socket: AM5  รองรับซีรีส์: 7000 Series (Raphael), 8000 / 8000G Series (Phoenix), 9000 Series (Granite Ridge)  รองรับกำลังไฟ CPU สูงสุด: 170W  Chipset: AMD X870  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR5  ความจุสูงสุด: 256 GB', 50),
(9927, 47151, 'AM4', 'DDR4', 'Micro-ATX', 'PCIe 3.0 x16', 'M.2 NVMe', 'Brand: Gigabyte  Model: A520M K V2 (rev. 1.0)  CPU Support  Socket: AM4  รองรับซีรีส์:  3000 Series (Matisse)  4000 / 4000 G-Series (Renoir)  5000 / 5000 G-Series (Vermeer / Cezanne)  รองรับกำลังไฟ CPU สูงสุด: 105W  Chipset: AMD A520  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 2  ประเภทหน่วยความจำ: DDR4  ความจุสูงสุด: 64 GB', 50),
(9928, 47152, 'AM5', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: MSI  Model: PRO B650-S  CPU Support  Socket: AM5  Compatible Processors: รองรับ AMD Ryzen 7000 Series Desktop Processors  Chipset: AMD B650  รองรับรุ่น CPU: AMD Ryzen 7 (และซีรีส์ Ryzen 3, Ryzen 5, Ryzen 9 ที่ใช้ซ็อกเก็ต AM5)  Memory (หน่วยความจำ)  เทคโนโลยีหน่วยความจำ: DDR5  ความเร็วหน่วยความจำ (OC): สูงสุด 7200 MHz', 50),
(9929, 47153, 'AM4', 'DDR4', 'Micro-ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Socket: AM4  รองรับซีรีส์:  3000 G-Series (Picasso)  3000 Series (Matisse)  4000 / 4000 G-Series (Renoir)  5000 / 5000 G-Series (Cezanne / Vermeer)  รองรับกำลังไฟ CPU สูงสุด: 105W  Chipset: AMD B550  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR4  ความจุสูงสุด: 128 GB', 50),
(9930, 47154, 'AM5', 'DDR5', 'Mini-ITX', 'PCIe 5.0 x16', 'M.2 NVMe', 'Support CPU: AMD Ryzen 9000 / 8000 / 7000 Series Desktop Processors  Form Factor: Mini ITX  Chipset: AMD B850  Memory (หน่วยความจำ)  Memory Channel: Dual Channel DDR5 (2 DIMM)  รองรับความเร็วสูงสุด: 8200 MHz (O.C.)  ความจุสูงสุด: 128 GB', 50),
(9931, 47155, 'LGA1700', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Socket: LGA 1700  รองรับซีรีส์:  12th Gen (Alder Lake)  13th Gen (Raptor Lake)  14th Gen (Raptor Lake Refresh)  รองรับกำลังไฟ CPU สูงสุด: 150W  Chipset: Intel B760  รองรับรุ่น CPU: Celeron, Pentium, Core i3, Core i5, Core i7, Core i9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR5  ความจุสูงสุด: 192 GB', 50),
(9932, 47156, 'AM4', 'DDR4', 'Micro-ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Socket: AM4  รองรับซีรีส์:  3000 Series (Matisse)  4000 / 4000 G-Series (Renoir)  5000 / 5000 G-Series (Cezanne / Vermeer)  รองรับกำลังไฟ CPU สูงสุด: 105W  Chipset: AMD B550  รองรับรุ่น CPU: Ryzen 3, Ryzen 5, Ryzen 7, Ryzen 9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR4  ความจุสูงสุด: 128 GB', 50),
(9933, 47157, 'LGA1700', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: MSI  Model: PRO Z790-A MAX WIFI  CPU Support  Socket: LGA 1700  รองรับซีรีส์:  12th Gen (Alder Lake)  13th Gen (Raptor Lake)  14th Gen (Raptor Lake Refresh)  รองรับกำลังไฟ CPU สูงสุด: 150W  Chipset: Intel Z790  รองรับรุ่น CPU: Celeron, Pentium, Core i3, Core i5, Core i7, Core i9  Memory (หน่วยความจำ)  จำนวนสล็อต: 4  ประเภทหน่วยความจำ: DDR5  ความจุสูงสุด: 256 GB', 50),
(9934, 47158, 'AM5', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: ASUS  Model: TUF GAMING B650-PLUS WIFI (DDR5)  CPU Support  CPU Brand: AMD  Socket: AM5  รองรับโปรเซสเซอร์: AMD Ryzen™ 7000 & 8000 Series Desktop Processors', 50),
(9935, 47159, 'AM5', 'DDR5', 'ATX', 'PCIe 4.0 x16', 'M.2 NVMe', 'Brand: ASUS  Model: TUF GAMING B650-PLUS WIFI (DDR5)**  CPU Support  CPU Brand: AMD  Socket: AM5  รองรับโปรเซสเซอร์: AMD Ryzen™ 7000 & 8000 Series Desktop Processors (สามารถตรวจสอบรายชื่อ CPU ที่รองรับได้ที่เว็บไซต์ทางการของ ASUS)  Chipset  Chipset: AMD B650', 50),
(9939, 47255, 'AM4', 'DDR4', 'Micro-ATX', 'PCIe 3.0 x16', 'M.2 NVMe', 'BrandAsrock ModelB450M Steel Legend CPU SocketAM4 (1000 Series - Summit Ridge) , AM4 (1000 Series >65W - Summit Ridge) , AM4 (2000 Series - Pinnacle Ridge) , AM4 (2000 Series >65W - Pinnacle Ridge) , AM4 (3000 G-Series - Picasso) , AM4 (3000 Series - Matisse) , AM4 (4000 G-Series - Renoir) , AM4 (4000 Series - Renoir) , AM4 (5000 G-Series - Cezanne) , AM4 (5000 Series - Vermeer / Cezanne) , AM4 (Athlon) Wattage105 ChipsetAMD B450 SeriesRyzen 3 , Ryzen 5 , Ryzen 7 , Ryzen 9 , Athlon memory Slot4 Memory TypeDDR4 Max. Capacity128 GB', 50);

-- --------------------------------------------------------

--
-- Table structure for table `pc_case`
--

CREATE TABLE `pc_case` (
  `case_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `Size_Case` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pc_case`
--

INSERT INTO `pc_case` (`case_ID`, `Device_ID`, `Size_Case`, `details`) VALUES
(8422, 47218, 'ATX ,E-ATX ,Micro-ATX ,Mini-DTX ,Mini-ITX', 'ModelTUF Gaming GT501 BrandAsus specification Power Supply ในตัว- Cooling FanPre-installed ▼ Front : 120 mm RGB x 3 Rear : 140 mm x 1 Support ▼ Front : 120 mm x 3 or 140 mm x 2 Rear : 120 mm x 1 or 140 mm x 1 Top : 120 mm x 3 or 140 mm x 2 รองรับ VGA ขนาด420 mm Front Panel I/OUSB 3.0 Type-A x 2 Headphone / Audio Out x 1 Mic x 1 สีBlack ขนาด (Dimension)552 x 251 x 545 mm MaterialSteel, Tempered Glass รองรับ MotherboardATX , E-ATX , Micro-ATX , Mini-DTX , Mini-ITX ประเภทMid Tower'),
(8423, 47219, 'ATX ,Micro-ATX ,Mini-DTX ,Mini-ITX', 'ModelX2 MESH BrandMontech specification Power Supply ในตัว- Cooling Fan• Pre-installed Fan - Front : 140 mm rainbow fan x 2 - Rear : 120 mm rainbow fan x 1 — • Fan Support - Front : 140 mm x 2 - Rear : 120 mm x 1 - Top : 120 mm x 2 รองรับ VGA ขนาด305 mm Front Panel I/O• USB 2.0 Type-A x 2 • USB 3.0 Type-A x 1 • Headphone x 1 • Mic x 1 สีBlack ขนาด (Dimension)380 x 190 x 447 mm MaterialSteel, Tempered glass รองรับ MotherboardATX , Micro-ATX , Mini-DTX , Mini-ITX ประเภทMid Tower'),
(8424, 47220, 'ATX ,Micro-ATX ,Mini-DTX ,Mini-ITX', 'ModelX2 MESH BrandMontech specification Power Supply ในตัว- Cooling Fan• Pre-installed Fan - Front : 140 mm rainbow fan x 2 - Rear : 120 mm rainbow fan x 1 — • Fan Support - Front : 140 mm x 2 - Rear : 120 mm x 1 - Top : 120 mm x 2 รองรับ VGA ขนาด305 mm Front Panel I/O• USB 2.0 Type-A x 2 • USB 3.0 Type-A x 1 • Headphone x 1 • Mic x 1 สีWhite ขนาด (Dimension)380 x 190 x 447 mm MaterialSteel, Tempered glass รองรับ MotherboardATX , Micro-ATX , Mini-DTX , Mini-ITX ประเภทMid Tower'),
(8425, 47221, 'Micro-ATX ,Mini-ITX', 'ModelMACUBE 110 BK BrandDeepcool specification Power Supply ในตัว- Cooling FanIncluded : Rear 120 mm x 1 / Support : Front 120 mm x 3 or 140 mm x 2 , Top 120/140 mm x 2 , Rear 120 mm x 1 รองรับ VGA ขนาด320mm Front Panel I/OUSB3.0 × 2 ,Audio × 1 สีBlack ขนาด (Dimension)400 × 225 × 431 mm MaterialABS+SPCC+Tempered Glass รองรับ MotherboardMicro-ATX , Mini-ITX ประเภทMicro ATX'),
(8426, 47222, 'Micro-ATX ,Mini-DTX ,Mini-ITX', 'ModelPrime AP201 BrandAsus specification Power Supply ในตัว- Cooling FanPre-installed ▼ Rear : 120 mm x 1 Support ▼ Rear : 120 mm x 1 Top : 120 mm x 3 or 140 mm x 2 รองรับ VGA ขนาด338 mm Front Panel I/OUSB 3.2 Gen 1 Type-A x 2 USB 3.2 Gen 2 Type-C x 1 Headphone x 1 Mic x 1 สีWhite ขนาด (Dimension)205 x 350 x 460 mm MaterialSteel รองรับ MotherboardMicro-ATX , Mini-DTX , Mini-ITX ประเภทMicro ATX'),
(8427, 47223, 'Micro-ATX ,Mini-DTX ,Mini-ITX', 'ModelCS-107 BrandAerocool specification Power Supply ในตัว- Cooling Fan• Pre-installed Fan - Front : 120 mm fixed mode RGB x 2 - Rear : 120 mm fixed mode RGB x 1 — • Fan Support - Front : 120 mm x 2 - Rear : 120 mm x 1 — • Radiator Support - Front : 120 mm or 240 mm (Radiator length <296mm) รองรับ VGA ขนาดup to 286 mm (without front radiator) Front Panel I/O• USB 2.0 Type-A x 1 • USB 3.0 Type-A x 1 • Headphone x 1 • Mic x 1 สีBlack ขนาด (Dimension)197.5 x 353 x 340.6 mm MaterialSteel, Acrylic รองรับ MotherboardMicro-ATX , Mini-DTX , Mini-ITX ประเภทMicro ATX'),
(8428, 47224, 'ATX ,Micro-ATX ,Mini-DTX ,Mini-ITX', 'ModelX3 Glass BrandMontech specification Power Supply ในตัว- Cooling Fan• Pre-installed Fan - Front : 140 mm LED Rainbow fan (Fixed Mode RGB) x 3 - Rear : 120 mm LED Rainbow fan (Fixed Mode RGB) x 1 - Top : 120 mm LED Rainbow fan (Fixed Mode RGB) x 2 — • Fan Support - Front : 120 mm x 3 or 140 mm x 3 - Rear : 120 mm x 1 - Top : 120 mm x 2 รองรับ VGA ขนาด305 mm Front Panel I/O• USB 2.0 Type-A x 2 • USB 3.0 Type-A x 1 • Headphone x 1 • Mic x 1 สีBlack ขนาด (Dimension)370 x 210 x 480 mm MaterialSteel, Tempered Glass รองรับ MotherboardATX , Micro-ATX , Mini-DTX , Mini-ITX ประเภทMid Tower'),
(8429, 47225, 'ATX ,Micro-ATX ,Mini-ITX', 'ModelX3 Mesh BrandMontech specification Power Supply ในตัว- Cooling FanFront : 140mm x 3 (LED Rainbow fan), Top : 120mm x 2 (LED Rainbow fan), Rear : 120mm x 1 (LED Rainbow fan) รองรับ VGA ขนาด305mm Front Panel I/O2x USB2.0, x1 USB3.0, 1x Audio, 1x mic, Light switch สีWhite ขนาด (Dimension)370 x 210 x 480 mm MaterialTempered Glass, Plastic, Steel รองรับ MotherboardATX , Micro-ATX , Mini-ITX ประเภทMid Tower'),
(8430, 47226, 'ATX ,Micro-ATX ,Mini-DTX ,Mini-ITX', 'ModelTUF Gaming GT502 BrandAsus specification Power Supply ในตัว- Cooling FanFan Support • Rear : 120 mm x 1 • Top : 120 mm x 3 or 140 mm x 2 • Bottom : 120 mm x 3 • Side : 120 mm x 6 or 140 mm x 2 — Radiator Support • Rear : 120 mm • Top : 120 mm or 140 mm or 240 mm or 280 mm or 360 mm • Side : 120 mm or 140 mm or 240 mm or 280 mm or 360 mm รองรับ VGA ขนาด400 mm Front Panel I/O• USB 3.2 Gen 1 Type-A x 2 • USB 3.2 Gen 2 Type-C x 1 • Headphone & Mic Combo x 1 สีWhite ขนาด (Dimension)285 x 450 x 446 mm MaterialSteel, Tempered Glass รองรับ MotherboardATX , Micro-ATX , Mini-DTX , Mini-ITX ประเภทMid Tower'),
(8431, 47227, 'ATX ,Micro-ATX ,Mini-ITX', 'ModeliCUE 4000X RGB BrandCorsair specification Power Supply ในตัว- Cooling FanYes รองรับ VGA ขนาด360mm Front Panel I/OPower Button 1x USB 3.0 1x USB 3.1 Type-C 1x Audio/Microphone Reset Button สีWhite ขนาด (Dimension)453 x 230 x 466 mm MaterialSteel, Tempered Glass, Plastic รองรับ MotherboardATX , Micro-ATX , Mini-ITX ประเภทMid Tower'),
(8432, 47260, 'Mini-ITX,Micro-ATX', 'Brand VIKINGS Model N275-1 White Specification Form Factor Mid Tower Mainboard Support Mini-ITX, Micro-ATX Material Steel, Plastic, Tempered Glass Color White Weight 3.40Kg Dimension 27.50 cm x 34.00 cm x 33.00 cm I/O Ports USB 2.0 x2 USB 3.0 x1 Audio & Mic x1 Rear : 120mm x 1 ( RGB ) Cooling Support Fan Support Front: - Top: 2 x 120mm Rear: 1 x 120mm Side: 2 x 120mm Bottom: 2 x 120mm Radiator Support Front: - Top: - Rear: - Side: - Bottom: - LED Lighting - Max CPU Coolers height 165mm Max VGA Length 300mm');

-- --------------------------------------------------------

--
-- Table structure for table `power`
--

CREATE TABLE `power` (
  `power_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `power_sup` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `power`
--

INSERT INTO `power` (`power_ID`, `Device_ID`, `power_sup`, `details`) VALUES
(4254, 47242, 550, 'Brand	AZZA Energy Efficient	80 PLUS BRONZE Continuous Power W	550 Watt PSU Form Factor	ATX Input Frequency	47-63Hz MB Connector	1 x 20+4-pin CPU Connector	1 x 4+4-Pin PCIe Connector	2 x 6+2-pin SATA Connector	5'),
(4255, 47243, 600, 'Brand	FSP Energy Efficient	80 PLUS WHITE Modular	Non Modular Continuous Power W	600 Watt Form Factor	ATX Input Voltage	200-240 V Input Current	4.5 A Input Frequency	50-60Hz MB Connector	1 x 24-pin CPU Connector	1 x 4+4-Pin PCIe Connector	2 x 6+2-pin SATA Connector	6 Fan Size	120 mm Dimensions	140 x 150 x 86 mm Protections	Protection OPP/UVP/OVP/SCP/OCP'),
(4256, 47244, 550, 'Brand	GIGABYTE Energy Efficient	80 PLUS SILVER Modular	Non Modular Continuous Power W	550 Watt Form Factor	ATX Input Voltage	155-240 V Input Current	6.3 A Input Frequency	50-60Hz MB Connector	1 x 20+4-pin CPU Connector	1 x 4+4-Pin PCIe Connector	2 x 6+2-pin SATA Connector	5 Fan Size	120 mm Dimensions	150 x 140 x 86 mm Protections	OVP/OPP/SCP/UVP/OCP/OTP'),
(4257, 47245, 550, 'Brand	GIGABYTE Energy Efficient	80 PLUS SILVER Modular	Non Modular Continuous Power W	550 Watt Form Factor	ATX Input Voltage	155-240 V Input Current	6.3 A Input Frequency	50-60Hz MB Connector	1 x 20+4-pin CPU Connector	1 x 4+4-Pin PCIe Connector	2 x 6+2-pin SATA Connector	5 Fan Size	120 mm Dimensions	140 x 150 x 86 mm Protections	OVP/OPP/SCP/UVP/OCP/OTP'),
(4258, 47246, 650, 'Brand	MSI Energy Efficient	80 PLUS BRONZE Modular	Non Modular Continuous Power W	650 Watt PSU Form Factor	ATX Input Current	10 A Input Frequency	50-60Hz MB Connector	1 x 20+4-pin CPU Connector	1 x 4+4-Pin PCIe Connector	2 x 6+2-pin SATA Connector	5 Fan Size	120 mm Dimensions W x D x H	140 x 150 x 86 mm Weight	1.7 Kg'),
(4259, 47247, 650, 'Brand	FSP Energy Efficient	80 PLUS BRONZE Modular	Non Modular Continuous Power W	650 Watt Form Factor	ATX Input Voltage	200-240 V Input Current	5 A Input Frequency	50-60Hz MB Connector	1 x 24-pin CPU Connector	2 x 4+4-pin PCIe Connector	2 x 6+2-pin SATA Connector	5 Fan Size	120 mm Dimensions	150 x 140 x 86 mm Protections	Protection OCP/OVP/SCP/OPP'),
(4260, 47248, 650, 'Brand	THERMALTAKE Energy Efficient	80 PLUS BRONZE Modular	Non Modular Continuous Power W	650 Watt Form Factor	ATX Input Voltage	100-240 V Input Current	12 A Input Frequency	50-60Hz MB Connector	1 x 24-pin CPU Connector	1 x 4+4-Pin PCIe Connector	2 x 6+2-pin SATA Connector	6 Fan Size	120 mm Dimensions	150 x 140 x 86 mm'),
(4261, 47249, 650, 'Brand	CORSAIR Energy Efficient	80 PLUS BRONZE Modular	Non Modular Continuous Power W	650 Watt Form Factor	ATX Input Voltage	100-240 V Input Current	10A-5A Input Frequency	47-63Hz MB Connector	1 x 24-pin CPU Connector	1 x 4+4-Pin PCIe Connector	1 x 6+2-pin SATA Connector	3 Fan Size	120 mm Dimensions	150 x 125 x 86 mm. Weight	2.37Kg'),
(4262, 47250, 750, 'Brand	GIGABYTE Energy Efficient	80 PLUS BRONZE Modular	Non Modular Continuous Power W	750 Watt Form Factor	ATX Input Voltage	200-240 V Input Current	6 A Input Frequency	50-60Hz MB Connector	1 x 20+4-pin CPU Connector	2 x 4+4-pin PCIe Connector	4 x 6+2-pin SATA Connector	7 Fan Size	120 mm Dimensions	150 x 140 x 86 mm Protections	OVP/OPP/SCP/UVP/OCP/OTP'),
(4263, 47251, 650, 'Brand	MSI Energy Efficient	80 PLUS BRONZE Modular	N/A Continuous Power W	650 Watt Form Factor	ATX Input Voltage	110-240 V Input Frequency	50-60Hz MB Connector	1 x 20+4-pin CPU Connector	2 x 4+4-pin PCIe Connector	2 x 6+2-pin SATA Connector	5 Molex Connector	2 Fan Size	120 mm Dimensions	150 x 140 x 86 mm Protections	Protection OCP/OVP/SCP/OPP'),
(4264, 47252, 650, 'Brand	ASUS Energy Efficient	80 PLUS BRONZE Modular	Non Modular Continuous Power W	650 Watt Form Factor	ATX Input Voltage	100-240 V MB Connector	1 x 24/20-pin CPU Connector	1 x 4+4-Pin PCIe Connector	2 x 8-pin SATA Connector	5 Fan Size	135 mm Dimensions	150 × 150 × 86 mm Weight	2.18 Kg. Protections	OVP/OPP/SCP/UVP/OCP/OTP'),
(4265, 47253, 750, 'Brand	DEEPCOOL Energy Efficient	80 PLUS BRONZE Modular	Non Modular Continuous Power W	750 Watt Form Factor	ATX MB Connector	1 x 20+4-pin CPU Connector	2 x 4+4-pin PCIe Connector	 3 x 6+2-pin 1 x 16-pin SATA Connector	8 Fan Size	120 mm Dimensions	140 x 150 x 86 mm Weight	2.41 Kg.'),
(4266, 47259, 750, 'Brand	GIGABYTE Energy Efficient	80 PLUS BRONZE Modular	Non Modular Continuous Power W	750 Watt Form Factor	ATX Input Voltage	200-240 V Input Current	6 A Input Frequency	50-60Hz MB Connector	1 x 20+4-pin CPU Connector	2 x 4+4-pin PCIe Connector	4 x 6+2-pin SATA Connector	7 Fan Size	120 mm Dimensions	150 x 140 x 86 mm Protections	OVP/OPP/SCP/UVP/OCP/OTP');

-- --------------------------------------------------------

--
-- Table structure for table `preset_builds`
--

CREATE TABLE `preset_builds` (
  `preset_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL COMMENT 'ชื่อชุดสเปค เช่น "สำหรับทำงานออฟฟิศ"',
  `description` text DEFAULT NULL COMMENT 'คำอธิบายชุดสเปค',
  `category` varchar(100) DEFAULT NULL COMMENT 'หมวดหมู่ เช่น "office", "gaming", "video-editing"',
  `thumbnail_url` varchar(500) DEFAULT NULL COMMENT 'รูปภาพหน้าปก',
  `total_price` decimal(10,2) DEFAULT 0.00 COMMENT 'ราคารวม',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '1=แสดง, 0=ซ่อน',
  `display_order` int(11) DEFAULT 0 COMMENT 'ลำดับการแสดงผล',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `preset_builds`
--

INSERT INTO `preset_builds` (`preset_id`, `title`, `description`, `category`, `thumbnail_url`, `total_price`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'ชุดทำงานออฟฟิศ', 'เหมาะสำหรับงานเอกสาร, อีเมล, เว็บเบราว์เซอร์', 'office', 'http://localhost:5000/uploads/file-1760380790786-509760845.jpg', 17030.00, 1, 3, '2025-10-05 15:11:51', '2025-10-23 13:01:36'),
(2, 'ชุดเล่นเกมระดับกลาง', 'เล่นเกมได้ลื่นไหล 1080p 60fps', 'gaming', 'http://localhost:5000/uploads/file-1759752604437-110459072.jpg', 32250.00, 1, 1, '2025-10-05 15:11:51', '2025-10-13 15:37:51'),
(3, 'ชุดตัดต่อวิดีโอ', 'สำหรับงาน Video Editing และ Rendering', 'video-editing', '', 9900.00, 1, 3, '2025-10-05 15:11:51', '2025-10-06 17:16:51'),
(4, 'ชุด Streaming', 'สำหรับ Live Streaming และบันทึกวิดีโอ', 'streaming', '', 9900.00, 1, 4, '2025-10-05 15:11:51', '2025-10-06 17:17:17');

-- --------------------------------------------------------

--
-- Table structure for table `preset_build_items`
--

CREATE TABLE `preset_build_items` (
  `item_id` int(11) NOT NULL,
  `preset_id` int(11) NOT NULL COMMENT 'FK ไปยัง preset_builds',
  `device_id` int(11) NOT NULL COMMENT 'FK ไปยัง device',
  `component_type` varchar(50) NOT NULL COMMENT 'ประเภทอุปกรณ์ เช่น "cpu", "gpu", "ram"',
  `quantity` int(11) DEFAULT 1 COMMENT 'จำนวน',
  `price_at_time` decimal(10,2) DEFAULT NULL COMMENT 'ราคาขณะที่เพิ่ม (เก็บไว้กรณีราคาเปลี่ยน)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `preset_build_items`
--

INSERT INTO `preset_build_items` (`item_id`, `preset_id`, `device_id`, `component_type`, `quantity`, `price_at_time`, `created_at`) VALUES
(46, 3, 47146, 'mainboard', 1, 9900.00, '2025-10-06 17:16:51'),
(47, 4, 47146, 'mainboard', 1, 9900.00, '2025-10-06 17:17:17'),
(57, 2, 47254, 'cpu', 1, 12600.00, '2025-10-13 15:37:54'),
(58, 2, 47255, 'mainboard', 1, 2850.00, '2025-10-13 15:37:54'),
(59, 2, 47256, 'gpu', 1, 4700.00, '2025-10-13 15:37:54'),
(60, 2, 47258, 'ram', 1, 3590.00, '2025-10-13 15:37:54'),
(61, 2, 47208, 'ssd', 1, 1650.00, '2025-10-13 15:37:54'),
(62, 2, 47209, 'hdd', 1, 1590.00, '2025-10-13 15:37:54'),
(63, 2, 47259, 'power', 1, 1990.00, '2025-10-13 15:37:54'),
(64, 2, 47260, 'case', 1, 1090.00, '2025-10-13 15:37:54'),
(65, 2, 47241, 'cooler', 1, 2190.00, '2025-10-13 15:37:54'),
(95, 1, 47134, 'cpu', 1, 2990.00, '2025-10-13 18:38:15'),
(96, 1, 47151, 'mainboard', 1, 1550.00, '2025-10-13 18:38:15'),
(97, 1, 47263, 'gpu', 1, 4790.00, '2025-10-13 18:38:15'),
(98, 1, 47185, 'ram', 1, 1250.00, '2025-10-13 18:38:15'),
(99, 1, 47206, 'ssd', 1, 1090.00, '2025-10-13 18:38:15'),
(100, 1, 47209, 'hdd', 1, 1590.00, '2025-10-13 18:38:15'),
(101, 1, 47243, 'power', 1, 1190.00, '2025-10-13 18:38:15'),
(102, 1, 47221, 'case', 1, 1590.00, '2025-10-13 18:38:15'),
(103, 1, 47232, 'cooler', 1, 990.00, '2025-10-13 18:38:15');

-- --------------------------------------------------------

--
-- Table structure for table `ram`
--

CREATE TABLE `ram` (
  `RAM_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `Type_RAM` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ram`
--

INSERT INTO `ram` (`RAM_ID`, `Device_ID`, `Type_RAM`, `details`) VALUES
(7072, 47175, 'DDR4', 'ModelVENGEANCE LPX BrandCorsair specification Latency16-20-20-38 Number of DIMMs2 DIMM(s) Capacity per DIMM8 GB Total Capacity16 GB Speed3200 (OC) MHz TypeDDR4'),
(7073, 47176, 'DDR5', 'ModelFlare X5 BrandG.Skill specification Latency36-36-36-96 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed6000 (OC) MHz TypeDDR5'),
(7074, 47177, 'DDR4', 'ModelVENGEANCE LPX BrandCorsair specification Latency16-20-20-38 Number of DIMMs2 DIMM(s) Capacity per DIMM8 GB Total Capacity16 GB Speed3200 (OC) MHz TypeDDR4'),
(7075, 47178, 'DDR4', 'ModelVENGEANCE LPX BrandCorsair specification Latency15-15-15-36 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed3200 (OC) MHz TypeDDR4'),
(7076, 47179, 'DDR5', 'ModelTrident Z5 RGB BrandG.Skill specification Latency32-39-39-102 Number of DIMMs2 DIMM(s) Capacity per DIMM32 GB Total Capacity64 GB Speed6400 (OC) MHz TypeDDR5'),
(7077, 47180, 'DDR5', 'ModelVengeance RGB DDR5 BrandCorsair specification Latency40-40-40-77 Number of DIMMs2 DIMM(s) Capacity per DIMM32 GB Total Capacity64 GB Speed5600 (OC) MHz TypeDDR5'),
(7078, 47181, 'DDR4', 'ModelT-FORCE DELTA RGB BrandTeam specification Latency16-18-18-38 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed3000 MHz TypeDDR4'),
(7079, 47182, 'DDR5', 'ModelTrident Z5 Neo RGB BrandG.Skill specification Latency32-38-38-96 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed6000 (OC) MHz TypeDDR5'),
(7080, 47183, 'DDR5', 'ModelViper Venom RGB DDR5 BrandPatriot specification Latency34-42-42-84 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed7200 (OC) MHz TypeDDR5'),
(7081, 47184, 'DDR4', 'ModelVENGEANCE RGB PRO SL BrandCorsair specification Latency16-20-20-38 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed3200 (OC) MHz TypeDDR4'),
(7082, 47185, 'DDR4', 'ModelDDR4 3200MHz 16GBx1 BrandSilicon Power specification LatencyCL16 Number of DIMMs1 DIMM(s) Capacity per DIMM16 GB Total Capacity16 GB Speed3200 MHz TypeDDR4'),
(7083, 47186, 'DDR4', 'ModelVENGEANCE LPX BrandCorsair specification Latency15-15-15-36 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed3200 (OC) MHz TypeDDR4'),
(7084, 47187, 'DDR4', 'ModelFURY Beast DDR4 BrandKingston specification Latency16-20-20 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed3200 (OC) MHz TypeDDR4'),
(7085, 47188, 'DDR5', 'ModelTrident Z5 Neo RGB BrandG.Skill specification Latency32-38-38-96 Number of DIMMs2 DIMM(s) Capacity per DIMM32 GB Total Capacity64 GB Speed6000 (OC) MHz TypeDDR5'),
(7086, 47189, 'DDR4', 'ModelRipjaws V BrandG.Skill specification Latency16-18-18-38 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed3200 (OC) MHz TypeDDR4'),
(7087, 47190, 'DDR5', 'ModelFlare X5 BrandG.Skill specification Latency36-36-36-96 Number of DIMMs2 DIMM(s) Capacity per DIMM16 GB Total Capacity32 GB Speed6000 (OC) MHz TypeDDR5'),
(7088, 47191, 'DDR4', 'ModelFURY Beast DDR4 BrandKingston specification Latency16-18-18 Number of DIMMs2 DIMM(s) Capacity per DIMM8 GB Total Capacity16 GB Speed3200 (OC) MHz TypeDDR4'),
(7089, 47257, 'DDR4', 'Capacity	32 GB (2x16GB) Speed	3200 MHz Cas Latency	CL16 Timing	16-20-20-38 Voltage	1.35 V Color	BLACK Heat Spreader	Yes Type	DDR4 Warranty	Lifetime'),
(7090, 47258, 'DDR4', 'ModelMP600 ELITE BrandCorsair specification Random Write (up to)1,000,000 IOPS Random Read (up to)1,000,000 IOPS Sequential Write (up to)6,200 MB/s Sequential Read (up to)7,000 MB/s Technology3D TLC ขนาด SSD22 x 80 mm ความจุ1.00 TB interface connector InterfacePCIe 4.0');

-- --------------------------------------------------------

--
-- Table structure for table `ssd`
--

CREATE TABLE `ssd` (
  `SSD_ID` int(11) NOT NULL,
  `Device_ID` int(11) DEFAULT NULL,
  `SSD_Type` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ssd`
--

INSERT INTO `ssd` (`SSD_ID`, `Device_ID`, `SSD_Type`, `details`) VALUES
(2743, 47192, 'M.2 NVMe', '• 1 TB • Sequential Read (up to) 7,450 MB/s • Sequential Write (up to) 6,900 MB/s • PCIe Gen 4 x 4'),
(2744, 47193, 'M.2 NVMe	\n', 'BrandCrucial specification Random Write (up to)- IOPS Random Read (up to)- IOPS Sequential Write (up to)3600 MB/s Sequential Read (up to)5000 MB/s Technology3D NAND ขนาด SSD22 x 80 mm ความจุ1.00 TB'),
(2747, 47196, 'M.2 NVMe	\n', 'Brand KINGSTON Form Factor M.2 2280 Capacity	1TB Interface	PCI Express 4.0 Read Speed	6,000 MB/s Write Speed 4,000 MB/s'),
(2748, 47197, 'M.2 NVMe	\n', '• Capacity : 1 TB • Read speed (up to) : 7,150 MB/s • Write speed (up to) : 6,300 MB/s • Interface : PCIe Gen 4x4 / 5x2'),
(2749, 47198, 'M.2 NVMe	\n', 'BrandWD specification Random Write (up to)1,100,000 IOPS Random Read (up to)800,000 IOPS Sequential Write (up to)6,300 MB/s Sequential Read (up to)7,300 MB/s Technology- ขนาด SSD22 x 80 mm ความจุ1.00 TB'),
(2750, 47199, 'M.2 NVMe	\n', 'BrandSamsung specification Random Write (up to)2,600,000 IOPS Random Read (up to)1,850,000 IOPS Sequential Write (up to)13,300 MB/s Sequential Read (up to)14,700 MB/s TechnologySamsung V-NAND TLC ขนาด SSD22 x 80 mm ความจุ1.00 TB'),
(2751, 47200, 'M.2 NVMe	\n', 'BrandKlevv specification Random Write (up to)650K IOPS Random Read (up to)625K IOPS Sequential Write (up to)4800 MB/s Sequential Read (up to)5000 MB/s TechnologyStrictly-selected 3D TLC NAND Flash ขนาด SSD22 x 80 ความจุ1.00 TB'),
(2752, 47201, 'M.2 NVMe	\n', 'BrandWD specification Random Write (up to)800,000 IOPS Random Read (up to)740,000 IOPS Sequential Write (up to)4,900 MB/s Sequential Read (up to)5,150 MB/s Technology- ขนาด SSD22 x 80 mm ความจุ1.00 TB'),
(2753, 47202, 'M.2 NVMe	\n', 'BrandWD specification Random Write (up to)1,100,000 IOPS Random Read (up to)800,000 IOPS Sequential Write (up to)6,300 MB/s Sequential Read (up to)7,300 MB/s Technology- ขนาด SSD22 x 80 mm ความจุ1.00 TB'),
(2754, 47203, 'M.2 NVMe	\n', 'BrandWD specification Random Write (up to)1,100,000 IOPS Random Read (up to)800,000 IOPS Sequential Write (up to)6,300 MB/s Sequential Read (up to)7,300 MB/s Technology- ขนาด SSD22 x 80 mm ความจุ1.00 TB'),
(2755, 47204, 'M.2 NVMe	\n', 'BrandWD specification Random Write (up to)750,000 IOPS Random Read (up to)450,000 IOPS Sequential Write (up to)3,600 MB/s Sequential Read (up to)4,000 MB/s TechnologyWDC TLC ขนาด SSD22 x 80 mm ความจุ500.00 GB'),
(2756, 47205, 'M.2 NVMe	\n', 'BrandSamsung specification Random Write (up to)1,000,000 IOPS Random Read (up to)1,000,000 IOPS Sequential Write (up to)5,000 MB/s Sequential Read (up to)7,000 MB/s TechnologySamsung V-NAND 3-bit MLC ขนาด SSD22 x 80 mm ความจุ1.00 TB'),
(2757, 47206, 'M.2 NVMe	\n', 'BrandSamsung specification Random Write (up to)550,000 IOPS Random Read (up to)250,000 IOPS Sequential Write (up to)2,300 MB/s Sequential Read (up to)3,500 MB/s TechnologyV-NAND ขนาด SSD22 x 80 mm ความจุ250.00 GB'),
(2758, 47207, 'M.2 NVMe	\n', 'BrandPatriot specification Random Write (up to)260,000 IOPS Random Read (up to)290,000 IOPS Sequential Write (up to)1,100 MB/s Sequential Read (up to)1,700 MB/s Technology- ขนาด SSD22 x 80 mm ความจุ512.00 GB'),
(2759, 47208, 'M.2 NVMe	\n', 'Capacity : 1TB Interface : PCIe Gen3 x4 NVMe Form Factor : M.2 2280 Sequential Read : Up to 3,500 MB/s Sequential Write : Up to 3,000 MB/s');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `created_at`) VALUES
(2, 'admin', 'admin@gmail.com', '$2b$10$A1cG2ZyLxIzOyL8qnaXqoOwtvlUEFXJCFQLh.XL82vJyzUqDXuIYK', 'admin', '2025-09-04 20:57:36'),
(3, 'gg', 'gg@gmail.com', '$2b$10$uOlqG9K2.sFHvQubDewJAuZXpRW0HlzEGSB438I0zKfH/RGdKiKqi', 'user', '2025-09-05 00:06:33'),
(4, 'df', '11@gmail.com', '$2b$10$HKCffWx.lMJ4V8WiacKvzO3esyN0PlxM/uRWNQ9Uw.EQA/60XWNxi', 'user', '2025-10-06 15:05:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cooler`
--
ALTER TABLE `cooler`
  ADD PRIMARY KEY (`cooler_ID`),
  ADD KEY `Device_ID` (`Device_ID`);

--
-- Indexes for table `cpu`
--
ALTER TABLE `cpu`
  ADD PRIMARY KEY (`CPU_ID`),
  ADD KEY `Device_ID` (`Device_ID`),
  ADD KEY `idx_cpu_socket` (`socket`);

--
-- Indexes for table `device`
--
ALTER TABLE `device`
  ADD PRIMARY KEY (`Device_ID`);

--
-- Indexes for table `gpu`
--
ALTER TABLE `gpu`
  ADD PRIMARY KEY (`GPU_ID`),
  ADD KEY `Device_ID` (`Device_ID`);

--
-- Indexes for table `harddisk`
--
ALTER TABLE `harddisk`
  ADD PRIMARY KEY (`harddisk_ID`),
  ADD KEY `Device_ID` (`Device_ID`);

--
-- Indexes for table `mainboard`
--
ALTER TABLE `mainboard`
  ADD PRIMARY KEY (`mainboard_ID`),
  ADD KEY `Device_ID` (`Device_ID`);

--
-- Indexes for table `pc_case`
--
ALTER TABLE `pc_case`
  ADD PRIMARY KEY (`case_ID`),
  ADD KEY `Device_ID` (`Device_ID`);

--
-- Indexes for table `power`
--
ALTER TABLE `power`
  ADD PRIMARY KEY (`power_ID`),
  ADD KEY `Device_ID` (`Device_ID`);

--
-- Indexes for table `preset_builds`
--
ALTER TABLE `preset_builds`
  ADD PRIMARY KEY (`preset_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_order` (`display_order`);

--
-- Indexes for table `preset_build_items`
--
ALTER TABLE `preset_build_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `idx_preset` (`preset_id`),
  ADD KEY `idx_device` (`device_id`),
  ADD KEY `idx_component` (`component_type`);

--
-- Indexes for table `ram`
--
ALTER TABLE `ram`
  ADD PRIMARY KEY (`RAM_ID`),
  ADD KEY `Device_ID` (`Device_ID`);

--
-- Indexes for table `ssd`
--
ALTER TABLE `ssd`
  ADD PRIMARY KEY (`SSD_ID`),
  ADD KEY `Device_ID` (`Device_ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cooler`
--
ALTER TABLE `cooler`
  MODIFY `cooler_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4643;

--
-- AUTO_INCREMENT for table `cpu`
--
ALTER TABLE `cpu`
  MODIFY `CPU_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1966;

--
-- AUTO_INCREMENT for table `device`
--
ALTER TABLE `device`
  MODIFY `Device_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47264;

--
-- AUTO_INCREMENT for table `gpu`
--
ALTER TABLE `gpu`
  MODIFY `GPU_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7131;

--
-- AUTO_INCREMENT for table `harddisk`
--
ALTER TABLE `harddisk`
  MODIFY `harddisk_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=544;

--
-- AUTO_INCREMENT for table `mainboard`
--
ALTER TABLE `mainboard`
  MODIFY `mainboard_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9940;

--
-- AUTO_INCREMENT for table `pc_case`
--
ALTER TABLE `pc_case`
  MODIFY `case_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8434;

--
-- AUTO_INCREMENT for table `power`
--
ALTER TABLE `power`
  MODIFY `power_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4267;

--
-- AUTO_INCREMENT for table `preset_builds`
--
ALTER TABLE `preset_builds`
  MODIFY `preset_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `preset_build_items`
--
ALTER TABLE `preset_build_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `ram`
--
ALTER TABLE `ram`
  MODIFY `RAM_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7091;

--
-- AUTO_INCREMENT for table `ssd`
--
ALTER TABLE `ssd`
  MODIFY `SSD_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2760;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cooler`
--
ALTER TABLE `cooler`
  ADD CONSTRAINT `cooler_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);

--
-- Constraints for table `cpu`
--
ALTER TABLE `cpu`
  ADD CONSTRAINT `cpu_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);

--
-- Constraints for table `gpu`
--
ALTER TABLE `gpu`
  ADD CONSTRAINT `gpu_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);

--
-- Constraints for table `harddisk`
--
ALTER TABLE `harddisk`
  ADD CONSTRAINT `harddisk_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);

--
-- Constraints for table `mainboard`
--
ALTER TABLE `mainboard`
  ADD CONSTRAINT `mainboard_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);

--
-- Constraints for table `pc_case`
--
ALTER TABLE `pc_case`
  ADD CONSTRAINT `pc_case_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);

--
-- Constraints for table `power`
--
ALTER TABLE `power`
  ADD CONSTRAINT `power_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);

--
-- Constraints for table `preset_build_items`
--
ALTER TABLE `preset_build_items`
  ADD CONSTRAINT `preset_build_items_ibfk_1` FOREIGN KEY (`preset_id`) REFERENCES `preset_builds` (`preset_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `preset_build_items_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `device` (`Device_ID`) ON DELETE CASCADE;

--
-- Constraints for table `ram`
--
ALTER TABLE `ram`
  ADD CONSTRAINT `ram_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);

--
-- Constraints for table `ssd`
--
ALTER TABLE `ssd`
  ADD CONSTRAINT `ssd_ibfk_1` FOREIGN KEY (`Device_ID`) REFERENCES `device` (`Device_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
