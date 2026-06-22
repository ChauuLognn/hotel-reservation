package com.hotelreservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@EnableScheduling
@SpringBootApplication(scanBasePackages = {"com.hotelreservation"})
@EntityScan(basePackages = {"com.hotelreservation.modules"})
@EnableJpaRepositories(basePackages = {"com.hotelreservation.modules"})
public class HotelReservationApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(HotelReservationApplication.class, args);
	}

	private static void loadEnv() {
		File envFile = new File(".env");
		if (!envFile.exists()) {
			File exampleFile = new File(".env.example");
			if (exampleFile.exists()) {
				try {
					Files.copy(exampleFile.toPath(), envFile.toPath());
					System.out.println(".env file not found. Copied from .env.example automatically.");
				} catch (Exception e) {
					System.err.println("Failed to copy .env.example to .env: " + e.getMessage());
				}
			}
		}

		if (envFile.exists()) {
			try {
				List<String> lines = Files.readAllLines(Paths.get(".env"));
				for (String line : lines) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int eqIdx = line.indexOf('=');
					if (eqIdx > 0) {
						String key = line.substring(0, eqIdx).trim();
						String value = line.substring(eqIdx + 1).trim();
						
						if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
							value = value.substring(1, value.length() - 1);
						} else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
							value = value.substring(1, value.length() - 1);
						}
						
						if (System.getenv(key) == null && System.getProperty(key) == null) {
							System.setProperty(key, value);
						}
					}
				}
			} catch (Exception e) {
				System.err.println("Failed to load .env file: " + e.getMessage());
			}
		}
	}

}
