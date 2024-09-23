import React from "react";
import { Metadata } from "next";
import { FilePenLine, HandCoins, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBoundary from "@/components/error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Overview from "./components/overview";
import Payments from "./components/payments";
import BestSellers from "./components/best-sellers";

import Expenses from "./components/expenses";
import TopCustomers from "./components/top-customers";
import Employee from "./components/employee";
import IncomeCard from "./components/income-card";
import ExpenseCard from "./components/expense-card";
import ProductCard from "./components/product-card";
import IconCard from "./components/icon-card";
import OrdersCard from "./components/orders-card";
import Shipments from "./components/shipments";

export const metadata: Metadata = {
  title: "Dashboard",
};

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: { [k: string]: string };
}) => {
  return (
    <div className="grid grid-cols-6 gap-4 md:gap-6 [&>div]:relative">
      <div className="col-span-6 md:col-span-4 grid grid-cols-6 gap-4 md:gap-6 [&>div]:relative">
        {/* orders card */}
        <Card className="col-span-6 md:col-span-3 p-6 relative space-y-3">
          <IconCard
            iconColor="bg-violet-600 text-white"
            textColor="text-violet-600"
            icon={ShoppingBag}
            title="Orders"
            href="/orders"
          >
            <ErrorBoundary suspenseFallback={<Skeleton className="w-28 h-4" />}>
              <OrdersCard searchParams={searchParams} />
            </ErrorBoundary>
          </IconCard>
        </Card>
        {/* income card */}
        <Card className="col-span-6 md:col-span-3 p-6 relative space-y-3">
          <IconCard
            iconColor="bg-green-600 text-white"
            textColor="text-green-600"
            icon={HandCoins}
            title="Income"
            href="/orders"
          >
            <ErrorBoundary suspenseFallback={<Skeleton className="w-28 h-4" />}>
              <IncomeCard searchParams={searchParams} />
            </ErrorBoundary>
          </IconCard>
        </Card>

        {/* expense card */}
        <Card className="col-span-6 md:col-span-3 p-6 relative space-y-3">
          <IconCard
            iconColor="bg-red-600 text-white"
            textColor="text-red-600"
            icon={FilePenLine}
            title="Expense"
            href="/expenses"
          >
            <ErrorBoundary suspenseFallback={<Skeleton className="w-28 h-4" />}>
              <ExpenseCard searchParams={searchParams} />
            </ErrorBoundary>
          </IconCard>
        </Card>

        {/* product card */}
        <Card className="col-span-6 md:col-span-3 p-6 relative space-y-3">
          <IconCard
            iconColor="bg-orange-600 text-white"
            textColor="text-orange-600"
            icon={FilePenLine}
            title="Products"
            href="/products/adjustments"
          >
            <ErrorBoundary suspenseFallback={<Skeleton className="w-28 h-4" />}>
              <ProductCard searchParams={searchParams} />
            </ErrorBoundary>
          </IconCard>
        </Card>
      </div>
      {/* payments */}
      <Card className="col-span-6 md:col-span-2">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorBoundary>
            <Payments searchParams={searchParams} />
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* overview */}
      <Card className="col-span-6 md:col-span-4">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ErrorBoundary>
            <Overview searchParams={searchParams} />
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* shipments */}
      <Card className="col-span-6 md:col-span-2">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Shipments</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 min-h-44">
          <ErrorBoundary>
            <Shipments searchParams={searchParams} />
          </ErrorBoundary>
          {/* <EmptyState /> */}
        </CardContent>
      </Card>

      {/* expense */}
      <Card className="col-span-6 md:col-span-3">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorBoundary>
            <Expenses searchParams={searchParams} />
          </ErrorBoundary>
        </CardContent>
      </Card>
      {/* employee */}
      <Card className="col-span-6 md:col-span-3">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorBoundary>
            <Employee searchParams={searchParams} />
          </ErrorBoundary>
        </CardContent>
      </Card>
      {/* best sellers */}
      <Card className="col-span-6 md:col-span-3">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Best Sellers</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[20rem]">
          <ErrorBoundary>
            <BestSellers searchParams={searchParams} />
          </ErrorBoundary>
        </CardContent>
      </Card>
      {/* top customers */}
      <Card className="col-span-6 md:col-span-3 ">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Top Customers</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[20rem]">
          <ErrorBoundary>
            <TopCustomers searchParams={searchParams} />
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
