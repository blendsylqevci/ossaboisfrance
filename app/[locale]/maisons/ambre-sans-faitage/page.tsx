import { HouseConfigurator } from "@/components/HouseConfigurator";
import { ambreConfiguratorData } from "@/data/ambre";

export default function AmbreSansFaitagePage() {
  return <HouseConfigurator config={ambreConfiguratorData} />;
}
