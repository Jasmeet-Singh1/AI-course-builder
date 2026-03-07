"use client";

import { Button } from "../../components/ui/button";
import Image from "next/image";
import React from "react";

function Header() {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background p-5 shadow-sm">
      <Image src={"/logo.svg"} width={50} height={100} alt="logo" />
      <Button>Get Started</Button>
    </div>
  );
}

export default Header;
