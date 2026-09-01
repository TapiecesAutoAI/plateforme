import type {
  SemanticComplaintProvider,
  SemanticComplaintProviderRequest,
  SemanticComplaintProviderResponse,
} from "./SemanticComplaintProvider";

const EMPTY_SEMANTIC_RESPONSE:
  SemanticComplaintProviderResponse = {
    evidences: [],
  };

export type SafeSemanticComplaintProviderOptions = {
  timeoutMs:
    number;
};

export class SafeSemanticComplaintProvider
  implements SemanticComplaintProvider {

  public constructor(
    private readonly provider:
      SemanticComplaintProvider,

    private readonly options:
      SafeSemanticComplaintProviderOptions,
  ) {}

  public async interpretComplaint(
    request:
      SemanticComplaintProviderRequest,
  ): Promise<unknown> {

    try {

      return await Promise.race([
        this.provider.interpretComplaint(
          request,
        ),

        this.createTimeoutFallback(),
      ]);

    } catch {

      return {
        ...EMPTY_SEMANTIC_RESPONSE,
      };
    }
  }

  private createTimeoutFallback():
    Promise<SemanticComplaintProviderResponse> {

    return new Promise(
      resolve => {

        setTimeout(
          () => {
            resolve({
              ...EMPTY_SEMANTIC_RESPONSE,
            });
          },
          this.options.timeoutMs,
        );

      },
    );
  }
}