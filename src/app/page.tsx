import { getUser } from "@/lib/get-user";
import { HomePage } from "./home-page";

export default async function Home() {
  const { user } = await getUser();
  return <HomePage user={user} />;
}
