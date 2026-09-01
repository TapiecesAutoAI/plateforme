import type {
  ComplaintClarificationResult,
} from "./ComplaintClarificationBuilder";

export type PendingComplaintClarification = {
  sessionId:
    string;

  clarification:
    ComplaintClarificationResult;

  createdAt:
    number;

  clarificationToken:
    string;
};

export class PendingComplaintClarificationStore {

  private readonly records =
    new Map<
      string,
      PendingComplaintClarification
    >();

  save(
    sessionId:
      string,
    clarification:
      ComplaintClarificationResult,
  ): void {

    if (
      !clarification.required ||
      clarification.items.length === 0
    ) {
      this.records.delete(
        sessionId,
      );

      return;
    }

    this.records.set(
      sessionId,
      {
        sessionId,

        clarification,

        createdAt:
          Date.now(),

        clarificationToken:
          crypto.randomUUID(),
      },
    );
  }

  update(
    sessionId:
      string,

    clarification:
      ComplaintClarificationResult,
  ): boolean {

    const existing =
      this.records.get(
        sessionId,
      );

    if (!existing) {
      return false;
    }

    if (
      !clarification.required ||
      clarification.items.length === 0
    ) {
      this.records.delete(
        sessionId,
      );

      return true;
    }

    this.records.set(
      sessionId,
      {
        ...existing,

        clarification,

        clarificationToken:
          crypto.randomUUID(),
      },
    );

    return true;
  }

  get(
    sessionId:
      string,
  ): PendingComplaintClarification | null {

    return (
      this.records.get(
        sessionId,
      ) ??
      null
    );
  }

  has(
    sessionId:
      string,
  ): boolean {

    return this.records.has(
      sessionId,
    );
  }

  clear(
    sessionId:
      string,
  ): void {

    this.records.delete(
      sessionId,
    );
  }
}

export const pendingComplaintClarificationStore =
  new PendingComplaintClarificationStore();