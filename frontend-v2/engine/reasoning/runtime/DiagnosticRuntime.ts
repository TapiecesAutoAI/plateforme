import {
  DiagnosticKernel,
} from "../kernel/DiagnosticKernel";

export interface RuntimeStatistics {

  startedAt:
    string;

  executions:
    number;

  averageExecutionTimeMs:
    number;

  lastExecutionTimeMs:
    number;

}

export class DiagnosticRuntime {

  private readonly kernel =
    new DiagnosticKernel();

  private executions =
    0;

  private totalExecutionTime =
    0;

  private readonly startedAt =
    new Date().toISOString();

  public execute(
    input: any,
  ) {

    const started =
      performance.now();

    const result =
      this.kernel.execute(
        input,
      );

    const elapsed =
      performance.now() -
      started;

    this.executions++;

    this.totalExecutionTime +=
      elapsed;

    return {

      result,

      runtime:
        this.statistics(
          elapsed,
        ),

    };

  }

  public statistics(
    lastExecutionTimeMs = 0,
  ): RuntimeStatistics {

    return {

      startedAt:
        this.startedAt,

      executions:
        this.executions,

      averageExecutionTimeMs:
        this.executions === 0

          ? 0

          : Number(

              (

                this.totalExecutionTime /

                this.executions

              ).toFixed(

                2,

              ),

            ),

      lastExecutionTimeMs:
        Number(

          lastExecutionTimeMs.toFixed(

            2,

          ),

        ),

    };

  }

}
