import { BugReport } from '../entities/BugReport';

export interface BugReportRepository {
  submit(bugReport: BugReport): Promise<{ success: boolean; id?: string; error?: string }>;
}
