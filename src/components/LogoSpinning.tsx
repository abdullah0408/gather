"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LogoSpinning({ size }: { size?: number } = {}) {
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpinning(false);
    }, 2000); // Animation duration is 2s

    return () => clearTimeout(timer);
  }, []);

  return (
    <Link href="/">
      <Image
        src="/logo.png"
        alt="Gather logo"
        width={size || 40}
        height={size || 40}
        className={isSpinning ? "logo-spin" : ""}
      />
    </Link>
  );
}
