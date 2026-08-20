import type {
  KnowledgeDomain,
} from "./KnowledgeLoader";

import type {
  KnowledgePackage,
} from "./knowledgeTypes";

export class KnowledgeRegistry {
  private readonly packages =
    new Map<
      KnowledgeDomain,
      KnowledgePackage
    >();

  public register(
    knowledgePackage:
      KnowledgePackage,
  ): void {
    this.packages.set(
      knowledgePackage.domain as KnowledgeDomain,
      knowledgePackage,
    );
  }

  public get(
    domain: KnowledgeDomain,
  ): KnowledgePackage | null {
    return (
      this.packages.get(
        domain,
      ) ?? null
    );
  }

  public has(
    domain: KnowledgeDomain,
  ): boolean {
    return this.packages.has(
      domain,
    );
  }

  public list():
    KnowledgePackage[] {
    return [
      ...this.packages.values(),
    ];
  }

  public clear(): void {
    this.packages.clear();
  }
}
