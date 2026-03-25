import { AdminE2eRunner } from "./admin-e2e-runner";

export default function AdminTestPage() {
  const secret = process.env.DB_INIT_SECRET ?? "";
  return (
    <div style={{ maxWidth: 980 }}>
      <AdminE2eRunner secret={secret} />
    </div>
  );
}

