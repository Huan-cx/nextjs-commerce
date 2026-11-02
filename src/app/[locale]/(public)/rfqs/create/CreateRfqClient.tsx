"use client";

import CreateRfq from "@/components/b2b/rfq/CreateRfqPage";

interface CreateRfqClientProps {
  step: string;
}

export default function CreateRfqClient({step}: CreateRfqClientProps) {
  return <CreateRfq step={step}/>;
}