import React from "react";

const EmptyState = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-sm text-muted-foreground">No Data</span>
    </div>
  );
};

export default EmptyState;
