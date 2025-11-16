// In-memory database for testing
class MockDatabase {
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.bugReports = new Map();
    this.analytics = new Map();
  }

  // Users
  async createUser(userData) {
    const id = this.generateId();
    const user = {
      id,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.users.set(id, user);
    return { data: user, error: null };
  }

  async getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return { data: user, error: null };
      }
    }
    return { data: null, error: null };
  }

  async getUserById(id) {
    const user = this.users.get(id);
    return { data: user || null, error: null };
  }

  // Projects
  async createProject(projectData) {
    const id = this.generateId();
    const project = {
      id,
      ...projectData,
      created_at: new Date().toISOString()
    };
    this.projects.set(id, project);
    return { data: project, error: null };
  }

  async getProjectsByUserId(userId) {
    const projects = Array.from(this.projects.values())
      .filter(project => project.user_id === userId);
    return { data: projects, error: null };
  }

  // Bug Reports
  async createBugReport(reportData) {
    const id = this.generateId();
    const report = {
      id,
      ...reportData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.bugReports.set(id, report);
    return { data: report, error: null };
  }

  async getBugReportsByProjectId(projectId) {
    const reports = Array.from(this.bugReports.values())
      .filter(report => report.project_id === projectId);
    return { data: reports, error: null };
  }

  // Analytics
  async createAnalytics(analyticsData) {
    const id = this.generateId();
    const analytics = {
      id,
      ...analyticsData,
      created_at: new Date().toISOString()
    };
    this.analytics.set(id, analytics);
    return { data: analytics, error: null };
  }

  // Utility
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Mock Supabase-like interface
  from(table) {
    return {
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: async () => {
            if (table === 'users') {
              if (column === 'email') {
                return await this.getUserByEmail(value);
              } else if (column === 'id') {
                return await this.getUserById(value);
              }
            }
            return { data: null, error: null };
          },
          limit: async (count) => {
            if (table === 'users') {
              const users = Array.from(this.users.values()).slice(0, count);
              return { data: users, error: null };
            } else if (table === 'bug_reports') {
              const reports = Array.from(this.bugReports.values()).slice(0, count);
              return { data: reports, error: null };
            }
            return { data: [], error: null };
          }
        }),
        limit: async (count) => {
          if (table === 'users') {
            const users = Array.from(this.users.values()).slice(0, count);
            return { data: users, error: null };
          } else if (table === 'bug_reports') {
            const reports = Array.from(this.bugReports.values()).slice(0, count);
            return { data: reports, error: null };
          }
          return { data: [], error: null };
        }
      }),
      // Support for complex queries with then method
      then: async (resolve) => {
        if (table === 'bug_reports') {
          const reports = Array.from(this.bugReports.values());
          // Add project names to reports
          const reportsWithProjects = reports.map(report => ({
            ...report,
            projects: { name: 'Default Project' }
          }));
          resolve({ data: reportsWithProjects, error: null });
        } else if (table === 'projects') {
          const projects = Array.from(this.projects.values());
          resolve({ data: projects, error: null });
        } else {
          resolve({ data: [], error: null });
        }
      },
      insert: (data) => ({
        select: () => ({
          single: async () => {
            if (table === 'users') {
              return await this.createUser(data);
            } else if (table === 'projects') {
              return await this.createProject(data);
            } else if (table === 'bug_reports') {
              return await this.createBugReport(data);
            } else if (table === 'analytics') {
              return await this.createAnalytics(data);
            }
            return { data: null, error: null };
          }
        })
      }),
      update: (data) => ({
        eq: (column, value) => ({
          select: async () => {
            if (table === 'bug_reports' && column === 'id') {
              const existing = this.bugReports.get(value);
              if (!existing) {
                return { data: null, error: new Error('Bug report not found') };
              }
              const updated = {
                ...existing,
                ...data
              };
              this.bugReports.set(value, updated);
              return { data: updated, error: null };
            }

            if (table === 'users' && column === 'id') {
              const existing = this.users.get(value);
              if (!existing) {
                return { data: null, error: new Error('User not found') };
              }
              const updated = {
                ...existing,
                ...data
              };
              this.users.set(value, updated);
              return { data: updated, error: null };
            }

            if (table === 'projects' && column === 'id') {
              const existing = this.projects.get(value);
              if (!existing) {
                return { data: null, error: new Error('Project not found') };
              }
              const updated = {
                ...existing,
                ...data
              };
              this.projects.set(value, updated);
              return { data: updated, error: null };
            }

            // Fallback behaviour
            return { data: { ...data, id: value }, error: null };
          }
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          select: async () => {
            if (table === 'users') {
              this.users.delete(value);
            } else if (table === 'projects') {
              this.projects.delete(value);
            } else if (table === 'bug_reports') {
              this.bugReports.delete(value);
            } else if (table === 'analytics') {
              this.analytics.delete(value);
            }
            return { data: null, error: null };
          }
        })
      })
    };
  }
}

// Create singleton instance
const mockDb = new MockDatabase();

export { mockDb as supabase };

