import { useMasterData } from "@/components/admin/MasterDataSection/useMasterData";

type MasterDataActions = ReturnType<typeof useMasterData>["actions"];

export interface MasterItemViewProps {
  actions: MasterDataActions;
}
