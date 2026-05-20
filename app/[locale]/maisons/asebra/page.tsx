import { HouseConfigurator } from "@/components/HouseConfigurator";
import { asebraConfiguratorData } from "@/data/asebra";

export default function AsebraPage() {
  return <HouseConfigurator config={asebraConfiguratorData} />;
}
