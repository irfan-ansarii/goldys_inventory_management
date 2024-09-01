import { LucideProps } from "lucide-react";

export interface NavItemType {
  title: string;
  slug: string;
  label?: {
    text: string;
    variant: string;
  };
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}
