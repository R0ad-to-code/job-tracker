import { createPlatform } from "../actions";
import PlatformFields from "../platform-fields";

export default function NewPlatformPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">New platform</h1>
      <form action={createPlatform} className="mt-6 space-y-4">
        <PlatformFields />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Create platform
        </button>
      </form>
    </div>
  );
}
