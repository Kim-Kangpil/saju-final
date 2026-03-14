"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage({
  params,
}: {
  params?: Promise<Record<string, string | string[]>>;
}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();

    useEffect(() => {
        router.replace('/home');
    }, [router]);

    return null;
}