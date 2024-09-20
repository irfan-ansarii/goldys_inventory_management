import React from "react";
import { Metadata } from "next";
import Pagination from "@/components/pagination";
import UserCard from "../components/user-card";
import { getUsers } from "@/query/users";
import NoDataFallback from "@/components/nodata-fallback";

export const metadata: Metadata = {
  title: "Contacts",
};
const ContactsPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const { data, meta } = await getUsers({
    ...searchParams,
    roles: searchParams.roles
      ? [searchParams.roles]
      : ["customer", "supplier", "employee"],
  });

  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data.map((user) => (
          <UserCard user={user} key={user.id} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default ContactsPage;
