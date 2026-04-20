import RegistrationForm from "@components/customer/RegistrationForm";
import {generateMetadataForPage} from "@utils/helper";
import {staticSeo} from "@utils/metadata";
import {Metadata} from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataForPage("", staticSeo.register);
}

export default async function Register() {
  return <RegistrationForm />;
}
