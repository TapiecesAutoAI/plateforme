export type ClientIdentity = {
  loginEmail: string;
  customerId: string;
};

const CLIENT_IDENTITIES: ClientIdentity[] = [
  {
    loginEmail: "client@tpa.be",
    customerId: "C2",
  },
];

export function resolveCustomerIdByLoginEmail(
  email: string,
): string | null {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const identity =
    CLIENT_IDENTITIES.find(
      item =>
        item.loginEmail
          .trim()
          .toLowerCase() ===
        normalizedEmail,
    );

  return identity?.customerId ?? null;
}