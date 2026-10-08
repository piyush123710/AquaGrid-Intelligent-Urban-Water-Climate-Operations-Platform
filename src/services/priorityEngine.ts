import { IncidentCategory, IncidentSeverity, PriorityBreakdown } from '../types';

export interface PriorityCalculationInput {
  category: IncidentCategory;
  severity: IncidentSeverity;
  affectedPopulation: number;
  durationHours?: number;
  criticalFacilities?: string[];
  estimatedWaterLossLitersPerDay: number;
  locationDescription?: string;
}

export function calculatePriorityScore(input: PriorityCalculationInput): PriorityBreakdown {
  // 1. Severity Factor (Max 30)
  let severityScore = 10;
  if (input.severity === 'CRITICAL') severityScore = 30;
  else if (input.severity === 'HIGH') severityScore = 22;
  else if (input.severity === 'MEDIUM') severityScore = 14;
  else if (input.severity === 'LOW') severityScore = 7;

  // 2. Population Factor (Max 25)
  // Scale based on population: >= 5000 -> 25, 2000-4999 -> 20, 1000-1999 -> 15, 200-999 -> 10, < 200 -> 5
  let populationScore = 5;
  const pop = input.affectedPopulation || 100;
  if (pop >= 4000) populationScore = 25;
  else if (pop >= 2000) populationScore = 20;
  else if (pop >= 1000) populationScore = 16;
  else if (pop >= 400) populationScore = 11;
  else populationScore = 6;

  // 3. Duration Factor (Max 20)
  // Leaks persisting over time degrade urban foundations and deplete reservoirs
  const duration = input.durationHours ?? 6;
  let durationScore = 8;
  if (duration >= 48) durationScore = 20;
  else if (duration >= 24) durationScore = 17;
  else if (duration >= 12) durationScore = 14;
  else if (duration >= 4) durationScore = 11;
  else durationScore = 6;

  // 4. Location Criticality / Critical Infrastructure (Max 20)
  // Near hospitals, schools, intensive clinics, primary metro hubs, high-density residential
  let locationScore = 4;
  const facilities = (input.criticalFacilities || []).map((f) => f.toLowerCase());
  const locDesc = (input.locationDescription || '').toLowerCase();

  const isHospital = facilities.some((f) => f.includes('hospital') || f.includes('clinic')) || locDesc.includes('hospital');
  const isSchool = facilities.some((f) => f.includes('school') || f.includes('college') || f.includes('university')) || locDesc.includes('school');
  const isIndustrialOrHub = facilities.some((f) => f.includes('transit') || f.includes('power') || f.includes('treatment')) || locDesc.includes('hub');

  if (isHospital) {
    locationScore = 20;
  } else if (isSchool || isIndustrialOrHub) {
    locationScore = 16;
  } else if (facilities.length > 0) {
    locationScore = 12;
  } else {
    locationScore = 6;
  }

  // 5. Water Loss Factor (Max 5)
  // Loss in L/day: > 25,000 L -> 5, > 15,000 L -> 4, > 8,000 L -> 3, > 2,000 L -> 2, <= 2,000 L -> 1
  let waterLossScore = 1;
  const loss = input.estimatedWaterLossLitersPerDay || 0;
  if (loss >= 20000) waterLossScore = 5;
  else if (loss >= 12000) waterLossScore = 4;
  else if (loss >= 5000) waterLossScore = 3;
  else if (loss >= 1500) waterLossScore = 2;
  else waterLossScore = 1;

  const totalScore = Math.min(100, Math.max(1, severityScore + populationScore + durationScore + locationScore + waterLossScore));

  let classification: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (totalScore >= 80) classification = 'CRITICAL';
  else if (totalScore >= 60) classification = 'HIGH';
  else if (totalScore >= 40) classification = 'MEDIUM';
  else classification = 'LOW';

  const criticalReason = isHospital
    ? 'Proximity to critical healthcare facility (City Hospital)'
    : isSchool
    ? 'Proximity to educational institution'
    : facilities.length > 0
    ? `Proximity to ${facilities.join(', ')}`
    : 'Standard municipal zone corridor';

  return {
    score: totalScore,
    classification,
    severityFactor: {
      score: severityScore,
      max: 30,
      label: `${input.severity} structural impact severity`,
    },
    populationFactor: {
      score: populationScore,
      max: 25,
      label: `~${pop.toLocaleString()} estimated individuals affected`,
    },
    durationFactor: {
      score: durationScore,
      max: 20,
      label: `Unmitigated for ~${duration}h`,
    },
    locationCriticality: {
      score: locationScore,
      max: 20,
      label: criticalReason,
    },
    waterLossFactor: {
      score: waterLossScore,
      max: 5,
      label: `${loss.toLocaleString()} L/day estimated resource depletion`,
    },
    explanation: `Calculated priority index of ${totalScore}/100. Key driver: ${input.severity} severity with ${criticalReason} affecting ~${pop.toLocaleString()} citizens.`,
  };
}
