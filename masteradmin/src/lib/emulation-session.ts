export type MasterAdminIdentity = {
  name: string;
  email: string;
  role: string;
};

export type EmulationSession = {
  posAdminId: number;
  posAdminName: string;
  posAdminEmail: string;
  originalMasterAdmin: MasterAdminIdentity;
  startedAt: string;
  returnDestination: string;
};

const EMULATION_SESSION_KEY = "master_admin_emulation_session";

function isInternalDestination(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
}

export function startEmulation(input: {
  admin: { id: number; name: string; email: string };
  originalMasterAdmin: MasterAdminIdentity;
  returnDestination: string;
}): EmulationSession {
  // TODO: Require backend authorization for the Master Admin and target account.
  // TODO: Exchange approval for a scoped, temporary support token; do not trust this browser record.
  // TODO: Enforce token expiry and revocation on the server.
  // TODO: Write an auditable server-side record for emulation start and exit.
  const session: EmulationSession = {
    posAdminId: input.admin.id,
    posAdminName: input.admin.name,
    posAdminEmail: input.admin.email,
    originalMasterAdmin: input.originalMasterAdmin,
    startedAt: new Date().toISOString(),
    returnDestination: isInternalDestination(input.returnDestination)
      ? input.returnDestination
      : "/master",
  };

  window.localStorage.setItem(EMULATION_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function readEmulationSession(): EmulationSession | null {
  try {
    const savedSession = window.localStorage.getItem(EMULATION_SESSION_KEY);
    if (!savedSession) return null;

    const session: unknown = JSON.parse(savedSession);
    if (typeof session !== "object" || session === null) return null;

    const saved = session as Record<string, unknown>;
    const masterAdmin = saved.originalMasterAdmin;
    if (
      (typeof saved.posAdminId !== "number" && typeof saved.posAdminId !== "string") ||
      typeof saved.posAdminName !== "string" ||
      typeof saved.posAdminEmail !== "string" ||
      typeof saved.startedAt !== "string" ||
      typeof saved.returnDestination !== "string" ||
      !isInternalDestination(saved.returnDestination) ||
      typeof masterAdmin !== "object" ||
      masterAdmin === null ||
      typeof (masterAdmin as Record<string, unknown>).name !== "string" ||
      typeof (masterAdmin as Record<string, unknown>).email !== "string" ||
      typeof (masterAdmin as Record<string, unknown>).role !== "string"
    ) {
      return null;
    }

    return saved as unknown as EmulationSession;
  } catch {
    return null;
  }
}

export function clearEmulationSession(): void {
  window.localStorage.removeItem(EMULATION_SESSION_KEY);
}