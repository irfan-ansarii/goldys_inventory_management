import React from "react";
import { UserType } from "@/query/users";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Avatar from "@/components/custom-ui/avatar";
import Actions from "./actions";

const UserCard = ({ user }: { user: UserType }) => {
  return (
    <Card
      className={`hover:border-foreground transition duration-500 overflow-hidden w-full`}
    >
      <CardContent className="p-4 md:p-6 space-y-1.5">
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
            <Actions user={user} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
