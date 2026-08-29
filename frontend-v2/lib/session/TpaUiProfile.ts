import type {
  TpaChannel,
  TpaSession,
} from "./TpaSession";

export type TpaUiProfile = {
  channel:
    TpaChannel;

  largeTouchTargets:
    boolean;

  showRetailPricing:
    boolean;

  showProfessionalPricing:
    boolean;

  showMargins:
    boolean;

  showTechnicalDetails:
    boolean;

  showCounterRequests:
    boolean;

  showAdminTools:
    boolean;
};

export function buildTpaUiProfile(
  session:
    TpaSession,
): TpaUiProfile {

  return {
    channel:
      session.channel,

    largeTouchTargets:
      session.channel ===
      "showroom-kiosk",

    showRetailPricing:
      session.permissions.includes(
        "pricing:retail",
      ),

    showProfessionalPricing:
      session.permissions.includes(
        "pricing:professional",
      ),

    showMargins:
      session.permissions.includes(
        "pricing:margin",
      ),

    showTechnicalDetails:
      session.permissions.includes(
        "parts:technical",
      ),

    showCounterRequests:
      session.permissions.includes(
        "request:receive-counter",
      ),

    showAdminTools:
      session.permissions.includes(
        "admin:configure",
      ),
  };
}