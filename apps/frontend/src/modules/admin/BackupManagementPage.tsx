import { useCreateBackupMutation, useBackupsQuery, useRestoreBackupMutation } from "@/hooks/useSystemQueries";
import { useToastStore } from "@/store/toastStore";
import { downloadBackupFile } from "@/services/systemService";

export function BackupManagementPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const { data: backups } = useBackupsQuery();
  const createBackupMutation = useCreateBackupMutation();
  const restoreBackupMutation = useRestoreBackupMutation();

  async function onCreateBackup(): Promise<void> {
    try {
      await createBackupMutation.mutateAsync();
      pushToast({ type: "success", message: "Backup created successfully." });
    } catch {
      pushToast({ type: "error", message: "Backup operation failed." });
    }
  }

  async function onRestoreBackup(fileName: string): Promise<void> {
    try {
      await restoreBackupMutation.mutateAsync(fileName);
      pushToast({ type: "success", message: `Restore complete from ${fileName}.` });
    } catch {
      pushToast({ type: "error", message: `Restore failed for ${fileName}.` });
    }
  }

  async function onDownloadBackup(fileName: string): Promise<void> {
    try {
      await downloadBackupFile(fileName);
      pushToast({ type: "success", message: `Backup downloaded: ${fileName}` });
    } catch {
      pushToast({ type: "error", message: `Unable to download ${fileName}.` });
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold">Backup and Recovery</h1>
        <p className="mt-1 text-sm text-slate-500">Create and restore JSON snapshots for failure recovery workflows.</p>
      </header>

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Backup Actions</h2>
          <button
            type="button"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
            disabled={createBackupMutation.isPending}
            onClick={() => {
              void onCreateBackup();
            }}
          >
            {createBackupMutation.isPending ? "Creating..." : "Backup Now"}
          </button>
        </div>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Backup History</h2>
        <div className="mt-3 space-y-2">
          {(backups ?? []).map((backup) => (
            <div key={backup.filename} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{backup.filename}</p>
                <p className="text-xs text-slate-500">
                  {(backup.sizeBytes / 1024).toFixed(1)} KB | {new Date(backup.updatedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs"
                disabled={restoreBackupMutation.isPending}
                onClick={() => {
                  void onRestoreBackup(backup.filename);
                }}
              >
                Restore
              </button>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs"
                onClick={() => {
                  void onDownloadBackup(backup.filename);
                }}
              >
                Download
              </button>
            </div>
          ))}
          {(backups ?? []).length === 0 ? <p className="text-sm text-slate-500">No backups available.</p> : null}
        </div>
      </article>
    </section>
  );
}
