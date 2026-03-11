"use client";

import { Progress } from "../../../components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  HiOutlineHome,
  HiOutlineSquare3Stack3D,
  HiOutlineShieldCheck,
  HiOutlinePower,
} from "react-icons/hi2";

function SideBar() {
  const menu = [
    { id: 1, name: "Home", icon: <HiOutlineHome />, path: "/dashboard" },
    {
      id: 1,
      name: "Exlpore",
      icon: <HiOutlineSquare3Stack3D />,
      path: "/dashboard/explore",
    },
    {
      id: 1,
      name: "Upgrade",
      icon: <HiOutlineShieldCheck />,
      path: "/dashboard/upgrade",
    },
    {
      id: 1,
      name: "Logout",
      icon: <HiOutlinePower />,
      path: "/dashboard/logout",
    },
  ];

  const path = usePathname();
  return (
    <div className="fixed left-0 top-0 z-10 h-full w-64 bg-sidebar border-r border-sidebar-border p-5 shadow-md">
      <Image src={"/logo.svg"} width={50} height={100} />
      <hr className="my-5" />
      <ul>
        {menu.map((item) => {
          return (
            <Link href={item.path}>
              <div
                className={`flex items-center gap-2 text-gray-600 p-3 cursor-pointer hover:bg-gray-100 hover:text-black rounded-lg mb-3 ${item.path == path && "bg-gray-200 text-black"}`}
              >
                <div className="text-3xl">{item.icon}</div>
                <h2>{item.name}</h2>
              </div>
            </Link>
          );
        })}
      </ul>
      <div className="absolute bottom-10 w-[80%]">
        <Progress value={33} />
        <h2 className="text-sm my-2">2 out of 5 Courses completed</h2>
        <h2 className="text-xs text-gray-500">
          Upgrade your plan for unlimited course generate
        </h2>
      </div>
    </div>
  );
}

export default SideBar;
