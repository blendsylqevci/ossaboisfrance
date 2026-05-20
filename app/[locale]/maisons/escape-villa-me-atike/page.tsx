import { HouseConfigurator } from "@/components/HouseConfigurator";
import { escapeVillaAtikeConfiguratorData } from "@/data/escape-villa-atike";

export default function EscapeVillaAtikePage() {
  return <HouseConfigurator config={escapeVillaAtikeConfiguratorData} />;
}
