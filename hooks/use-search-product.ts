import { InventoryType } from "@/query/products";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UseWaitForQueryProps {
  isLoading: boolean;
  data: any;
  onComplete: (data: any) => void;
}
const useSearchProduct = ({
  isLoading,
  data,
  onComplete,
}: UseWaitForQueryProps) => {
  const [searchTriggered, setSearchTriggered] = useState(false);

  const toastId = "toast";

  const triggerSearch = () => {
    if (isLoading && searchTriggered)
      toast.loading("Please wait...", { id: toastId });
    setSearchTriggered(true);
  };

  useEffect(() => {
    if (searchTriggered && !isLoading) {
      if (data && data.length === 0) {
        toast.error("Invalid barcode", { id: toastId });
        onComplete(null);
      } else {
        toast.dismiss(toastId);
        onComplete(data);
      }

      setSearchTriggered(false);
    }
  }, [isLoading, searchTriggered, data, onComplete]);

  return { triggerSearch };
};

export default useSearchProduct;
