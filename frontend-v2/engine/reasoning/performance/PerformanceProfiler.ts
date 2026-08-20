export interface PerformanceCounter {

  name:
    string;

  executions:
    number;

  totalMs:
    number;

  averageMs:
    number;

  maximumMs:
    number;

}

export class PerformanceProfiler {

  private readonly counters =
    new Map<
      string,
      PerformanceCounter
    >();

  public measure<T>(

    name:
      string,

    action:
      () => T,

  ): T {

    const started =
      performance.now();

    const result =
      action();

    const elapsed =
      performance.now() -
      started;

    const current =

      this.counters.get(
        name,
      ) ?? {

        name,

        executions: 0,

        totalMs: 0,

        averageMs: 0,

        maximumMs: 0,

      };

    current.executions++;

    current.totalMs +=
      elapsed;

    current.averageMs =
      Number(

        (

          current.totalMs /

          current.executions

        ).toFixed(
          3,
        ),

      );

    current.maximumMs =
      Math.max(

        current.maximumMs,

        elapsed,

      );

    this.counters.set(

      name,

      current,

    );

    return result;

  }

  public report():

    PerformanceCounter[] {

    return [

      ...this.counters.values(),

    ].sort(

      (

        left,

        right,

      ) =>

        right.totalMs -

        left.totalMs,

    );

  }

}
