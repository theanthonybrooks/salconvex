import { ConfirmDialog } from "@/components/ui/confirmation-dialog";
import { createContext, useContext, useState } from "react";

type ConfirmAction = {
  label: string;
  description?: string;
  onConfirm: () => void;
};

const ConfirmContext = createContext<{
  confirm: (action: ConfirmAction) => void;
}>({ confirm: () => {} });

export const useConfirmAction = () => useContext(ConfirmContext);

export const ConfirmingDropdown = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pending, setPending] = useState<ConfirmAction | null>(null);

  return (
    <ConfirmContext.Provider
      value={{
        confirm: (action) => setPending(action),
      }}
    >
      {children}
      {pending && (
        <ConfirmDialog
          label={pending.label}
          description={pending.description}
          onConfirm={() => {
            pending.onConfirm();
            setPending(null);
          }}
          onCancel={() => setPending(null)}
          forceMount
        />
      )}
    </ConfirmContext.Provider>
  );
};
