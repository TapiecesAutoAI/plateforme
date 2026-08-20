import type {
  InstallationFeedbackRecord,
  InstallationResult,
} from "./dataTypes";

export type InstallationSurveyInput = {
  customerId?: string;
  vehicleId: string;
  orderId: string;
  partId: string;
  diagnosticId?: string;

  installed?: boolean;

  installedBy?:
    InstallationFeedbackRecord["installedBy"];

  mileageAtInstallationKm?: number;

  result:
    InstallationResult;

  problemDisappearedImmediately?: boolean;

  additionalPartRequired?: boolean;
  additionalPartName?: string;

  satisfactionScore?: number;

  comment?: string;
};

export function createInstallationFeedback(
  input: InstallationSurveyInput,
): InstallationFeedbackRecord {

  return {
    id:
      "FB-" +
      Date.now()
        .toString(36)
        .toUpperCase(),

    customerId:
      input.customerId,

    vehicleId:
      input.vehicleId,

    orderId:
      input.orderId,

    partId:
      input.partId,

    diagnosticId:
      input.diagnosticId,

    requestedAt:
      new Date()
        .toISOString(),

    answeredAt:
      new Date()
        .toISOString(),

    installed:
      input.installed,

    installedBy:
      input.installedBy,

    mileageAtInstallationKm:
      input.mileageAtInstallationKm,

    result:
      input.result,

    problemDisappearedImmediately:
      input.problemDisappearedImmediately,

    additionalPartRequired:
      input.additionalPartRequired,

    additionalPartName:
      input.additionalPartName,

    satisfactionScore:
      input.satisfactionScore,

    comment:
      input.comment,
  };
}
