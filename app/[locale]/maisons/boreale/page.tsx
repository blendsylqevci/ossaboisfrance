import { HouseConfigurator } from "@/components/HouseConfigurator";
import { borealeConfiguratorData } from "@/data/boreale";

export default function BorealePage() {
  return <HouseConfigurator config={borealeConfiguratorData} />;
}
