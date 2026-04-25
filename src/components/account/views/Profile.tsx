"use client";

import {Button} from "@heroui/react";
import {UserInfo} from "@utils/api/member";

export const Profile = ({user}: { user: UserInfo }) => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-default-900">Profile</h2>
        <Button variant="flat" size="sm" radius="full">Edit Profile</Button>
      </div>

      <div className="grid gap-4 md:gap-6">
        {[
          {label: "Full Name", value: user?.nickname},
          {label: "Email Address", value: user?.email},
          {label: "Member Since", value: "2024-01-01"},
        ].map((item) => (
            <div key={item.label}
                 className="flex flex-col md:flex-row md:items-center border-b border-default-50 pb-3 md:pb-4">
              <span className="text-default-500 text-sm md:w-64">{item.label}</span>
              <span className="font-semibold text-default-800">{item.value || "N/A"}</span>
            </div>
        ))}
      </div>
    </div>
);