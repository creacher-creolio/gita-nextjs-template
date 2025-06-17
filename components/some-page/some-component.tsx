"use client";

import { SomeHook } from "@/hooks/some-page/some-hook";

export default function SomeComponent() {
    const { someData } = SomeHook();

    return <div className="">{someData}</div>;
}
