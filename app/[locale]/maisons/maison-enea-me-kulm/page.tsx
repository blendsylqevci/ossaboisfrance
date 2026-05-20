import { HouseConfigurator } from "@/components/HouseConfigurator";
import { eneaKulmConfiguratorData } from "@/data/enea-kulm";

export default function MaisonEneaKulmPage() {
  return <HouseConfigurator config={eneaKulmConfiguratorData} />;
}
