import { HouseConfigurator } from "@/components/HouseConfigurator";
import { maisonCalmeConfiguratorData } from "@/data/maison-calme";

export default function MaisonCalmePage() {
  return <HouseConfigurator config={maisonCalmeConfiguratorData} />;
}
