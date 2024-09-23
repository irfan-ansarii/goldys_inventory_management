import React from "react";
import { getUsers } from "@/query/users";
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/custom-ui/avatar";
import UserActions from "./user-actions";
import UserPopup from "@/app/(admin)/contacts/components/user-popup";

const UsersPage = async () => {
  const { data } = await getUsers({ roles: ["admin", "user"] });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <CardTitle className="text-lg">Users</CardTitle>
        <UserPopup
          defaultRoles={[
            { label: "User", value: "user" },
            { label: "Admin", value: "admin" },
          ]}
        >
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" /> Add User
          </Button>
        </UserPopup>
      </div>
      <div className="divide-y">
        {data.map((user) => (
          <div key={user.id} className="py-2 first:pt-0 last:pb-0">
            <div className="flex gap-2 md:gap-4 items-center overflow-hidden">
              <Avatar src={user.name} />
              <div className="space-y-1 overflow-hidden">
                <h2 className="font-medium text-sm truncate">{user.name}</h2>
                <div className="text-muted-foreground flex flex-col md:flex-row md:items-center text-sm md:gap-2">
                  {user.phone && (
                    <p className="truncate leading-tight">{user.phone}</p>
                  )}
                  {user.email && (
                    <>
                      <p className="hidden md:inline-block">▪</p>
                      <p className="truncate leading-tight">{user.email}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="ml-auto flex gap-2 items-center">
                <Badge className="capitalize">{user.role}</Badge>
                <UserActions user={user} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
