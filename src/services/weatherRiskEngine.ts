import { WeatherRecord, ZoneRisk } from '../types';

export const CURRENT_WEATHER_DEFAULT: WeatherRecord = {
  temperatureC: 38.5,
  humidityPercent: 58,
  heatIndexC: 43.2,
  condition: 'Heatwave Warning',
  rainProbabilityPercent: 12,
  windSpeedKmh: 14,
  uvIndex: 9,
  lastUpdated: new Date().toISOString(),
  advisoryNote: 'Elevated urban heat island index. Water distribution pipeline thermal stress elevated by 28%. Increased consumer peak draw expected between 11:00 AM and 5:00 PM.',
};

export function calculateZoneRiskMetrics(
  zone: {
    id: string;
    name: string;
    coordinates: [number, number];
    radiusMeters: number;
    population: number;
    infrastructureAgeYears: number;
    pipeFailureHistory: number;
    baseWaterAvailability: number;
  },
  weather: WeatherRecord,
  activeIncidentCount: number
): ZoneRisk {
  // 1. Heat Risk calculation
  let heatRiskScore = 30;
  if (weather.heatIndexC >= 42) heatRiskScore = 90;
  else if (weather.heatIndexC >= 38) heatRiskScore = 75;
  else if (weather.heatIndexC >= 32) heatRiskScore = 55;
  else heatRiskScore = 30;

  // Urban density modifier
  if (zone.population > 80000) heatRiskScore = Math.min(100, heatRiskScore + 10);

  let heatRiskLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
  if (heatRiskScore >= 80) heatRiskLevel = 'EXTREME';
  else if (heatRiskScore >= 60) heatRiskLevel = 'HIGH';
  else if (heatRiskScore >= 40) heatRiskLevel = 'MODERATE';
  else heatRiskLevel = 'LOW';

  // 2. Water Risk calculation
  // Factors: lower water availability + high incidents + high infrastructure age
  const adjustedAvailability = Math.max(
    15,
    zone.baseWaterAvailability - activeIncidentCount * 4 - (weather.heatIndexC > 40 ? 8 : 2)
  );

  let waterRiskScore = 100 - adjustedAvailability;
  waterRiskScore += (zone.pipeFailureHistory / 15) * 20;
  waterRiskScore = Math.min(100, Math.max(10, Math.round(waterRiskScore)));

  let waterRiskLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
  if (waterRiskScore >= 80) waterRiskLevel = 'EXTREME';
  else if (waterRiskScore >= 60) waterRiskLevel = 'HIGH';
  else if (waterRiskScore >= 40) waterRiskLevel = 'MODERATE';
  else waterRiskLevel = 'LOW';

  // 3. Infrastructure Risk Score (0-100)
  const infraScore = Math.min(
    100,
    Math.round((zone.infrastructureAgeYears / 25) * 50 + (zone.pipeFailureHistory / 12) * 50)
  );

  // 4. Overall Combined Climate & Water Risk Score
  const overallRiskScore = Math.round(
    heatRiskScore * 0.35 + waterRiskScore * 0.45 + infraScore * 0.2
  );

  let overallRiskLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
  if (overallRiskScore >= 80) overallRiskLevel = 'EXTREME';
  else if (overallRiskScore >= 60) overallRiskLevel = 'HIGH';
  else if (overallRiskScore >= 40) overallRiskLevel = 'MODERATE';
  else overallRiskLevel = 'LOW';

  let primaryVulnerability = 'Elevated daytime thermal stress & peak consumption draw';
  if (zone.pipeFailureHistory >= 8) {
    primaryVulnerability = 'Aging ductile-iron piping vulnerable to pressure surges under peak heat';
  } else if (activeIncidentCount >= 3) {
    primaryVulnerability = 'Active leak cluster compromising network distribution pressure';
  } else if (adjustedAvailability < 60) {
    primaryVulnerability = 'Reservoir feed capacity strained; high citizen density';
  }

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    organizationId: 'org-city-corp',
    coordinates: zone.coordinates,
    radiusMeters: zone.radiusMeters,
    temperatureC: weather.temperatureC,
    humidityPercent: weather.humidityPercent,
    heatIndexC: weather.heatIndexC,
    rainProbabilityPercent: weather.rainProbabilityPercent,
    waterAvailabilityPercent: adjustedAvailability,
    populationDensity: zone.population,
    historicalIncidentCount: zone.pipeFailureHistory + 8,
    activeIncidentCount,
    infrastructureRiskScore: infraScore,
    heatRiskLevel,
    waterRiskLevel,
    overallRiskLevel,
    overallRiskScore,
    primaryVulnerability,
  };
}
