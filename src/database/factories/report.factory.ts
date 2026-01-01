import { faker } from '@faker-js/faker';
import { Report } from '../../reports/report.entity';

export class ReportFactory {
  /**
   * Generate a single report
   */
  static create(userId: number, overrides?: Partial<Report>): Partial<Report> {
    const makes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Tesla', 'Mercedes', 'Audi', 'Nissan'];
    const make = faker.helpers.arrayElement(makes);

    return {
      approved: faker.datatype.boolean(),
      price: faker.number.int({ min: 5000, max: 80000 }),
      make: make,
      model: this.getModelForMake(make),
      year: faker.number.int({ min: 2015, max: 2024 }),
      lng: faker.location.longitude(),
      lat: faker.location.latitude(),
      mileage: faker.number.int({ min: 0, max: 200000 }),
      user: { id: userId } as any,
      ...overrides,
    };
  }

  /**
   * Generate multiple reports
   */
  static createMany(userId: number, count: number, overrides?: Partial<Report>): Partial<Report>[] {
    const reports: Partial<Report>[] = [];
    for (let i = 0; i < count; i++) {
      reports.push(this.create(userId, overrides));
    }
    return reports;
  }

  /**
   * Get realistic models for each make
   */
  private static getModelForMake(make: string): string {
    const models: Record<string, string[]> = {
      Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma'],
      Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
      Ford: ['F-150', 'Mustang', 'Explorer', 'Escape', 'Ranger'],
      BMW: ['3 Series', '5 Series', 'X3', 'X5', 'M3'],
      Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
      Mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
      Audi: ['A4', 'A6', 'Q5', 'Q7', 'A3'],
      Nissan: ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Maxima'],
    };

    return faker.helpers.arrayElement(models[make] || ['Unknown']);
  }
}