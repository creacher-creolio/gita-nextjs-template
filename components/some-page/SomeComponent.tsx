"use client";

import { useSomeHook } from "@/hooks/some-page/useSomeHook";

export default function SomeComponent() {
    const { someData } = useSomeHook();

    return <div className="">{someData}</div>;
}
