import type {
  DiagnosticSession,
} from "./sessionTypes";

export class SessionStore {
  private readonly sessions =
    new Map<
      string,
      DiagnosticSession
    >();

  public save(
    session: DiagnosticSession,
  ): void {
    this.sessions.set(
      session.id,
      session,
    );
  }

  public get(
    sessionId: string,
  ): DiagnosticSession | null {
    return (
      this.sessions.get(
        sessionId,
      ) ?? null
    );
  }

  public has(
    sessionId: string,
  ): boolean {
    return this.sessions.has(
      sessionId,
    );
  }

  public delete(
    sessionId: string,
  ): boolean {
    return this.sessions.delete(
      sessionId,
    );
  }

  public clear(): void {
    this.sessions.clear();
  }
}

export const diagnosticSessionStore =
  new SessionStore();
