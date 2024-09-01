"use client";
import React, { useState } from "react";

import { UserType, useDeleteUser } from "@/query/users";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { EllipsisVertical, Loader, Pencil, Trash2 } from "lucide-react";

import Popup from "@/components/custom-ui/popup";
import ErrorFallback from "@/components/error-fallback";

import UserPopup from "@/app/(admin)/contacts/components/user-popup";

const UserActions = ({ user }: { user: UserType }) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const remove = useDeleteUser(user.id);

  const onRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        router.refresh();
        setOpen(false);
      },
    });
  };

  return (
    <Popup
      variant="popover"
      content={
        <div className="flex flex-col md:w-40 [&>*]:justify-start">
          <UserPopup
            defaultValue={{
              id: user.id,
              name: user.name,
              phone: user.phone!,
              email: user.email!,
              role: user.role,
              address: {
                address: user.address?.address!,
                city: user.address?.city!,
                state: user.address?.state!,
                pincode: user.address?.pincode!,
                gstin: user.address?.gstin!,
              },
            }}
            defaultRoles={[
              { label: "User", value: "User" },
              { label: "Admin", value: "admin" },
            ]}
          >
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </UserPopup>
          <Popup
            open={open}
            onOpenChange={setOpen}
            content={
              <div className="p-2 md:p-4 flex flex-col items-stretch text-center gap-5">
                <ErrorFallback
                  error={{
                    message: "Are you absolutely sure?",
                    status: 500,
                    description:
                      "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
                  }}
                />

                <div className="flex flex-col md:flex-row gap-2 justify-stretch [&>*]:flex-1">
                  <Button
                    variant="outline"
                    className="order-2 md:order-1"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="order-1 md:order2"
                    onClick={onRemove}
                  >
                    {remove.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            }
          >
            <Button variant="danger" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </Popup>
        </div>
      }
    >
      <Button className="px-2" variant="ghost">
        <EllipsisVertical className="w-5 h-5" />
      </Button>
    </Popup>
  );
};

export default UserActions;
