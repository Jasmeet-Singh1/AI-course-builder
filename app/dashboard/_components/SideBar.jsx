"use client";

import { Progress } from "../../../components/ui/progress";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  HiOutlineHome,
  HiOutlineSquare3Stack3D,
  HiOutlineShieldCheck,
  HiOutlinePower,
} from "react-icons/hi2";

function SideBar() {
  const { signOut } = useClerk();
  const [courseCount, setCourseCount] = useState(0);
  const menu = [
    { name: "Home", icon: <HiOutlineHome />, path: "/dashboard" },
    {
      name: "Explore",
      icon: <HiOutlineSquare3Stack3D />,
      path: "/dashboard/explore",
    },
    {
      name: "Upgrade",
      icon: <HiOutlineShieldCheck />,
      path: "/dashboard/upgrade",
    },
    {
      name: "Logout",
      icon: <HiOutlinePower />,
      action: "logout",
    },
  ];

  const path = usePathname();

  useEffect(() => {
    fetch("/api/courses")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        setCourseCount(data.courses?.length || 0);
      })
      .catch(() => {});
  }, [path]);

  return (
    <div className="fixed left-0 top-0 z-10 h-full w-64 bg-sidebar border-r border-sidebar-border p-5 shadow-md">
      <Image src={"/logo.svg"} width={50} height={100} alt="logo" />
      <hr className="my-5" />
      <ul>
        {menu.map((item) => {
          const className = `flex items-center gap-2 text-gray-600 p-3 cursor-pointer hover:bg-gray-100 hover:text-black rounded-lg mb-3 ${item.path == path && "bg-gray-200 text-black"}`;
          const content = (
            <>
              <div className="text-3xl">{item.icon}</div>
              <h2>{item.name}</h2>
            </>
          );

          if (item.action === "logout") {
            return (
              <li key={item.name}>
                <button
                  type="button"
                  className={`${className} w-full text-left`}
                  onClick={() => signOut({ redirectUrl: "/" })}
                >
                  {content}
                </button>
              </li>
            );
          }

          return (
            <li key={item.name}>
              <Link href={item.path} className={className}>
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="absolute bottom-10 w-[80%]">
        <Progress value={Math.min(courseCount, 5) * 20} />
        <h2 className="text-sm my-2">
          {courseCount} {courseCount === 1 ? "course" : "courses"} saved
        </h2>
        <h2 className="text-xs text-gray-500">
          Saved to the Google account you signed in with
        </h2>
      </div>
    </div>
  );
}

export default SideBar;
