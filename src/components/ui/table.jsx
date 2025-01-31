import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm border-separate border-spacing-y-2",
        className
      )}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-white/25 data-[state=selected]:bg-white/25",
      "rounded-lg p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-white/25 font-medium [&>tr]:last:border-b",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("transition-colors hover:bg-white/25 data-[state=selected]:bg-white/25",
    "rounded-lg p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-white first:border-l last:border-r first:border-white/40 last:border-white/40 first:rounded-l-lg last:rounded-r-lg",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle first:rounded-l-lg last:rounded-r-lg first:border-l last:border-r first:border-white/25 last:border-white/25",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-white", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
