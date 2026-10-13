
DROP TABLE IF EXISTS audit_logs;

DROP TYPE IF EXISTS "AuditAction";

CREATE TYPE "AuditAction"
AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOCK',
    'UNLOCK',
    'TOGGLE',
    'IMPORT',
    'EXPORT'
);

CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,

    "adminId" TEXT,

    "adminEmail" TEXT NOT NULL,

    action "AuditAction" NOT NULL,

    target TEXT NOT NULL,

    reason TEXT,
    "before" TEXT,
    "after" TEXT,

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT audit_logs_admin_fkey
        FOREIGN KEY ("adminId")
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX audit_logs_admin_id_idx
    ON audit_logs ("adminId");

CREATE INDEX audit_logs_action_idx
    ON audit_logs (action);

CREATE INDEX audit_logs_created_at_idx
    ON audit_logs ("createdAt");
