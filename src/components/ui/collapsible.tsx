import { Collapsible as ArkCollapsible } from "@ark-ui/react/collapsible";
import type { CollapsibleOpenChangeDetails } from "@ark-ui/react/collapsible";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CollapsibleRootProps = ComponentPropsWithoutRef<typeof ArkCollapsible.Root>;

function Collapsible({ className, lazyMount = true, unmountOnExit = true, ...props }: CollapsibleRootProps) {
  return (
    <ArkCollapsible.Root
      className={cn("collapsible-root", className)}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  );
}

function CollapsibleTrigger({ className, ...props }: ComponentPropsWithoutRef<typeof ArkCollapsible.Trigger>) {
  return <ArkCollapsible.Trigger className={cn("collapsible-trigger", className)} {...props} />;
}

function CollapsibleContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof ArkCollapsible.Content>) {
  return (
    <ArkCollapsible.Content className={cn("collapsible-content", className)} {...props}>
      <ArkCollapsible.Context>
        {(ctx) => (
          <div className="collapsible-content-inner" data-state={ctx.open ? "open" : "closed"}>
            {children}
          </div>
        )}
      </ArkCollapsible.Context>
    </ArkCollapsible.Content>
  );
}

function CollapsibleIndicator({ className, ...props }: ComponentPropsWithoutRef<typeof ArkCollapsible.Indicator>) {
  return <ArkCollapsible.Indicator className={cn("collapsible-indicator", className)} {...props} />;
}

function CollapsibleContext({
  children,
}: {
  children: (context: { open: boolean }) => ReactNode;
}) {
  return <ArkCollapsible.Context>{(ctx) => children({ open: ctx.open })}</ArkCollapsible.Context>;
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleContext,
};

export type { CollapsibleOpenChangeDetails };
