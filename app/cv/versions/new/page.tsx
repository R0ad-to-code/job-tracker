import { createCvVersion } from "../../actions";
import { fieldInputClassName } from "../../field-input";

export default function NewCvVersionPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">New CV version</h1>
      <form action={createCvVersion} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="text-muted">Label</span>
          <input
            name="label"
            required
            placeholder="e.g. PM-focused v2"
            className={fieldInputClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Notes</span>
          <input name="notes" className={fieldInputClassName} />
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Create version
        </button>
      </form>
    </div>
  );
}
