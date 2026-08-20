export interface RoadmapTask {

  id:
    string;

  title:
    string;

  priority:
    "critical"
    | "high"
    | "medium"
    | "low";

  completed:
    boolean;

  estimatedImpact:
    number;

}

export class RoadmapEngine {

  public readonly tasks:
    RoadmapTask[] = [

      {
        id: "VIN",
        title: "Historique VIN",
        priority: "critical",
        completed: false,
        estimatedImpact: 100,
      },

      {
        id: "CASE_MEMORY",
        title: "Mémoire des réparations",
        priority: "critical",
        completed: false,
        estimatedImpact: 98,
      },

      {
        id: "SELF_LEARNING",
        title: "Auto-apprentissage",
        priority: "critical",
        completed: false,
        estimatedImpact: 97,
      },

      {
        id: "CUSTOMER_FEEDBACK",
        title: "Retour client",
        priority: "high",
        completed: false,
        estimatedImpact: 94,
      },

      {
        id: "EMAIL_AUTOMATION",
        title: "Emails automatiques",
        priority: "high",
        completed: false,
        estimatedImpact: 92,
      },

      {
        id: "SIMILAR_CASES",
        title: "Cas similaires",
        priority: "high",
        completed: false,
        estimatedImpact: 96,
      },

      {
        id: "GARAGE_MODE",
        title: "Mode garage",
        priority: "high",
        completed: false,
        estimatedImpact: 90,
      },

      {
        id: "EXPERT_MODE",
        title: "Mode expert",
        priority: "medium",
        completed: false,
        estimatedImpact: 82,
      },

      {
        id: "VOICE_DIAGNOSTIC",
        title: "Diagnostic vocal",
        priority: "medium",
        completed: false,
        estimatedImpact: 84,
      },

      {
        id: "PREDICTIVE_MAINTENANCE",
        title: "Maintenance prédictive",
        priority: "critical",
        completed: false,
        estimatedImpact: 99,
      }

    ];

  public completion(): number {

    const completed =

      this.tasks.filter(

        task =>

          task.completed,

      ).length;

    return Math.round(

      completed /

      this.tasks.length *

      100,

    );

  }

}
