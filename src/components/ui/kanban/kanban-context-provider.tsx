import type { KanbanPurpose } from "@/constants/kanbanConsts";
import type { User } from "@/types/user";
import type { Id } from "convex/_generated/dataModel";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type DialogMode = "preview" | "edit" | null;

interface KanbanContextType {
  mode: DialogMode;
  cardId: Id<"todoKanban"> | null;
  purpose: KanbanPurpose;
  user: User | null;
  setActiveDialog: (value: {
    mode: DialogMode;
    cardId: Id<"todoKanban"> | null;
  }) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

interface KanbanProviderProps {
  children: ReactNode;
  user: User | null;
  purpose: KanbanPurpose;
}

export function KanbanProvider({
  children,
  user,
  purpose,
}: KanbanProviderProps) {
  const [state, setState] = useState<{
    mode: DialogMode;
    cardId: Id<"todoKanban"> | null;
  }>({
    mode: null,
    cardId: null,
  });

  // Memoize to avoid rerenders when setState changes
  const value = useMemo(
    () => ({
      ...state,
      user,
      purpose,
      setActiveDialog: setState,
    }),
    [state, user, purpose],
  );

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  );
}

export function useKanbanContext() {
  const ctx = useContext(KanbanContext);
  if (!ctx)
    throw new Error("useKanbanContext must be used within a KanbanProvider");
  return ctx;
}
