import { getUserAvailability } from "@/actions/availability";
import AvailabilityForm from "@/components/AvailabilityForm";
import { defaultAvailability } from "@/constants/availability";

const AvailabilityPage = async () => {
  const availability = await getUserAvailability();

  return <AvailabilityForm initialData={availability || defaultAvailability} />;
};

export default AvailabilityPage;