"use client";

import { Loader, Trash2 } from "lucide-react";
import Popup from "./custom-ui/popup";
import ErrorFallback from "./error-fallback";
import { Button } from "./ui/button";

interface Props {
  open: boolean;
  onOpenChange: (T: boolean) => void;
  loading: boolean;
  onDelete: () => void;
  content?: {
    title: string;
    description: string;
  };
  actionText?: React.ReactNode;
}
const DeletePopup = ({
  open,
  onOpenChange,
  loading,
  onDelete,
  content,
  actionText,
}: Props) => {
  const { title, description } = content || {};

  const handleRemove = () => {
    onDelete?.();
  };

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      content={
        <div className="p-2 md:p-4 flex flex-col items-stretch text-center gap-6">
          <ErrorFallback
            error={{
              message: title || "Are you absolutely sure?",
              status: 500,
              description:
                description ||
                "This action cannot be undone. It will permanently remove the selected record and all associated data from our servers",
            }}
          />

          <div className="flex flex-col md:flex-row gap-4 justify-stretch [&>*]:flex-1">
            <Button
              variant="outline"
              className="order-2 md:order-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="order-1 md:order2"
              onClick={handleRemove}
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                actionText || (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )
              )}
            </Button>
          </div>
        </div>
      }
    >
      <Button variant="danger" size="sm">
        {actionText || (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </>
        )}
      </Button>
    </Popup>
  );
};

export default DeletePopup;
