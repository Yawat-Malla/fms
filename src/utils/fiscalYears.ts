export interface FiscalYear {
  id: string;
  name: string;
}

export interface DecadeYear {
  name: string;
  href: string;
}

export interface Decade {
  name: string;
  years: DecadeYear[];
}

// Helper to get the current Nepali fiscal year (same logic as Sidebar)
function getCurrentNepaliFiscalYear(): number {
  const today = new Date();
  const engYear = today.getFullYear();
  const engMonth = today.getMonth() + 1; // 0-based, so +1
  // Nepali new year is around mid-April (month 4)
  let nepaliYear = engYear + 56; // Nepali year is about 56-57 years ahead
  if (engMonth >= 4) nepaliYear += 1;
  return nepaliYear;
}

export function generateFiscalYears(): FiscalYear[] {
  const currentYear = getCurrentNepaliFiscalYear();
  const startYear = 2070;
  const fiscalYears: FiscalYear[] = [];

  // Start from currentYear and go down to 2070 (inclusive)
  for (let year = currentYear; year >= startYear; year--) {
    const nextYear = (year + 1).toString().slice(-2);
    const fiscalYear = {
      id: `${year}/${nextYear}`,
      name: `${year}/${nextYear}`
    };
    fiscalYears.push(fiscalYear);
  }

  return fiscalYears;
}

export function generateFiscalYearDecades(): Decade[] {
  const currentYear = getCurrentNepaliFiscalYear();
  const startDecade = 207; // Start from 2070s
  const decades: Decade[] = [];
  
  // Generate decades from 2070s to current decade
  for (let decade = startDecade; decade <= Math.floor(currentYear / 10); decade++) {
    const decadeYears: DecadeYear[] = [];
    const startYear = decade * 10;
    const endYear = Math.min(startYear + 9, currentYear);
    
    // Generate years for this decade
    for (let year = endYear; year >= startYear; year--) {
      if (year <= currentYear) {
        const fiscalYear = `${year}/${(year + 1).toString().slice(-2)}`;
        decadeYears.push({
          name: fiscalYear,
          href: `/files?fiscal-year=${fiscalYear}`,
        });
      }
    }
    
    decades.push({
      name: `${decade}0s`,
      years: decadeYears,
    });
  }
  
  return decades;
} 