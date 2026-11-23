import {AddressLine} from "@/types/api/address/type";

export const AddressDisplay = ({
                                 title,
                                 address,
                                 className = "",
                                 showVat = false
                               }: {
  title: string;
  address: AddressLine | null;
  className?: string;
  showVat?: boolean;
}) => (
    <div className={className}>
      <p className="w-[184px] text-base font-normal text-black/60 dark:text-white/60">
        {title}
      </p>
      <div className="block cursor-pointer rounded-xl p-2 max-sm:rounded-lg">
        <div className="flex flex-col">
          <p className="text-base font-medium">
            {`${address?.firstName || ""} ${address?.lastName || ""}`}
          </p>
          <p className="text-base font-medium text-zinc-500">
            {`${address?.companyName || ""}`}
          </p>
          {showVat && address?.vat && (
              <p className="text-sm text-zinc-500">
                VAT: {address.vat}
              </p>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-500 max-md:mt-2 max-sm:mt-0">
          {`${address?.address || ""}, ${address?.street || ""}, ${address?.postcode || ""}`}
        </p>
        <p className="text-zinc-500">
          {address?.city || ""} {address?.state || ""},
          {address?.country || ""}
        </p>
        <p className="mt-2 text-sm text-zinc-500 max-md:mt-2 max-sm:mt-0">
          {`T: ${address?.phone || ""}`}
        </p>
      </div>
    </div>
);