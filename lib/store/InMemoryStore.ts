import type { Assessment, HablaUser, Store } from "./Store";

/**
 * In-memory store. Used in test mode and as the local-dev default when
 * Supabase isn't configured. Persists for the life of the server process
 * (fine for the solo-tester phase; set Supabase env for durable storage).
 */
export class InMemoryStore implements Store {
  private users = new Map<string, HablaUser>();
  private assessments: Assessment[] = [];

  async getUser(id: string): Promise<HablaUser | null> {
    return this.users.get(id) ?? null;
  }

  async saveUser(user: HablaUser): Promise<void> {
    this.users.set(user.id, user);
  }

  async saveAssessment(assessment: Assessment): Promise<void> {
    this.assessments.push(assessment);
  }

  async listAssessments(userId: string): Promise<Assessment[]> {
    return this.assessments
      .filter((a) => a.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}
