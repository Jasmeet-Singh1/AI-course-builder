"use client";

import { Button } from "../../components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Header() {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background p-5 shadow-sm">
      <Image src={"/logo.svg"} width={50} height={100} alt="logo" />
      <Button asChild>
        <Link href="/dashboard">Get Started</Link>
      </Button>
    </div>
  );
}

export default Header;
