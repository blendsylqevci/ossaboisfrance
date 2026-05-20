import { HouseConfigurator } from "@/components/HouseConfigurator";
import { ambreConfiguratorData } from "@/data/ambre";

export default function AmbrePage() {
  return <HouseConfigurator config={ambreConfiguratorData} />;
}
