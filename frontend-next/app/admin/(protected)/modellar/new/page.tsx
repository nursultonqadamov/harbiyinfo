import { saveModel3D } from "@/lib/admin/actions";
import Model3DForm from "@/components/admin/Model3DForm";
import styles from "@/components/admin/admin.module.css";

export default function NewModel3DPage() {
  return (
    <div>
      <h1 className={styles.pageTitle} style={{ marginBottom: 24 }}>
        Yangi 3D model
      </h1>
      <Model3DForm action={saveModel3D.bind(null, null)} />
    </div>
  );
}
