"use client";

import { useState } from "react";
import { fieldInputClassName } from "./application-fields";
import type { Platform } from "@/app/generated/prisma/client";

export const NEW_PLATFORM_VALUE = "__new__";

export default function PlatformSelect({
  platforms,
  defaultValue,
}: {
  platforms: Platform[];
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <select
        name="platformId"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={fieldInputClassName}
      >
        <option value="">—</option>
        {platforms.map((platform) => (
          <option key={platform.id} value={platform.id}>
            {platform.name}
          </option>
        ))}
        <option value={NEW_PLATFORM_VALUE}>+ Add new platform…</option>
      </select>
      {value === NEW_PLATFORM_VALUE && (
        <input
          name="newPlatformName"
          placeholder="New platform name"
          required
          className={`${fieldInputClassName} mt-2`}
        />
      )}
    </div>
  );
}
