import {AddressLine} from "@/types/api/address/type";
import {Card, CardBody} from "@heroui/react";

const AddressCard = ({
                       address,
                       isSelected,
                       onSelect,
                     }: {
  address: AddressLine;
  isSelected: boolean;
  onSelect: () => void;
}) => (
    <Card
        isPressable
        isHoverable
        className={`transition-all duration-200 ${
            isSelected
                ? 'border-2 border-primary bg-primary-50 shadow-md'
                : 'border border-default-200 hover:border-primary-300 hover:shadow-sm'
        }`}
        onPress={onSelect}
    >
      <CardBody className="p-3 min-h-[70px] flex flex-col justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-default-800 truncate">
                {address.firstName} {address.lastName}
                {address.companyName && (
                    <span className="text-xs text-default-600 font-medium ml-2">（{address.companyName}）</span>
                )}
              </p>
            </div>
            {isSelected && (
                <div className="flex items-center justify-center ml-2 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-default-500 line-clamp-1 leading-relaxed">{address.address}, {address.city}, {address.country}</p>
          </div>
        </div>
      </CardBody>
    </Card>
);

export const AddressSelector = ({
                                  title,
                                  addresses,
                                  selectedAddress,
                                  onSelect,
                                }: {
  title: string;
  addresses: AddressLine[];
  selectedAddress: AddressLine | null;
  onSelect: (address: AddressLine | null) => void;
}) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-default-600 mb-2">{title}</h4>
      {addresses.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 h-[450px] overflow-y-auto">
            {addresses.map(address => (
                <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={selectedAddress?.id === address.id}
                    onSelect={() => {
                      if (selectedAddress?.id === address.id) {
                        onSelect(null);
                      } else {
                        onSelect(address);
                      }
                    }}
                />
            ))}
          </div>
      ) : (
          <div className="text-center py-6 px-4 bg-default-50 rounded-lg border border-dashed border-default-300">
            <p className="text-sm text-default-400">No saved addresses available</p>
          </div>
      )}
    </div>
);