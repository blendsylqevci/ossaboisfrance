export type PlatformHealthStatus = "ok" | "error";

export type PlatformHealthResult = {
  ok: boolean;
  checks: {
    database: PlatformHealthStatus;
    storage: PlatformHealthStatus;
  };
  checkedAt: string;
};

type PlatformHealthChecks = {
  database: () => Promise<void>;
  storage: () => Promise<void>;
};

type PlatformHealthOptions = {
  timeoutMs?: number;
  onError?: (name: keyof PlatformHealthChecks, error: unknown) => void;
};

async function runWithTimeout(
  name: keyof PlatformHealthChecks,
  check: () => Promise<void>,
  timeoutMs: number
): Promise<PlatformHealthStatus> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${name} health check timed out`)),
          timeoutMs
        );
      }),
    ]);
    return "ok";
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function runPlatformHealthChecks(
  checks: PlatformHealthChecks,
  options: PlatformHealthOptions = {}
): Promise<PlatformHealthResult> {
  const timeoutMs = options.timeoutMs ?? 6_000;

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError("Health check timeout must be a positive safe integer");
  }

  const run = async (
    name: keyof PlatformHealthChecks
  ): Promise<PlatformHealthStatus> => {
    try {
      return await runWithTimeout(name, checks[name], timeoutMs);
    } catch (error) {
      options.onError?.(name, error);
      return "error";
    }
  };

  const [database, storage] = await Promise.all([
    run("database"),
    run("storage"),
  ]);

  return {
    ok: database === "ok" && storage === "ok",
    checks: { database, storage },
    checkedAt: new Date().toISOString(),
  };
}
